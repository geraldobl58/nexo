package com.nexo.keycloak.requiredaction;

import com.nexo.keycloak.validation.BrazilianValidators;
import org.jboss.logging.Logger;
import org.keycloak.authentication.RequiredActionContext;
import org.keycloak.authentication.RequiredActionProvider;
import org.keycloak.events.Details;
import org.keycloak.events.EventBuilder;
import org.keycloak.events.EventType;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.utils.FormMessage;
import org.keycloak.services.messages.Messages;
import org.keycloak.services.validation.Validation;

import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import java.util.List;

/**
 * Required Action para ETAPA 2 do cadastro em duas etapas
 * 
 * RESPONSABILIDADES:
 * 1. Renderizar formulário com campos de email e senha (STEP 2)
 * 2. Validar email (formato + unicidade)
 * 3. Validar senha e confirmação
 * 4. Atualizar UserModel com email e senha
 * 5. ATIVAR o usuário (enabled = true)
 * 6. Remover a própria Required Action
 * 7. Permitir login automático
 * 
 * FLUXO TÉCNICO:
 * Após a ETAPA 1, o Keycloak detecta que o usuário tem a Required Action "COMPLETE_REGISTRATION"
 * e automaticamente redireciona para esta action.
 * 
 * GET (renderização inicial)
 *   └─> challenge() → renderiza register.ftl com step=2
 * 
 * POST (submissão do formulário)
 *   └─> processAction() → valida → atualiza usuário → remove action → success()
 * 
 * SEGURANÇA:
 * - Validação server-side completa
 * - Email único no realm
 * - Política de senha do realm é aplicada automaticamente
 * - Rollback em caso de erro
 */
public class CompleteRegistrationRequiredAction implements RequiredActionProvider {

    private static final Logger logger = Logger.getLogger(CompleteRegistrationRequiredAction.class);

    /**
     * ID da Required Action - deve corresponder ao usado em TwoStepRegistrationAuthenticator
     */
    public static final String PROVIDER_ID = "COMPLETE_REGISTRATION";

    @Override
    public void evaluateTriggers(RequiredActionContext context) {
        // Este método é chamado automaticamente pelo Keycloak para verificar se a action deve ser executada
        // Neste caso, a action é adicionada explicitamente no Authenticator, então não precisamos fazer nada aqui
    }

    @Override
    public void requiredActionChallenge(RequiredActionContext context) {
        // FLUXO: Usuário é redirecionado automaticamente após ETAPA 1
        // AÇÃO: Renderizar formulário da ETAPA 2
        
        logger.info("CompleteRegistrationRequiredAction: Iniciando ETAPA 2 - Finalização da Conta");
        
        UserModel user = context.getUser();
        
        // Recuperar dados da ETAPA 1 das notas de autenticação
        String firstName = context.getAuthenticationSession().getAuthNote("step1_firstName");
        String lastName = context.getAuthenticationSession().getAuthNote("step1_lastName");
        String cpf = context.getAuthenticationSession().getAuthNote("step1_cpf");
        String phone = context.getAuthenticationSession().getAuthNote("step1_phone");
        
        // Log para auditoria
        logger.infof("ETAPA 2 renderizada - Dados recuperados: firstName=%s, cpf=%s", firstName, cpf);
        
        // Renderizar formulário com step=2
        Response response = context.form()
            .setAttribute("step", "2") // CRÍTICO: Template usa isso para exibir campos da etapa 2
            .setAttribute("firstName", firstName)
            .setAttribute("lastName", lastName)
            .createForm("register.ftl"); // Usa o mesmo template, mas com step=2
        
        context.challenge(response);
    }

    @Override
    public void processAction(RequiredActionContext context) {
        // FLUXO: Usuário submeteu o formulário da ETAPA 2
        // AÇÃO: Validar e completar o cadastro
        
        logger.info("CompleteRegistrationRequiredAction: Processando submissão da ETAPA 2");
        
        EventBuilder event = context.getEvent();
        UserModel user = context.getUser();
        KeycloakSession session = context.getSession();
        RealmModel realm = context.getRealm();
        
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        
        // Extrair campos do formulário
        String email = formData.getFirst("email");
        String password = formData.getFirst("password");
        String passwordConfirm = formData.getFirst("password-confirm");
        
        // Validar campos
        List<FormMessage> errors = validateStep2(context, email, password, passwordConfirm);
        
        if (!errors.isEmpty()) {
            // Existem erros - reexibir formulário com mensagens
            logger.warnf("Validação falhou na ETAPA 2: %d erros encontrados", errors.size());
            
            Response response = context.form()
                .setAttribute("step", "2")
                .setErrors(errors)
                .createForm("register.ftl");
            
            context.challenge(response);
            return; // Interrompe o fluxo
        }
        
        // ========================================
        // CONCLUSÃO DO CADASTRO (ETAPA 2)
        // ========================================
        
        try {
            // Recuperar dados da ETAPA 1
            String cpf = context.getAuthenticationSession().getAuthNote("step1_cpf");
            String phone = context.getAuthenticationSession().getAuthNote("step1_phone");
            String firstName = context.getAuthenticationSession().getAuthNote("step1_firstName");
            String lastName = context.getAuthenticationSession().getAuthNote("step1_lastName");
            
            // Atualizar dados completos do usuário
            user.setEmail(email.toLowerCase().trim());
            user.setEmailVerified(false);
            
            // Garantir que firstName e lastName estão atualizados
            user.setFirstName(firstName);
            user.setLastName(lastName);
            
            // Salvar atributos customizados
            user.setSingleAttribute("cpf", cpf);
            user.setSingleAttribute("phone", phone);
            
            // Definir senha usando UserCredentialManager
            org.keycloak.models.UserCredentialModel passwordCred = 
                org.keycloak.models.UserCredentialModel.password(password);
            user.credentialManager().updateCredential(passwordCred);
            
            // ATIVAR O USUÁRIO - agora ele pode fazer login
            user.setEnabled(true);
            
            // Remover flag temporário
            user.removeAttribute("temp_registration");
            
            // Atualizar metadados
            user.setSingleAttribute("registrationCompletedTimestamp", String.valueOf(System.currentTimeMillis()));
            
            // Limpar notas de autenticação
            context.getAuthenticationSession().removeAuthNote("step1_firstName");
            context.getAuthenticationSession().removeAuthNote("step1_lastName");
            context.getAuthenticationSession().removeAuthNote("step1_cpf");
            context.getAuthenticationSession().removeAuthNote("step1_phone");
            
            logger.infof("ETAPA 2 concluída - Usuário ativado: %s (CPF: %s, Email: %s)", 
                user.getUsername(), cpf, email);
            
            // Registrar evento de conclusão
            event.clone()
                .event(EventType.REGISTER)
                .detail(Details.REGISTER_METHOD, "two-step")
                .detail("step", "2_completed")
                .detail(Details.EMAIL, email)
                .detail(Details.USERNAME, user.getUsername())
                .user(user)
                .success();
            
            // REMOVER A REQUIRED ACTION (importante para não entrar em loop)
            user.removeRequiredAction(PROVIDER_ID);
            
            // Marcar como sucesso - usuário será autenticado automaticamente
            context.success();
            
        } catch (Exception e) {
            logger.errorf(e, "Erro ao completar cadastro na ETAPA 2: %s", e.getMessage());
            
            // Em caso de erro, reexibir formulário com mensagem genérica
            Response response = context.form()
                .setAttribute("step", "2")
                .setError("Erro ao completar cadastro. Tente novamente.")
                .createForm("register.ftl");
            
            context.challenge(response);
        }
    }

    /**
     * Valida todos os campos da ETAPA 2
     * 
     * VALIDAÇÕES:
     * - email: obrigatório, formato válido, único no realm
     * - password: obrigatório, mínimo 8 caracteres (+ política do realm)
     * - password-confirm: deve ser igual ao password
     * 
     * @return Lista de erros (vazia se tudo estiver válido)
     */
    private List<FormMessage> validateStep2(
        RequiredActionContext context,
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
     * Verifica se já existe um usuário com o email informado
     * Exclui o próprio usuário da busca (caso ele esteja reenviando o form)
     */
    private boolean emailExists(RequiredActionContext context, String email) {
        KeycloakSession session = context.getSession();
        RealmModel realm = context.getRealm();
        UserModel currentUser = context.getUser();
        
        UserModel existingUser = session.users().getUserByEmail(realm, email.toLowerCase().trim());
        
        // Se não existe nenhum usuário com esse email, OK
        if (existingUser == null) {
            return false;
        }
        
        // Se o usuário encontrado é o próprio usuário atual, OK (resubmit do form)
        return !existingUser.getId().equals(currentUser.getId());
    }

    @Override
    public void close() {
        // Nenhum recurso precisa ser liberado
    }
}
