/**
 * Tipos da feature de publicação de imóvel.
 * Criado para centralizar os tipos relacionados à publicação de imóveis, como as respostas da API, dados de formulários, etc.
 */

import {
  PropertyType,
  Purpose,
} from "@/features/owner/enums/publish-details-enums";

// ---------------------------------------------------------------------------
// Enums espelhados do backend
// ---------------------------------------------------------------------------

export type ListingStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "SOLD" | "RENTED";

export type ListingPlan =
  | "FREE"
  | "STANDARD"
  | "FEATURED"
  | "PREMIUM"
  | "SUPER";

// ---------------------------------------------------------------------------
// Mídia — GET /marketing/:id/media
// ---------------------------------------------------------------------------

/**
 * Mídia retornada pela API (foto ou vídeo de um imóvel).
 * O publicId (Cloudinary) é interno — não é exposto na resposta.
 */
export interface MediaItem {
  /** UUID da mídia */
  id: string;
  /** UUID do imóvel ao qual a mídia pertence */
  propertyId: string;
  /** Tipo do arquivo */
  type: "IMAGE" | "VIDEO";
  /** URL pública CDN do Cloudinary */
  url: string;
  /** Posição na galeria (0 = capa) */
  order: number;
  createdAt: string;
}

export type MarketingResponse = {
  // --- Identificação ---
  id: string;
  externalId: string | null;
  /** UUID do proprietário — lido do JWT pelo backend. */
  createdById: string;
  slug: string;

  // --- Classificação ---
  status: ListingStatus;
  purpose: Purpose;
  type: PropertyType;

  // --- Conteúdo ---
  title: string;
  description: string | null;

  // --- Valores (em centavos) ---
  price: number;
  condominiumFee: number | null;
  iptuYearly: number | null;

  // --- Localização ---
  city: string;
  state: string;
  district: string;
  street: string | null;
  streetNumber: string | null;
  complement: string | null;
  zipcode: string | null;
  latitude: number | null;
  longitude: number | null;

  // --- Características físicas ---
  areaM2: number | null;
  builtArea: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  garageSpots: number | null;
  floor: number | null;
  totalFloors: number | null;
  furnished: boolean | null;
  petFriendly: boolean | null;
  yearBuilt: number | null;

  // --- Contato ---
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsApp: string | null;

  // --- Negociação ---
  acceptsExchange: boolean;
  acceptsFinancing: boolean;
  acceptsCarTrade: boolean;
  isLaunch: boolean;
  isReadyToMove: boolean;

  // --- SEO ---
  metaTitle: string | null;
  metaDescription: string | null;

  // --- Mídia via URL ---
  videoUrl: string | null;
  virtualTourUrl: string | null;

  // --- Analytics de visualização ---
  viewsCount: number;
  uniqueViewsCount: number;

  // --- Analytics de leads / interações ---
  leadsCount: number;
  favoritesCount: number;
  sharesCount: number;
  phoneClicksCount: number;
  whatsappClicksCount: number;
  emailClicksCount: number;

  // --- Origem dos leads ---
  leadSourcePortal: number;
  leadSourceSearch: number;
  leadSourceMap: number;
  leadSourceFeatured: number;

  // --- Plano e destaque ---
  listingPlan: ListingPlan;
  isFeatured: boolean;
  highlightUntil: string | null;

  // --- Avaliações ---
  averageRating: number;
  totalReviews: number;

  // --- Integrações ---
  publishToVivaReal: boolean;
  publishToOLX: boolean;
  publishToZapImoveis: boolean;

  // --- Datas ---
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;

  /**
   * Fotos e vídeos do imóvel, ordenados por posição na galeria.
   * Presente apenas no GET /marketing/:id.
   */
  media?: MediaItem[];
};

// ---------------------------------------------------------------------------
// Meus imóveis — GET /marketing/me
// ---------------------------------------------------------------------------

/** Parâmetros de query aceitos por GET /marketing */
export interface MarketingQueryParams {
  /** Busca textual por título, cidade ou bairro */
  search?: string;
  /** Filtrar por status específico. Sem filtro = todos os status. */
  status?: ListingStatus;
  /** Filtrar por finalidade: RENT ou SALE */
  purpose?: string;
  /** Página (começa em 1, padrão: 1) */
  page?: number;
  /** Itens por página (padrão: 20, máx: 100) */
  limit?: number;
}

/** Resposta paginada de GET /marketing */
export interface PaginatedMarketingResponse {
  items: MarketingResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
