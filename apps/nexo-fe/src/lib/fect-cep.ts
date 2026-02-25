// ---------------------------------------------------------------------------
// Coordenadas padrão: centro do Brasil
// ---------------------------------------------------------------------------

import { BrasilApiCepResponse } from "@/features/owner/types/publish-location-types";

export const DEFAULT_LAT = -15.7801;
export const DEFAULT_LNG = -47.9292;

// ---------------------------------------------------------------------------
// BrasilAPI — retorna endereço + coordenadas em uma única chamada, sem API key
// ---------------------------------------------------------------------------

export async function fetchCep(cep: string): Promise<{
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  lat?: number;
  lng?: number;
} | null> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    if (!res.ok) return null;
    const data: BrasilApiCepResponse = await res.json();

    const lat = data.location?.coordinates?.latitude
      ? parseFloat(String(data.location.coordinates.latitude))
      : undefined;
    const lng = data.location?.coordinates?.longitude
      ? parseFloat(String(data.location.coordinates.longitude))
      : undefined;

    return {
      logradouro: data.street,
      bairro: data.neighborhood,
      localidade: data.city,
      uf: data.state,
      lat: lat && !isNaN(lat) ? lat : undefined,
      lng: lng && !isNaN(lng) ? lng : undefined,
    };
  } catch {
    return null;
  }
}
