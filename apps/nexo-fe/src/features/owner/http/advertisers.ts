import { api } from "@/config/api";

export interface AdvertiserItem {
  id: string;
  type: string;
  status: string;
  name: string;
  email: string;
}

interface PaginatedAdvertisersResponse {
  data: AdvertiserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Busca (ou cria automaticamente) o anunciante vinculado ao usuário autenticado.
 * O endpoint usa o JWT para buscar por keycloakId, com fallback por e-mail.
 * Se não encontrar, cria um anunciante OWNER automaticamente.
 */
export async function getMyAdvertiser(): Promise<AdvertiserItem> {
  const response = await api.get<AdvertiserItem>("/advertisers/me");
  return response.data;
}

/**
 * @deprecated Prefira getMyAdvertiser() que utiliza o endpoint /advertisers/me.
 * Mantido como fallback para contextos sem autenticação.
 */
export async function getAdvertiserByEmail(
  email: string,
): Promise<AdvertiserItem | null> {
  const response = await api.get<PaginatedAdvertisersResponse>("/advertisers", {
    params: { search: email, limit: 50 },
  });

  const match = response.data.data.find(
    (a) => a.email.toLowerCase() === email.toLowerCase(),
  );

  return match ?? null;
}
