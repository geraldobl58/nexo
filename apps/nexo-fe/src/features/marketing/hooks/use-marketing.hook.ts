"use client";

import { useQuery } from "@tanstack/react-query";
import { MarketingQueryParams } from "../types/marketing.type";
import { getMarketing } from "../services/marketing.service";

/**
 * Retorna a lista paginada dos imóveis do usuário logado.
 *
 * - Retorna todos os status por padrão (DRAFT, ACTIVE, INACTIVE, SOLD, RENTED).
 * - Aguarda o Keycloak estar autenticado antes de disparar a requisição,
 *   evitando condição de corrida entre o cache react-query e o keycloak.init().
 * - O dono só enxerga seus próprios imóveis — isolamento garantido pelo backend.
 *
 * @param params - Filtros opcionais (status, page, limit)
 */

export const MARKETING_KEY = (params: MarketingQueryParams) => {
  return ["marketing", params] as const;
};

export function useMarketing(params: MarketingQueryParams = {}) {
  const query = useQuery({
    queryKey: MARKETING_KEY(params),
    queryFn: () => getMarketing(params),
    enabled: true, // sempre habilitado, pois não depende de autenticação
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return {
    listings: items,
    total,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
