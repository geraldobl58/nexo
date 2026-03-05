/**
 * Ações de gerenciamento dos imóveis do dono autenticado (client-side).
 * Usa o Axios com interceptor do Keycloak — não pode ser Server Action.
 */

import {
  deleteMyListing,
  publishMyListing,
  reactivateMyListing,
  unpublishMyListing,
  updateMyListing,
} from "../http/my-listings";
import { createPublish } from "../http/publish";
import {
  CreatePublishActionState,
  CreatePublishInput,
  DeleteListingActionState,
  PublishListingActionState,
  UnpublishListingActionState,
  UpdateListingActionState,
  UpdateListingInput,
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
 * Remove campos com valor string vazio ("") do objeto para que o backend
 * os interprete como ausentes (undefined), evitando erros de validação
 * como `@IsEmail()` para campos opcionais não preenchidos.
 */
function stripEmptyStrings<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== ""),
  ) as T;
}

/**
 * Cria um novo imóvel com status DRAFT.
 *
 * @param input - Dados do imóvel
 * @returns Estado da operação
 */
export async function createListing(
  input: CreatePublishInput,
): Promise<CreatePublishActionState> {
  try {
    const payload: CreatePublishInput = {
      ...input,
      ...(input.price !== undefined && { price: toCents(input.price)! }),
      ...(input.condominiumFee !== undefined && {
        condominiumFee: toCents(input.condominiumFee),
      }),
      ...(input.iptuYearly !== undefined && {
        iptuYearly: toCents(input.iptuYearly),
      }),
    };

    const data = await createPublish(payload);

    return {
      success: true,
      message: "Imóvel criado com sucesso",
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Erro ao criar imóvel",
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao criar imóvel",
    };
  }
}

/**
 * Atualiza campos de um imóvel existente (PATCH semântico).
 * Apenas os campos informados são alterados no backend.
 *
 * @param id    - UUID do imóvel
 * @param input - Campos a atualizar
 * @returns Estado da operação
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput,
): Promise<UpdateListingActionState> {
  try {
    const payload: UpdateListingInput = stripEmptyStrings({
      ...input,
      ...(input.price !== undefined && { price: toCents(input.price)! }),
      ...(input.condominiumFee !== undefined && {
        condominiumFee: toCents(input.condominiumFee),
      }),
      ...(input.iptuYearly !== undefined && {
        iptuYearly: toCents(input.iptuYearly),
      }),
    });

    const data = await updateMyListing(id, payload);

    return {
      success: true,
      message: "Imóvel atualizado com sucesso",
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Erro ao atualizar imóvel",
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao atualizar imóvel",
    };
  }
}

/**
 * Remove um imóvel (soft delete).
 * O registro sai de todas as buscas mas permanece no banco para auditoria.
 *
 * @param id - UUID do imóvel
 * @returns Estado da operação
 */
export async function deleteListing(
  id: string,
): Promise<DeleteListingActionState> {
  try {
    await deleteMyListing(id);

    return {
      success: true,
      message: "Imóvel excluído com sucesso",
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Erro ao excluir imóvel",
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao excluir imóvel",
    };
  }
}

/**
 * Publica um imóvel: altera o status de DRAFT para ACTIVE,
 * tornando-o visível nas buscas do portal.
 *
 * @param id - UUID do imóvel
 * @returns Estado da operação
 */
export async function publishListing(
  id: string,
): Promise<PublishListingActionState> {
  try {
    const data = await publishMyListing(id);

    return {
      success: true,
      message: "Imóvel publicado com sucesso",
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Erro ao publicar imóvel",
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao publicar imóvel",
    };
  }
}

/**
 * Despublica um imóvel: altera o status de ACTIVE para INACTIVE.
 * O imóvel sai das buscas mas todos os dados são mantidos.
 *
 * @param id - UUID do imóvel
 * @returns Estado da operação
 */
export async function unpublishListing(
  id: string,
): Promise<UnpublishListingActionState> {
  try {
    const data = await unpublishMyListing(id);

    return {
      success: true,
      message: "Imóvel despublicado com sucesso",
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Erro ao despublicar imóvel",
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao despublicar imóvel",
    };
  }
}

/**
 * Reativa um imóvel: altera o status de INACTIVE para ACTIVE.
 *
 * @param id - UUID do imóvel
 * @returns Estado da operação
 */
export async function reactivateListing(
  id: string,
): Promise<PublishListingActionState> {
  try {
    const data = await reactivateMyListing(id);

    return {
      success: true,
      message: "Imóvel reativado com sucesso",
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Erro ao reativar imóvel",
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao reativar imóvel",
    };
  }
}
