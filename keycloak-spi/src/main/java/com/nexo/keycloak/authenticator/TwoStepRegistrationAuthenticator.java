package com.nexo.keycloak.authenticator;

import com.nexo.keycloak.validation.BrazilianValidators;
import org.jboss.logging.Logger;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.authenticators.browser.AbstractUsernameFormAuthenticator;
import org.keycloak.events.Details;
import org.keycloak.events.Errors;
import org.keycloak.events.EventBuilder;
import org.keycloak.events.EventType;
import org.keycloak.models.*;
import org.keycloak.models.utils.FormMessage;
import org.keycloak.services.managers.AuthenticationManager;
import org.keycloak.services.messages.Messages;
import org.keycloak.services.validation.Validation;

import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Authenticator customizado para ETAPA 1 do registro em duas etapas
 * 
 * RESPONSABILIDADES:
 * 1. Renderizar formulário de registro (STEP 1) via register.ftl
 * 2. Validar campos: firstName, lastName, cpf, phone
 * 3. Criar UserModel com enabled=false (usuário incompleto)
 * 4. Salvar cpf e phone como user attributes
 * 5. Adicionar Required Action "COMPLETE_REGISTRATION" para forçar ETAPA 2
 * 6. Passar o controle para a Required Action
 * 
 * FLUXO TÉCNICO:
 * GET /register
 *   └─> authenticate() → challenge() → renderiza register.ftl com step=1
 * 
 * POST /register (com dados da etapa 1)
 *   └─> action() → valida campos → cria usuário → adiciona required action → success()
 * 
 * SEGURANÇA:
 * - Validação server-side completa
 * - Verificação de unicidade de CPF e telefone
 * - Sanitização de inputs
 * - Usuário criado como DESABILITADO até completar ETAPA 2
 */
public class TwoStepRegistrationAuthenticator implements Authenticator {

    private static final Logger logger = Logger.getLogger(TwoStepRegistrationAuthenticator.class);

    // Nome da Required Action que será executada na ETAPA 2
    public static final String COMPLETE_REGISTRATION_ACTION = "COMPLETE_REGISTRATION";

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        // FLUXO: Usuário acessa /register pela primeira vez
        // AÇÃO: Renderizar o formulário de registro (ETAPA 1)
        
        logger.info("TwoStepRegistrationAuthenticator: Iniciando ETAPA 1 - Identificação");
        challenge(context);
    }

    @Override
    public void action(AuthenticationFlowContext context) {
        // FLUXO: Usuário submeteu o formulário
        // AÇÃO: Verificar qual etapa e processar adequadamente
        
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        EventBuilder event = context.getEvent();
        
        // Verificar qual etapa foi submetida
        String currentStep = context.getAuthenticationSession().getAuthNote("currentStep");
        
        if (currentStep == null || currentStep.equals("1")) {
            // Processar ETAPA 1
            logger.info("TwoStepRegistrationAuthenticator: Processando ETAPA 1");
            processStep1(context, formData, event);
        } else {
            // Processar ETAPA 2
            logger.info("TwoStepRegistrationAuthenticator: Processando ETAPA 2");
            processStep2(context, formData, event);
        }
    }
    
    /**
     * Processa a submissão da ETAPA 1
     */
    private void processStep1(AuthenticationFlowContext context, MultivaluedMap<String, String> formData, EventBuilder event) {
        // Extrair campos do formulário
        String firstName = formData.getFirst("firstName");
        String lastName = formData.getFirst("lastName");
        String cpf = formData.getFirst("user.attributes.cpf");
        String phone = formData.getFirst("user.attributes.phone");

        // Validar todos os campos obrigatórios
        List<FormMessage> errors = validateStep1(context, firstName, lastName, cpf, phone);

        if (!errors.isEmpty()) {
            // Existem erros de validação - reexibir formulário com mensagens de erro
            logger.warnf("Validação falhou na ETAPA 1: %d erros encontrados", errors.size());
            
            Response response = context.form()
                .setErrors(errors)
                .setAttribute("step", "1")
                .setFormData(formData) // Preserva dados digitados
                .createRegistration();
            context.challenge(response);
            return;
        }

        // Salvar dados da ETAPA 1 nas notas de autenticação
        context.getAuthenticationSession().setAuthNote("step1_firstName", firstName.trim());
        context.getAuthenticationSession().setAuthNote("step1_lastName", lastName.trim());
        context.getAuthenticationSession().setAuthNote("step1_cpf", BrazilianValidators.normalizeCPF(cpf));
        context.getAuthenticationSession().setAuthNote("step1_phone", BrazilianValidators.normalizePhone(phone));
        context.getAuthenticationSession().setAuthNote("currentStep", "2");
        
        logger.infof("ETAPA 1 concluída - Dados salvos. Avançando para ETAPA 2");

        // Registrar evento
        event.clone()
            .event(EventType.REGISTER)
            .detail(Details.REGISTER_METHOD, "two-step")
            .detail("step", "1_completed")
            .success();
        
        // Renderizar ETAPA 2
        Response response = context.form()
            .setAttribute("step", "2")
            .setAttribute("firstName", firstName.trim())
            .createRegistration();
        context.challenge(response);
    }
    
    /**
     * Processa a submissão da ETAPA 2 e cria o usuário completo
     */
    private void processStep2(AuthenticationFlowContext context, MultivaluedMap<String, String> formData, EventBuilder event) {
        // Recuperar dados da ETAPA 1
        String firstName = context.getAuthenticationSession().getAuthNote("step1_firstName");
        String lastName = context.getAuthenticationSession().getAuthNote("step1_lastName");
        String cpf = context.getAuthenticationSession().getAuthNote("step1_cpf");
        String phone = context.getAuthenticationSession().getAuthNote("step1_phone");
        
        // Extrair campos da ETAPA 2
        String email = formData.getFirst("email");
        String password = formData.getFirst("password");
        String passwordConfirm = formData.getFirst("password-confirm");
        
        // Validar ETAPA 2
        List<FormMessage> errors = validateStep2(context, email, password, passwordConfirm);
        
        if (!errors.isEmpty()) {
            logger.warnf("Validação falhou na ETAPA 2: %d erros encontrados", errors.size());
            
            Response response = context.form()
                .setErrors(errors)
                .setAttribute("step", "2")
                .setAttribute("firstName", firstName)
                .setFormData(formData) // Preserva email digitado
                .createRegistration();
            context.challenge(response);
            return;
        }
        
        // Criar usuário completo
        try {
            UserModel user = createCompleteUser(context, firstName, lastName, cpf, phone, email, password);
            
            logger.infof("Usuário criado com sucesso: %s (CPF: %s, Email: %s)", 
                user.getUsername(), cpf, email);
            
            // Limpar notas de autenticação
            context.getAuthenticationSession().removeAuthNote("step1_firstName");
            context.getAuthenticationSession().removeAuthNote("step1_lastName");
            context.getAuthenticationSession().removeAuthNote("step1_cpf");
            context.getAuthenticationSession().removeAuthNote("step1_phone");
            context.getAuthenticationSession().removeAuthNote("currentStep");
            
            // Registrar evento
            event.clone()
                .event(EventType.REGISTER)
                .detail(Details.REGISTER_METHOD, "two-step")
                .detail("step", "2_completed")
                .detail(Details.USERNAME, user.getUsername())
                .detail(Details.EMAIL, email)
                .user(user)
                .success();
            
            // Definir usuário e marcar sucesso
            context.setUser(user);
            context.success();
            
        } catch (Exception e) {
            logger.errorf(e, "Erro ao criar usuário na ETAPA 2: %s", e.getMessage());
            
            Response response = context.form()
                .setAttribute("step", "2")
                .setAttribute("firstName", firstName)
                .setError("Erro ao criar conta. Tente novamente.")
                .createRegistration();
            context.challenge(response);
        }
    }

    /**
     * Renderiza o formulário de registro (ETAPA 1)
     * 
     * Este método é chamado tanto no GET inicial quanto em caso de erros de validação.
     * O template register.ftl deve verificar a variável ${step} para exibir os campos corretos.
     */
    private void challenge(AuthenticationFlowContext context) {
        Response response = context.form()
            .setAttribute("step", "1") // IMPORTANTE: Template usa isso para exibir campos da etapa 1
            .createRegistration();
        
        context.challenge(response);
    }

    /**
     * Valida todos os campos da ETAPA 1
     * 
     * VALIDAÇÕES:
     * - firstName: obrigatório, mínimo 2 caracteres
     * - lastName: obrigatório, mínimo 2 caracteres
     * - cpf: obrigatório, formato válido, dígitos verificadores, único no realm
     * - phone: obrigatório, formato brasileiro, único no realm
     * 
     * @return Lista de erros (vazia se tudo estiver válido)
     */
    private List<FormMessage> validateStep1(
        AuthenticationFlowContext context,
        String firstName, 
        String lastName, 
        String cpf, 
        String phone
    ) {
        List<FormMessage> errors = new java.util.ArrayList<>();

        // Validar firstName
        if (Validation.isBlank(firstName)) {
            errors.add(new FormMessage("firstName", Messages.MISSING_FIRST_NAME));
        } else if (firstName.length() < 2) {
            errors.add(new FormMessage("firstName", "O nome deve ter pelo menos 2 caracteres"));
        }

        // Validar lastName
        if (Validation.isBlank(lastName)) {
            errors.add(new FormMessage("lastName", Messages.MISSING_LAST_NAME));
        } else if (lastName.length() < 2) {
            errors.add(new FormMessage("lastName", "O sobrenome deve ter pelo menos 2 caracteres"));
        }

        // Validar CPF
        if (Validation.isBlank(cpf)) {
            errors.add(new FormMessage("user.attributes.cpf", "CPF é obrigatório"));
        } else if (!BrazilianValidators.isValidCPF(cpf)) {
            errors.add(new FormMessage("user.attributes.cpf", "CPF inválido"));
        } else {
            // Verificar unicidade do CPF
            String normalizedCpf = BrazilianValidators.normalizeCPF(cpf);
            if (cpfExists(context, normalizedCpf)) {
                errors.add(new FormMessage("user.attributes.cpf", "Este CPF já está cadastrado"));
            }
        }

        // Validar Telefone
        if (Validation.isBlank(phone)) {
            errors.add(new FormMessage("user.attributes.phone", "Telefone é obrigatório"));
        } else if (!BrazilianValidators.isValidPhone(phone)) {
            errors.add(new FormMessage("user.attributes.phone", "Telefone inválido. Use o formato (11) 99999-9999"));
        } else {
            // Verificar unicidade do telefone
            String normalizedPhone = BrazilianValidators.normalizePhone(phone);
            if (phoneExists(context, normalizedPhone)) {
                errors.add(new FormMessage("user.attributes.phone", "Este telefone já está cadastrado"));
            }
        }

        return errors;
    }
    
    /**
     * Valida todos os campos da ETAPA 2
     */
    private List<FormMessage> validateStep2(
        AuthenticationFlowContext context,
        String email,
        String password,
        String passwordConfirm
    ) {
        List<FormMessage> errors = new java.util.ArrayList<>();
        
        // Validar email
        if (Validation.isBlank(email)) {
            errors.add(new FormMessage("email", Messages.MISSING_EMAIL));
        } else if (!Validation.isEmailValid(email)) {
            errors.add(new FormMessage("email", Messages.INVALID_EMAIL));
        } else {
            // Verificar unicidade do email
            if (emailExists(context, email)) {
                errors.add(new FormMessage("email", "Este email já está cadastrado"));
            }
        }
        
        // Validar senha
        if (Validation.isBlank(password)) {
            errors.add(new FormMessage("password", Messages.MISSING_PASSWORD));
        } else if (password.length() < 8) {
            errors.add(new FormMessage("password", "A senha deve ter no mínimo 8 caracteres"));
        }
        
        // Validar confirmação de senha
        if (Validation.isBlank(passwordConfirm)) {
            errors.add(new FormMessage("password-confirm", "Confirmação de senha é obrigatória"));
        } else if (!password.equals(passwordConfirm)) {
            errors.add(new FormMessage("password-confirm", Messages.INVALID_PASSWORD_CONFIRM));
        }
        
        return errors;
    }

    /**
     * Cria um usuário COMPLETO com todos os dados
     */
    private UserModel createCompleteUser(
        AuthenticationFlowContext context,
        String firstName,
        String lastName,
        String cpf,
        String phone,
        String email,
        String password
    ) {
        KeycloakSession session = context.getSession();
        RealmModel realm = context.getRealm();
        
        // USAR EMAIL COMO USERNAME (padrão moderno)
        // O CPF será salvo como atributo do usuário
        String username = email.toLowerCase().trim();
        
        // Criar usuário com EMAIL como username
        UserModel user = session.users().addUser(realm, username);
        
        // Configurar dados básicos
        user.setEnabled(true); // Usuário já pode fazer login
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email.toLowerCase().trim());
        user.setEmailVerified(false);
        
        // Salvar atributos customizados (CPF e telefone)
        user.setSingleAttribute("cpf", cpf);
        user.setSingleAttribute("phone", phone);
        user.setSingleAttribute("registrationTimestamp", String.valueOf(System.currentTimeMillis()));
        
        // Definir senha
        org.keycloak.models.UserCredentialModel passwordCred = 
            org.keycloak.models.UserCredentialModel.password(password);
        user.credentialManager().updateCredential(passwordCred);
        
        logger.infof("Usuário criado - Username: %s, CPF: %s (atributo)", username, cpf);
        
        return user;
    }

    /**
     * Verifica se já existe um usuário com o CPF informado
     */
    private boolean cpfExists(AuthenticationFlowContext context, String cpf) {
        KeycloakSession session = context.getSession();
        RealmModel realm = context.getRealm();
        
        return session.users()
            .searchForUserByUserAttributeStream(realm, "cpf", cpf)
            .findAny()
            .isPresent();
    }

    /**
     * Verifica se já existe um usuário com o telefone informado
     */
    private boolean phoneExists(AuthenticationFlowContext context, String phone) {
        KeycloakSession session = context.getSession();
        RealmModel realm = context.getRealm();
        
        return session.users()
            .searchForUserByUserAttributeStream(realm, "phone", phone)
            .findAny()
            .isPresent();
    }
    
    /**
     * Verifica se já existe um usuário com o email informado
     */
    private boolean emailExists(AuthenticationFlowContext context, String email) {
        KeycloakSession session = context.getSession();
        RealmModel realm = context.getRealm();
        
        UserModel existingUser = session.users().getUserByEmail(realm, email.toLowerCase().trim());
        return existingUser != null;
    }

    @Override
    public boolean requiresUser() {
        // Este authenticator NÃO requer um usuário existente
        // Ele CRIA o usuário durante o processo
        return false;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        // Não requer configuração específica por usuário
        return true;
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
        // Required actions são definidas explicitamente no método action()
        // Este método não é usado neste fluxo
    }

    @Override
    public void close() {
        // Nenhum recurso precisa ser liberado
    }
}
