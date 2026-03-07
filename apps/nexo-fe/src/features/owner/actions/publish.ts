/**
 * Ação de publicação de imóvel (client-side).
 * Usa o Axios com interceptor do Keycloak — não pode ser Server Action.
 */

import { createPublish, uploadMedia } from "../http/publish";

import {
  CreatePublishActionState,
  CreatePublishInput,
} from "../types/publish-types";

import { toCents } from "@/lib/formatted-money";

/**
 * Cria uma nova publicação.
 * Deve ser chamada no client-side para que o token do Keycloak esteja disponível.
 *
 * @param input - Dados da publicação
 * @returns Estado da operação
 */
export async function createPublication(
  input: CreatePublishInput,
): Promise<CreatePublishActionState> {
  try {
    // Converte preços de reais para centavos antes de enviar
    const payload: CreatePublishInput = {
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

/**
 * Faz upload de todos os arquivos de mídia para um imóvel já criado.
 *
 * O upload é feito em série para preservar a ordem da galeria.
 * Falhas parciais não interrompem o fluxo — o imóvel já foi criado.
 *
 * @param propertyId - UUID do imóvel recém criado
 * @param files      - Arquivos selecionados pelo usuário no step de fotos
 * @param onProgress - Callback chamado após cada arquivo enviado com sucesso
 * @returns Número de arquivos enviados com sucesso
 */
export async function uploadMediaFiles(
  propertyId: string,
  files: File[],
  onProgress?: (uploaded: number, total: number) => void,
): Promise<number> {
  let uploaded = 0;

  for (const file of files) {
    try {
      await uploadMedia(propertyId, file);
      uploaded++;
      onProgress?.(uploaded, files.length);
    } catch {
      // Log sem bloquear: o imóvel já está criado, falha no upload é recuperável.
      console.warn(
        `Falha ao enviar "${file.name}" — upload pode ser retentado no painel.`,
      );
    }
  }

  return uploaded;
}
