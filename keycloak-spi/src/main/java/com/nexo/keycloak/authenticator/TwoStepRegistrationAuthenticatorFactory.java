package com.nexo.keycloak.authenticator;

import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

import java.util.Collections;
import java.util.List;

/**
 * Factory para o TwoStepRegistrationAuthenticator
 * 
 * Esta classe é responsável por:
 * 1. Registrar o Authenticator no Keycloak SPI
 * 2. Definir metadados (ID, nome, descrição)
 * 3. Fornecer instâncias do Authenticator quando necessário
 * 
 * O Keycloak usa o padrão Factory para gerenciar o ciclo de vida dos providers.
 * Esta classe é descoberta automaticamente via Service Provider Interface (SPI).
 */
public class TwoStepRegistrationAuthenticatorFactory implements AuthenticatorFactory {

    /**
     * ID único do provider
     * Usado para referenciá-lo em configurações e flows
     */
    public static final String PROVIDER_ID = "two-step-registration-authenticator";

    @Override
    public String getDisplayType() {
        // Nome exibido no Admin Console do Keycloak
        return "Two-Step Registration";
    }

    @Override
    public String getReferenceCategory() {
        // Categoria para organização no Admin Console
        return "registration";
    }

    @Override
    public boolean isConfigurable() {
        // Este authenticator não possui configurações customizáveis via UI
        return false;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        // Define quais tipos de requirement são suportados
        // REQUIRED: Deve ser executado obrigatoriamente
        // ALTERNATIVE: Pode ser alternativa a outros authenticators
        // DISABLED: Pode ser desabilitado
        return new AuthenticationExecutionModel.Requirement[]{
            AuthenticationExecutionModel.Requirement.REQUIRED,
            AuthenticationExecutionModel.Requirement.ALTERNATIVE,
            AuthenticationExecutionModel.Requirement.DISABLED
        };
    }

    @Override
    public boolean isUserSetupAllowed() {
        // Este authenticator NÃO permite setup por usuário individual
        return false;
    }

    @Override
    public String getHelpText() {
        // Texto de ajuda exibido no Admin Console
        return "Authenticator customizado para registro em duas etapas. " +
               "ETAPA 1: Coleta nome, CPF e telefone. " +
               "ETAPA 2: Coleta email e senha (via Required Action).";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        // Este authenticator não possui propriedades de configuração
        return Collections.emptyList();
    }

    @Override
    public Authenticator create(KeycloakSession session) {
        // Cria uma nova instância do Authenticator
        // Chamado toda vez que o authenticator é necessário
        return new TwoStepRegistrationAuthenticator();
    }

    @Override
    public void init(Config.Scope config) {
        // Inicialização global do provider (opcional)
        // Executado uma vez quando o Keycloak inicia
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
        // Pós-inicialização (opcional)
        // Útil para registrar listeners ou configurar recursos compartilhados
    }

    @Override
    public void close() {
        // Limpeza de recursos quando o provider é descarregado (opcional)
    }

    @Override
    public String getId() {
        // Retorna o ID único do provider
        // CRÍTICO: Deve corresponder ao PROVIDER_ID
        return PROVIDER_ID;
    }
}
