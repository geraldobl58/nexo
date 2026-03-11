import { ListingEntity } from '../entities/marketing.entity';

/**
 * TOKEN DE INJEÇÃO DE DEPENDÊNCIA
 *
 * Em NestJS, quando usamos interfaces (que não existem no JavaScript em runtime),
 * precisamos de um token (string ou Symbol) para o sistema de DI saber
 * qual implementação injetar.
 *
 * Uso no module:
 *   { provide: LISTING_REPOSITORY, useClass: PrismaListingRepository }
 *
 * Uso no use-case:
 *   constructor(@Inject(LISTING_REPOSITORY) private repo: ListingRepository) {}
 */
export const LISTING_REPOSITORY = 'LISTING_REPOSITORY';

// ---------------------------------------------------------------------------
// Tipos de entrada
// ---------------------------------------------------------------------------

/**
 * Dados necessários para CRIAR um novo anúncio.
 * É um subconjunto de ListingEntity — sem id, slug, datas de controle, etc.
 * (esses são gerados pelo sistema, não informados pelo usuário)
 */
export type CreateListingData = {
  advertiserId: string;
  purpose: ListingEntity['purpose'];
  type: ListingEntity['type'];
  title: string;
  description?: string;
  price: number;
  condominiumFee?: number;
  iptuYearly?: number;
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
  city: string;
  state: string;
  district: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  acceptsExchange?: boolean;
  acceptsFinancing?: boolean;
  acceptsCarTrade?: boolean;
  isLaunch?: boolean;
  isReadyToMove?: boolean;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  // Contato específico do anúncio
  externalId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsApp?: string;
  // Mídia e tours
  videoUrl?: string;
  virtualTourUrl?: string;
  // Destaque
  isFeatured?: boolean;
  highlightUntil?: Date;
  // Integração com portais externos
  publishToVivaReal?: boolean;
  publishToOLX?: boolean;
  publishToZapImoveis?: boolean;
};

/**
 * Dados para ATUALIZAR um anúncio existente.
 * Todos os campos são opcionais (Partial) —
 * você envia apenas o que quer mudar.
 */
export type UpdateListingData = Partial<
  Omit<CreateListingData, 'advertiserId' | 'slug'>
> & {
  status?: ListingEntity['status'];
  slug?: string;
  publishedAt?: Date;
  expiresAt?: Date;
};

/**
 * Filtros para a listagem pública de anúncios.
 * Todos são opcionais (o usuário pode combinar qualquer subconjunto).
 *
 * Mapeamento com o schema Prisma (model Property):
 *  - purpose, type, city, state, district → campos diretos
 *  - minPrice/maxPrice → price (gte/lte)
 *  - minBedrooms/maxBedrooms → bedrooms (gte/lte)
 *  - minBathrooms → bathrooms (gte)
 *  - minGarageSpots → garageSpots (gte)
 *  - minAreaM2/maxAreaM2 → areaM2 (gte/lte)
 *  - furnished, petFriendly, acceptsFinancing, etc. → campos booleanos diretos
 *  - isFeatured → isFeatured
 *  - isLaunch → isLaunch
 */
export type ListingFilters = {
  // --- Classificação ---

  /** Finalidade: 'RENT' ou 'SALE' */
  purpose?: ListingEntity['purpose'];

  /** Tipo do imóvel: 'APARTMENT', 'HOUSE', etc. */
  type?: ListingEntity['type'];

  // --- Localização ---

  /** Cidade (busca parcial, case-insensitive) */
  city?: string;

  /** Estado (sigla: 'SP', 'RJ', etc.) */
  state?: string;

  /** Bairro (busca parcial, case-insensitive) */
  district?: string;

  // --- Preço ---

  /** Preço mínimo em centavos */
  minPrice?: number;

  /** Preço máximo em centavos */
  maxPrice?: number;

  // --- Quartos e banheiros ---

  /** Número mínimo de quartos */
  minBedrooms?: number;

  /** Número máximo de quartos */
  maxBedrooms?: number;

  /** Número mínimo de banheiros */
  minBathrooms?: number;

  /** Número mínimo de vagas de garagem */
  minGarageSpots?: number;

  // --- Área ---

  /** Área total mínima em m² */
  minAreaM2?: number;

  /** Área total máxima em m² */
  maxAreaM2?: number;

  // --- Características booleanas ---

  /** Apenas imóveis mobiliados */
  furnished?: boolean;

  /** Apenas imóveis que aceitam pets */
  petFriendly?: boolean;

  /** Apenas imóveis que aceitam financiamento */
  acceptsFinancing?: boolean;

  /** Apenas imóveis que aceitam permuta */
  acceptsExchange?: boolean;

  /** Apenas imóveis na planta / lançamentos */
  isLaunch?: boolean;

  /** Apenas imóveis prontos para morar */
  isReadyToMove?: boolean;

  /** Apenas anúncios em destaque */
  isFeatured?: boolean;

  // --- Outros ---

  /**
   * Filtrar por um único status do anúncio.
   * Quando omitido (e `statuses` também for omitido), o repositório retorna apenas anúncios ACTIVE por padrão.
   */
  status?: ListingEntity['status'];

  /**
   * Filtrar por múltiplos status simultaneamente (IN).
   * Quando fornecido, tem precedência sobre `status`.
   * Use para endpoints autenticados que precisam retornar todos os status do dono.
   */
  statuses?: ListingEntity['status'][];

  /** Filtrar apenas pelos anúncios do anunciante autenticado */
  advertiserId?: string;

  /** Página atual (começa em 1). Default: 1 */
  page?: number;

  /** Quantidade de itens por página. Default: 10, máx: 100 */
  limit?: number;
};

/**
 * Resultado paginado genérico.
 *
 * Por que paginar?
 * Imagens custam band widh + memória. Retornar 10.000 imóveis de uma vez
 * derrubaria o servidor. Paginamos para retornar blocos gerenciáveis.
 *
 * @template T qualquer tipo de item listado
 */
export type PaginatedResult<T> = {
  /** Os itens da página atual */
  items: T[];

  /** Total de itens que correspondem ao filtro (para calcular total de páginas) */
  total: number;

  /** Página atual */
  page: number;

  /** Itens por página */
  limit: number;

  /**
   * Total de páginas disponíveis.
   * Cálculo: Math.ceil(total / limit)
   */
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Interface do repositório
// ---------------------------------------------------------------------------

/**
 * INTERFACE DO REPOSITÓRIO DE ANÚnCIOS
 *
 * O que é isso?
 * Um repositório é uma abstração que representa a "prateleira de anúncios".
 * O domínio define O QUE pode ser feito (essa interface).
 * A infraestrutura define COMO é feito (PrismaListingRepository).
 *
 * Benefício: se um dia trocarmos Postgres por MongoDB, só mudamos
 * a implementação, nunca os use-cases.
 */
export interface ListingRepository {
  /**
   * Cria um novo anúncio no banco de dados.
   * @returns A entidade criada com id e datas preenchidos
   */
  create(data: CreateListingData): Promise<ListingEntity>;

  /**
   * Busca um anúncio pelo ID.
   * @returns A entidade ou `null` se não encontrada
   */
  findById(id: string): Promise<ListingEntity | null>;

  /**
   * Atualiza campos de um anúncio existente.
   * @returns A entidade atualizada
   */
  update(id: string, data: UpdateListingData): Promise<ListingEntity>;

  /**
   * Busca anúncios com filtros e paginação.
   * Retorna apenas anúncios com status ACTIVE por padrão.
   */
  findMany(filters: ListingFilters): Promise<PaginatedResult<ListingEntity>>;

  /**
   * Conta quantos anúncios ativos (não deletados, não SOLD/RENTED) o anunciante possui.
   * Usado para verificar o limite de imóveis do plano.
   */
  countActiveByAdvertiser(advertiserId: string): Promise<number>;

  /**
   * Retorna os limites do plano ativo do anunciante.
   * Busca a assinatura ativa e retorna maxProperties, maxPhotos e maxVideos.
   * maxProperties = -1 significa ilimitado (plano PREMIUM).
   */
  getAdvertiserPlanLimits(advertiserId: string): Promise<{
    maxProperties: number;
    maxPhotos: number;
    maxVideos: number;
  }>;

  /**
   * Verifica se um slug já existe (para garantir unicidade de URL).
   */
  slugExists(slug: string): Promise<boolean>;

  /**
   * Soft delete: preenche `deletedAt` com a data atual.
   * O registro permanece no banco mas fica invisível para consultas normais.
   * @throws NotFoundException quando o anúncio não existe
   */
  softDelete(id: string): Promise<void>;
}
