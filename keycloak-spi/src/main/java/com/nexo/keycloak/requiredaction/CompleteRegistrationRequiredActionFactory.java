package com.nexo.keycloak.requiredaction;

import org.keycloak.Config;
import org.keycloak.authentication.RequiredActionFactory;
import org.keycloak.authentication.RequiredActionProvider;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;

/**
 * Factory para CompleteRegistrationRequiredAction
 * 
 * Esta classe é responsável por:
 * 1. Registrar a Required Action no Keycloak SPI
 * 2. Definir metadados (ID, nome, descrição)
 * 3. Fornecer instâncias da Required Action quando necessário
 * 
 * IMPORTANTE:
 * O ID definido aqui (PROVIDER_ID) deve ser o mesmo usado em:
 * - TwoStepRegistrationAuthenticator.COMPLETE_REGISTRATION_ACTION
 * - CompleteRegistrationRequiredAction.PROVIDER_ID
 */
public class CompleteRegistrationRequiredActionFactory implements RequiredActionFactory {

    /**
     * ID único da Required Action
     * CRÍTICO: Deve corresponder ao usado no Authenticator
     */
    public static final String PROVIDER_ID = "COMPLETE_REGISTRATION";

    @Override
    public String getDisplayText() {
        // Texto exibido no Admin Console do Keycloak
        return "Complete Registration - Step 2";
    }

    @Override
    public RequiredActionProvider create(KeycloakSession session) {
        // Cria uma nova instância da Required Action
        return new CompleteRegistrationRequiredAction();
    }

    @Override
    public void init(Config.Scope config) {
        // Inicialização global (opcional)
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
        // Pós-inicialização (opcional)
    }

    @Override
    public void close() {
        // Limpeza de recursos (opcional)
    }

    @Override
    public String getId() {
        // Retorna o ID único da Required Action
        return PROVIDER_ID;
    }

    @Override
    public boolean isOneTimeAction() {
        // Define se a action deve ser removida automaticamente após execução
        // TRUE: É executada apenas UMA VEZ (nosso caso)
        // FALSE: Pode ser executada múltiplas vezes
        return true;
    }
}
