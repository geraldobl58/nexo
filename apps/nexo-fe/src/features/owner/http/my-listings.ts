/**
 * Módulo HTTP da feature "Meus Imóveis".
 *
 * Funções disponíveis:
 *  getMyListings      — GET    /marketing/me        — lista os imóveis do dono autenticado
 *  getMyListingById   — GET    /marketing/me/:id    — retorna um imóvel pelo id
 *  updateMyListing    — PATCH  /marketing/me/:id       — atualiza campos do imóvel
 *  deleteMyListing    — DELETE /marketing/me/:id       — remove o imóvel (soft delete)
 *  publishMyListing   — PATCH  /marketing/me/:id/publish   — DRAFT → ACTIVE
 *  unpublishMyListing — PATCH  /marketing/me/:id/unpublish — ACTIVE → INACTIVE
 */

import { api } from "@/config/api";
import {
  CreatePublishResponse,
  MyListingsQueryParams,
  PaginatedMyListingsResponse,
  UpdateListingInput,
} from "../types/publish-types";

/**
 * Lista todos os imóveis do usuário autenticado (todos os status por padrão).
 *
 * Endpoint: GET /marketing/me
 * Auth: Bearer JWT (obrigatório)
 *
 * O token JWT identifica o dono — os dados de outros usuários
 * nunca são retornados por este endpoint.
 *
 * @param params - Filtros opcionais (status, page, limit)
 * @returns Lista paginada dos imóveis do dono
 */
export async function getMyListings(
  params: MyListingsQueryParams = {},
): Promise<PaginatedMyListingsResponse> {
  const response = await api.get<PaginatedMyListingsResponse>("/marketing/me", {
    params,
  });
  return response.data;
}

/**
 * Lista todos os imóveis do usuário autenticado (todos os status por padrão).
 *
 * Endpoint: GET /
 * Auth: Bearer JWT (obrigatório)
 *
 * O token JWT identifica o dono — os dados de outros usuários
 * nunca são retornados por este endpoint.
 *
 * @param params - Sem filtros, retorna o imóvel com status ACTIVE
 * @returns Retorna o imóvel com o id especificado
 */

export async function getMyListingById(
  id: string,
): Promise<CreatePublishResponse> {
  const response = await api.get<CreatePublishResponse>(`/marketing/me/${id}`);
  return response.data;
}

/**
 * Atualiza campos de um imóvel (PATCH semântico — apenas os campos enviados
 * são alterados). Status é gerenciado por /publish e /unpublish.
 *
 * Endpoint: PATCH /marketing/me/:id
 * Auth: Bearer JWT (obrigatório — somente o dono pode alterar)
 *
 * @param id    - UUID do imóvel
 * @param input - Campos a atualizar (parcial de CreatePublishInput)
 * @returns Imóvel atualizado
 */
export async function updateMyListing(
  id: string,
  input: UpdateListingInput,
): Promise<CreatePublishResponse> {
  const response = await api.patch<CreatePublishResponse>(
    `/marketing/me/${id}`,
    input,
  );
  return response.data;
}

/**
 * Remove um imóvel (soft delete — o backend preenche deletedAt).
 * O registro sai de todas as buscas mas permanece no banco para auditoria.
 *
 * Endpoint: DELETE /marketing/me/:id
 * Auth: Bearer JWT (obrigatório — somente o dono pode excluir)
 * Retorno: 204 No Content
 *
 * @param id - UUID do imóvel
 */
export async function deleteMyListing(id: string): Promise<void> {
  await api.delete(`/marketing/me/${id}`);
}

/**
 * Publica um imóvel: muda o status de DRAFT para ACTIVE,
 * tornando-o visível nas buscas.
 *
 * Endpoint: PATCH /marketing/me/:id/publish
 * Auth: Bearer JWT (obrigatório)
 *
 * @param id - UUID do imóvel
 * @returns Imóvel com status ACTIVE
 */
export async function publishMyListing(
  id: string,
): Promise<CreatePublishResponse> {
  const response = await api.patch<CreatePublishResponse>(
    `/marketing/me/${id}/publish`,
  );
  return response.data;
}

/**
 * Despublica um imóvel: muda o status de ACTIVE para INACTIVE.
 * O imóvel sai das buscas mas todos os dados são mantidos.
 *
 * Endpoint: PATCH /marketing/me/:id/unpublish
 * Auth: Bearer JWT (obrigatório)
 *
 * @param id - UUID do imóvel
 * @returns Imóvel com status INACTIVE
 */
export async function unpublishMyListing(
  id: string,
): Promise<CreatePublishResponse> {
  const response = await api.patch<CreatePublishResponse>(
    `/marketing/me/${id}/unpublish`,
  );
  return response.data;
}

/**
 * Reativa um imóvel: muda o status de INACTIVE para ACTIVE.
 *
 * Endpoint: PATCH /marketing/me/:id/reactivate
 * Auth: Bearer JWT (obrigatório)
 *
 * @param id - UUID do imóvel
 * @returns Imóvel com status ACTIVE
 */
export async function reactivateMyListing(
  id: string,
): Promise<CreatePublishResponse> {
  const response = await api.patch<CreatePublishResponse>(
    `/marketing/me/${id}/reactivate`,
  );
  return response.data;
}
