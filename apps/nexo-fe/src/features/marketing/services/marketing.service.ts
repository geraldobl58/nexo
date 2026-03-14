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
  MarketingResponse,
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
  const { data } = await api.get<PaginatedMarketingResponse>("/marketing", {
    params,
  });

  return data;
}

/**
 * Busca um imóvel pelo slug (URL amigável).
 *
 * Endpoint: GET /marketing/slug/:slug
 *
 * @param slug - URL amigável do imóvel
 * @returns Dados completos do imóvel
 */
export async function getMarketingBySlug(
  slug: string,
): Promise<MarketingResponse> {
  const { data } = await api.get<MarketingResponse>(
    `/marketing/slug/${encodeURIComponent(slug)}`,
  );
  return data;
}
