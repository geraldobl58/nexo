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
 * Usa GET /marketing/me (autenticado) para garantir isolamento por usuário.
 * Consulta cada status individualmente (limit=1) e soma os totais.
 *
 * @returns Total de anúncios cadastrados pelo usuário (todos os status)
 */
export async function getMyListingsCount(): Promise<number> {
  const results = await Promise.all(
    ALL_LISTING_STATUSES.map(
      (status) =>
        api
          .get<PaginatedCountResponse>("/marketing/me", {
            params: { status, limit: 1, page: 1 },
          })
          .then((r) => r.data.total)
          .catch(() => 0), // ignora erros pontuais de um status específico
    ),
  );

  return results.reduce((sum, total) => sum + total, 0);
}
