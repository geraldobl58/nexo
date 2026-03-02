/**
 * Módulo HTTP da feature de publicação de imóvel.
 *
 * Funções disponíveis:
 *  createPublish       — POST /marketing        — cria o imóvel (DRAFT)
 *  uploadMedia         — POST /marketing/:id/media   — faz upload de foto/vídeo
 *  listMedia           — GET  /marketing/:id/media   — lista mídias do imóvel
 *  reorderMedia        — PATCH /marketing/:id/media/reorder — reordena galeria
 *  deleteMedia         — DELETE /marketing/:id/media/:mediaId — remove mídia
 */

import { api } from "@/config/api";
import {
  CreatePublishResponse,
  CreatePublishInput,
  MediaItem,
  MediaOrderItem,
} from "../types/publish-types";

// ---------------------------------------------------------------------------
// Imóvel
// ---------------------------------------------------------------------------

/**
 * Cria um novo imóvel com status DRAFT.
 *
 * Endpoint: POST /marketing
 *
 * O token JWT (header Authorization) identifica o dono — não enviar userId.
 * Preços devem estar em centavos (a conversão ocorre em actions/publish.ts).
 *
 * @param data - Dados do imóvel
 * @returns Imóvel criado (sem mídias ainda)
 */
export async function createPublish(
  data: CreatePublishInput,
): Promise<CreatePublishResponse> {
  const response = await api.post<CreatePublishResponse>("/marketing", data);
  return response.data;
}

// ---------------------------------------------------------------------------
// Mídia
// ---------------------------------------------------------------------------

/**
 * Faz upload de uma foto ou vídeo para o Cloudinary e salva a referência.
 *
 * Endpoint: POST /marketing/:propertyId/media
 * Content-Type: multipart/form-data (campo "file")
 *
 * Limites aceitos pelo backend:
 *   Imagens (JPEG/PNG/WebP): máx. 10 MB — até 20 por imóvel
 *   Vídeos (MP4/MOV):        máx. 100 MB — até 2 por imóvel
 *
 * @param propertyId - UUID do imóvel
 * @param file       - Arquivo selecionado pelo usuário
 * @returns Mídia criada com URL pública do Cloudinary
 */
export async function uploadMedia(
  propertyId: string,
  file: File,
): Promise<MediaItem> {
  const form = new FormData();
  form.append("file", file);

  const response = await api.post<MediaItem>(
    `/marketing/${propertyId}/media`,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
}

/**
 * Lista todas as mídias de um imóvel ordenadas por posição na galeria.
 *
 * Endpoint: GET /marketing/:propertyId/media
 *
 * @param propertyId - UUID do imóvel
 * @returns Array de mídias ordenadas (order ASC)
 */
export async function listMedia(propertyId: string): Promise<MediaItem[]> {
  const response = await api.get<MediaItem[]>(`/marketing/${propertyId}/media`);
  return response.data;
}

/**
 * Reordena a galeria de mídias de um imóvel.
 *
 * Endpoint: PATCH /marketing/:propertyId/media/reorder
 *
 * Enviar todos os itens da galeria com as novas posições.
 * Posições são 0-based (0 = capa).
 *
 * @param propertyId - UUID do imóvel
 * @param items      - Array com { id, order } de cada mídia
 */
export async function reorderMedia(
  propertyId: string,
  items: MediaOrderItem[],
): Promise<void> {
  await api.patch(`/marketing/${propertyId}/media/reorder`, { items });
}

/**
 * Remove uma mídia do imóvel (deleta do Cloudinary e do banco).
 *
 * Endpoint: DELETE /marketing/:propertyId/media/:mediaId
 *
 * @param propertyId - UUID do imóvel
 * @param mediaId    - UUID da mídia a remover
 */
export async function deleteMedia(
  propertyId: string,
  mediaId: string,
): Promise<void> {
  await api.delete(`/marketing/${propertyId}/media/${mediaId}`);
}
