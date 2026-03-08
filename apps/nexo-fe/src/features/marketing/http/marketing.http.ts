/**
 * Módulo HTTP da feature "Marketing".
 *
 * Funções disponíveis:
 *  getMarketing      — GET    /marketing        — lista todos os imoveis do sistema
 *  getMarketingById   — GET    /marketing/:id    — retorna um imóvel pelo id
 */

import { api } from "@/config/api";
import {
  MarketingQueryParams,
  PaginatedMarketingResponse,
} from "../types/marketing.type";

/**
 * Lista todos os imóveis base no plano (Free, Premium, Super).
 *
 * Endpoint: GET /marketing
 *
 * @param params - Filtros (status, page, limit)
 * @returns Lista paginada dos imóveis do sistema
 */

export async function getMarketing(
  params: MarketingQueryParams = {},
): Promise<PaginatedMarketingResponse> {
  const response = await api.get<PaginatedMarketingResponse>("/marketing", {
    params,
  });

  return response.data;
}
