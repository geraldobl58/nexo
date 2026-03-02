import { api } from "@/config/api";

interface PaginatedCountResponse {
  total: number;
}

// Todos os status possíveis de um anúncio
const ALL_LISTING_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "SOLD",
  "RENTED",
] as const;

/**
 * Retorna o total de anúncios do usuário logado somando todos os status.
 *
 * O backend filtra por ACTIVE por padrão, então é preciso consultar cada status
 * individualmente (com limit=1 para minimizar payload) e somar os totais.
 * O usuário autenticado pode ver seus próprios anúncios de qualquer status.
 *
 * @param advertiserId - UUID do usuário logado (campo `id` do User)
 * @returns Total de anúncios cadastrados pelo usuário (todos os status)
 */
export async function getMyListingsCount(
  advertiserId: string,
): Promise<number> {
  const results = await Promise.all(
    ALL_LISTING_STATUSES.map(
      (status) =>
        api
          .get<PaginatedCountResponse>("/marketing", {
            params: { advertiserId, status, limit: 1, page: 1 },
          })
          .then((r) => r.data.total)
          .catch(() => 0), // ignora erros pontuais de um status específico
    ),
  );

  return results.reduce((sum, total) => sum + total, 0);
}
