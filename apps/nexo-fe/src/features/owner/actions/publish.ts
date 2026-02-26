/**
 * Ação de publicação de imóvel (client-side).
 * Usa o Axios com interceptor do Keycloak — não pode ser Server Action.
 */

import { createPublish } from "../http/publish";
import {
  CreatePublishActionState,
  CreatePusblishInput,
} from "../types/publish-types";

/**
 * Converte reais → centavos. O formulário armazena valores em reais;
 * a API espera centavos (R$ 350.000 = 35000000).
 */
function toCents(value?: number): number | undefined {
  if (value === undefined || value === null) return undefined;
  return Math.round(value * 100);
}

/**
 * Cria uma nova publicação.
 * Deve ser chamada no client-side para que o token do Keycloak esteja disponível.
 *
 * @param input - Dados da publicação
 * @returns Estado da operação
 */
export async function createPublication(
  input: CreatePusblishInput,
): Promise<CreatePublishActionState> {
  try {
    // Converte preços de reais para centavos antes de enviar
    const payload: CreatePusblishInput = {
      ...input,
      price: toCents(input.price)!,
      condominiumFee: toCents(input.condominiumFee),
      iptuYearly: toCents(input.iptuYearly),
    };

    const data = await createPublish(payload);

    return {
      success: true,
      message: "Publicação criada com sucesso",
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Erro ao criar publicação",
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao criar publicação",
    };
  }
}
