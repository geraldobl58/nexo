/**
 * Funções HTTP públicas para anúncios (sem autenticação).
 * Usadas nas páginas de portal/marketing acessíveis a qualquer visitante.
 */

import { api } from "@/config/api";
import { CreatePublishResponse } from "../types/publish-types";

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
