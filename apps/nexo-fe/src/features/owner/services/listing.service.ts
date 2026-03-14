/**
 * Funções HTTP públicas para anúncios (sem autenticação).
 * Usadas nas páginas de portal/marketing acessíveis a qualquer visitante.
 */

import { api } from "@/config/api";
import { CreatePublishResponse } from "../types/publish.type";

/**
 * Busca os dados completos de um anúncio público.
 *
 * Endpoint: GET /marketing/:id
 * Auth: Nenhuma (público)
 */
export async function getListingById(
  id: string,
): Promise<CreatePublishResponse> {
  const response = await api.get<CreatePublishResponse>(`/marketing/${id}`);
  return response.data;
}

/**
 * Busca os dados completos de um anúncio pelo slug (URL amigável).
 *
 * Endpoint: GET /marketing/slug/:slug
 * Auth: Nenhuma (público)
 */
export async function getListingBySlug(
  slug: string,
): Promise<CreatePublishResponse> {
  const response = await api.get<CreatePublishResponse>(
    `/marketing/slug/${slug}`,
  );
  return response.data;
}
