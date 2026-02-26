import { AdvertiserEntity } from '../entities/advertiser.entity';
import { AdvertiserStatus } from '../enums/advertiser-status.enum';
import { AdvertiserType } from '../enums/advertiser-type.enum';

/**
 * TOKEN DE INJEÇÃO DO REPOSITÓRIO
 *
 * Usado no decorator @Inject() para injetar a implementação concreta (Prisma).
 * Permite trocar a implementação nos testes sem modificar os use-cases.
 *
 * Exemplo de uso:
 *   constructor(@Inject(ADVERTISER_REPOSITORY) private repo: IAdvertiserRepository) {}
 */
export const ADVERTISER_REPOSITORY = Symbol('ADVERTISER_REPOSITORY');

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

/**
 * Dados necessários para criar um novo anunciante.
 * O status é sempre PENDING automaticamente pelo use-case.
 */
export interface CreateAdvertiserData {
  type: AdvertiserType;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  document?: string;
  creci?: string;
  creciState?: string;
  companyName?: string;
  tradeName?: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  keycloakId?: string;
}

/**
 * Dados que podem ser atualizados em um anunciante existente.
 * Todos os campos são opcionais (PATCH semântico).
 */
export interface UpdateAdvertiserData {
  name?: string;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  coverImage?: string;
  companyName?: string;
  tradeName?: string;
  document?: string;
  creci?: string;
  creciState?: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  bio?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  status?: AdvertiserStatus;
  isVerified?: boolean;
  verifiedAt?: Date;
  suspendedAt?: Date;
  suspendReason?: string;
  deletedAt?: Date;
  keycloakId?: string;
}

/**
 * Filtros disponíveis para listagem de anunciantes.
 * Todos opcionais — omitir retorna todos os registros (paginados).
 */
export interface AdvertiserFilters {
  type?: AdvertiserType;
  status?: AdvertiserStatus;
  city?: string;
  state?: string;
  isVerified?: boolean;
  /** Texto livre para buscar em name, companyName, tradeName ou email */
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Resultado paginado retornado pelo método findMany.
 *
 * @template T - Tipo dos itens (geralmente AdvertiserEntity)
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Interface do repositório
// ---------------------------------------------------------------------------

/**
 * CONTRATO DO REPOSITÓRIO DE ANUNCIANTES
 *
 * Define as operações de persistência disponíveis para o módulo advertiser.
 * A implementação concreta (Prisma) fica em infrastructure/prisma/.
 *
 * Regra: use-cases dependem APENAS desta interface, nunca do Prisma diretamente.
 */
export interface IAdvertiserRepository {
  /**
   * Persiste um novo anunciante.
   * Lança ConflictException se o e-mail ou documento já existir (P2002).
   */
  create(data: CreateAdvertiserData): Promise<AdvertiserEntity>;

  /**
   * Busca anunciante pelo ID.
   * Retorna null se não encontrado (sem lançar exceção — responsabilidade do use-case).
   */
  findById(id: string): Promise<AdvertiserEntity | null>;

  /**
   * Busca anunciante pelo e-mail.
   * Útil para validar unicidade antes de criar.
   */
  findByEmail(email: string): Promise<AdvertiserEntity | null>;

  /**
   * Busca anunciante pelo keycloakId do usuário autenticado.
   * Retorna null se não encontrado.
   */
  findByKeycloakId(keycloakId: string): Promise<AdvertiserEntity | null>;

  /**
   * Atualiza campos de um anunciante existente.
   * Lança NotFoundException se o ID não existir.
   */
  update(id: string, data: UpdateAdvertiserData): Promise<AdvertiserEntity>;

  /**
   * Retorna lista paginada com filtros opcionais.
   */
  findMany(
    filters: AdvertiserFilters,
  ): Promise<PaginatedResult<AdvertiserEntity>>;

  /**
   * Verifica se já existe um anunciante com o e-mail informado.
   * Mais eficiente que findByEmail() quando só precisamos de boolean.
   */
  emailExists(email: string): Promise<boolean>;
}
