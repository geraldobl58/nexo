/**
 * Tipos da feature de publicação de imóvel.
 *
 * Fluxo:
 *  1. Usuário preenche o wizard (localização → detalhes → fotos → comodidades → revisão)
 *  2. POST /marketing — cria o imóvel com status DRAFT
 *     ⚠️  O backend obtém o dono pelo token JWT — NÃO enviar userId no body.
 *  3. POST /marketing/:id/media — envia cada arquivo individualmente (multipart/form-data)
 *  4. PATCH /marketing/:id/media/reorder — reordena a galeria
 *  5. PATCH /marketing/:id/publish — publica (muda status para ACTIVE)
 *
 * Preços são sempre em CENTAVOS:
 *   R$ 350.000,00 → 35000000
 */

import { PropertyType, Purpose } from "../enums/publish-details-enums";

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
// Mídia — POST /marketing/:id/media
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

/** Item usado em PATCH /marketing/:id/media/reorder */
export interface MediaOrderItem {
  /** UUID da mídia */
  id: string;
  /** Nova posição na galeria */
  order: number;
}

// ---------------------------------------------------------------------------
// Criar imóvel — Body do POST /marketing
// ---------------------------------------------------------------------------

/**
 * Dados enviados no body de POST /marketing.
 *
 * O servidor lê o dono do imóvel pelo token JWT (header Authorization Bearer).
 * Não é necessário nem permitido enviar userId ou createdById no body.
 *
 * Preços em CENTAVOS: R$ 350.000 = 35000000
 * O helper `toCents()` em actions/publish.ts faz a conversão automaticamente.
 */
export interface CreatePublishInput {
  // --- Classificação ---
  purpose: Purpose;
  type: PropertyType;

  // --- Conteúdo ---
  title: string;
  description?: string;

  // --- Valores (em centavos) ---
  price: number;
  condominiumFee?: number;
  iptuYearly?: number;

  // --- Localização ---
  city: string;
  state: string;
  district: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;

  // --- Características físicas ---
  areaM2?: number;
  builtArea?: number;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  garageSpots?: number;
  floor?: number;
  totalFloors?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  yearBuilt?: number;

  // --- Contato do anúncio (pode diferir do contato principal do anunciante) ---
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsApp?: string;

  // --- Negociação ---
  acceptsExchange?: boolean;
  acceptsFinancing?: boolean;
  acceptsCarTrade?: boolean;
  isLaunch?: boolean;
  isReadyToMove?: boolean;

  // --- SEO ---
  metaTitle?: string;
  metaDescription?: string;

  // --- Mídia via URL direta (sem upload de arquivo) ---
  videoUrl?: string;
  virtualTourUrl?: string;

  // --- Integrações e plano ---
  externalId?: string;
  listingPlan?: ListingPlan;
  publishToVivaReal?: boolean;
  publishToOLX?: boolean;
  publishToZapImoveis?: boolean;
}

// ---------------------------------------------------------------------------
// Criar imóvel — Resposta da API
// ---------------------------------------------------------------------------

/**
 * Resposta de POST /marketing e GET /marketing/:id.
 *
 * Campos com `| null` são opcionais no banco — a API os devolve como null
 * quando não foram informados.
 *
 * O campo `media` é incluído apenas no GET /marketing/:id (detalhe).
 * No POST (criação) ainda não há mídias — o upload é feito em seguida.
 */
export interface CreatePublishResponse {
  id: string;
  status: ListingStatus;
  purpose: Purpose;
  type: PropertyType;
  title: string;
  description: string | null;
  price: number;
  condominiumFee: number | null;
  iptuYearly: number | null;
  city: string;
  state: string;
  district: string;
  street: string | null;
  streetNumber: string | null;
  complement: string | null;
  zipcode: string | null;
  latitude: number | null;
  longitude: number | null;
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
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsApp: string | null;
  acceptsExchange: boolean;
  acceptsFinancing: boolean;
  acceptsCarTrade: boolean;
  isLaunch: boolean;
  isReadyToMove: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  externalId: string | null;
  slug: string;
  listingPlan: ListingPlan;
  isFeatured: boolean;
  publishToVivaReal: boolean;
  publishToOLX: boolean;
  publishToZapImoveis: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  /**
   * Fotos e vídeos do imóvel, ordenados por posição na galeria.
   * Presente apenas no GET /marketing/:id.
   */
  media?: MediaItem[];
}

// ---------------------------------------------------------------------------
// Estado de retorno das actions
// ---------------------------------------------------------------------------

export type CreatePublishActionState =
  | { success: true; message: string; data: CreatePublishResponse }
  | { success: false; message: string };
