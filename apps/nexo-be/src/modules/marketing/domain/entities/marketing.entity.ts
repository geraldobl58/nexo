import { ListingStatus } from '../enums/marketing-status.enum';
import { MediaEntity } from './marketing-media.entity';

/**
 * ENTIDADE DE DOMÍNIO: LISTING (ANÚNCIO IMOBILIÁRIO)
 *
 * Em Clean Architecture, uma Entidade é um objeto com:
 *  - Identidade própria (campo `id`)
 *  - Regras de negócio embutidas
 *  - Independência de frameworks (sem @Injectable, sem @Column, etc.)
 *
 * IMPORTANTE: esse tipo NÃO é o model do Prisma.
 * É a representação do imóvel do ponto de vista do NEGÓCIO.
 * O Prisma é apenas um detalhe de infraestrutura.
 *
 * Mapeamento completo com o model `Property` do schema Prisma.
 */
export interface ListingEntity {
  // --- Identificação ---

  /** UUID gerado pelo banco */
  id: string;

  /** ID de integração externa (VivaReal, OLX, ZAP, etc.) */
  externalId: string | null;

  /** ID do anunciante dono do anúncio */
  advertiserId: string;

  // --- Status e classificação ---

  /** Ciclo de vida do anúncio (DRAFT, ACTIVE, etc.) */
  status: ListingStatus;

  /**
   * Propósito do imóvel: 'RENT' (aluguel) ou 'SALE' (venda).
   * Usamos string literal aqui para não importar o enum do Prisma
   * dentro da camada de domínio.
   */
  purpose: 'RENT' | 'SALE';

  /**
   * Tipo construtivo do imóvel.
   * Ex: 'APARTMENT', 'HOUSE', 'STUDIO', 'LAND', etc.
   */
  type:
    | 'APARTMENT'
    | 'HOUSE'
    | 'CONDO_HOUSE'
    | 'STUDIO'
    | 'LAND'
    | 'COMMERCIAL'
    | 'FARM'
    | 'OTHER';

  // --- Conteúdo do anúncio ---

  /** Título do anúncio (validado pelo ListingTitle value object) */
  title: string;

  /** Descrição detalhada (opcional) */
  description: string | null;

  // --- Valores (em centavos para evitar problemas de ponto flutuante) ---

  /** Preço principal em centavos. Ex: R$ 350.000,00 = 35000000 */
  price: number;

  /** Taxa de condomínio mensal em centavos (opcional) */
  condominiumFee: number | null;

  /** IPTU anual em centavos (opcional) */
  iptuYearly: number | null;

  // --- Características físicas ---

  /** Área total em m² */
  areaM2: number | null;

  /** Área construída em m² */
  builtArea: number | null;

  /** Número de quartos */
  bedrooms: number | null;

  /** Número de suítes */
  suites: number | null;

  /** Número de banheiros */
  bathrooms: number | null;

  /** Vagas de garagem */
  garageSpots: number | null;

  /** Número do andar (para apartamentos) */
  floor: number | null;

  /** Total de andares do edifício */
  totalFloors: number | null;

  /** Mobiliado? */
  furnished: boolean | null;

  /** Aceita pets? */
  petFriendly: boolean | null;

  /** Ano de construção */
  yearBuilt: number | null;

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

  // --- Contato do anúncio ---

  /**
   * Dados de contato específicos do anúncio.
   * Podem ser diferentes do contato principal do anunciante.
   */
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

  // --- SEO e URL ---

  /**
   * Slug é a versão amigável para URL do título.
   * Ex: "Apartamento 3 quartos Centro SP" → "apartamento-3-quartos-centro-sp-a1b2"
   * Gerado automaticamente no use-case de criação.
   */
  slug: string;

  metaTitle: string | null;
  metaDescription: string | null;

  /** URL de tour virtual (YouTube, Matterport, etc.) */
  videoUrl: string | null;

  /** URL de tour virtual imersivo (360°) */
  virtualTourUrl: string | null;

  // --- Analytics de visualização ---

  /** Total de visualizações da página do anúncio */
  viewsCount: number;

  /** Visualizações únicas (por IP/sessão única) */
  uniqueViewsCount: number;

  /** Quantidade de leads gerados por este anúncio */
  leadsCount: number;

  /** Quantidade de vezes que foi favoritado */
  favoritesCount: number;

  /** Quantidade de compartilhamentos */
  sharesCount: number;

  /** Cliques no botão de telefone */
  phoneClicksCount: number;

  /** Cliques no botão de WhatsApp */
  whatsappClicksCount: number;

  /** Cliques no botão de e-mail */
  emailClicksCount: number;

  // --- Plano e destaque ---

  /** Se o anúncio está atualmente em destaque */
  isFeatured: boolean;

  /** Até quando o destaque está ativo */
  highlightUntil: Date | null;

  // --- Avaliações ---

  /** Nota média das avaliações (0–5) */
  averageRating: number | null;

  /** Total de avaliações recebidas */
  totalReviews: number;

  // --- Integração com portais ---

  publishToVivaReal: boolean;
  publishToOLX: boolean;
  publishToZapImoveis: boolean;

  // --- Controle ---

  /** Data em que o anúncio foi publicado (status virou ACTIVE) */
  publishedAt: Date | null;

  /** Data de expiração do anúncio (quando o plano vence) */
  expiresAt: Date | null;

  /** Soft delete: quando preenchido, o anúncio está excluído */
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  /**
   * Mídias do anúncio (fotos e vídeos), ordenadas por `order` ASC.
   * Presente apenas quando o repositório inclui a relação (ex: findById).
   * Ausente na listagem paginada para não onerar a query.
   */
  media?: MediaEntity[];
}
