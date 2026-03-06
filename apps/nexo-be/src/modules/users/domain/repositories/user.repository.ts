import {
  UserEntity,
  UserRole,
} from '@/modules/identity/domain/entities/user.entity';

// ---------------------------------------------------------------------------
// Tipos de Property (resumo para listagem admin)
// ---------------------------------------------------------------------------

export interface PropertySummaryEntity {
  id: string;
  title: string;
  slug: string;
  status: string;
  purpose: string;
  type: string;
  price: number;
  city: string;
  state: string;
  district: string;
  areaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  isFeatured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface MyPropertiesFilters {
  status?: string;
  purpose?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * TOKEN DE INJEÇÃO DO REPOSITÓRIO DE USUÁRIOS
 *
 * Exemplo de uso:
 *   constructor(@Inject(USER_REPOSITORY) private repo: IUserRepository) {}
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

/**
 * Filtros para listagem de usuários internos.
 */
export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  /** Busca por nome ou e-mail */
  search?: string;
  page?: number;
  limit?: number;
}

/** Campos que podem ser atualizados por um administrador */
export interface UpdateUserData {
  role?: UserRole;
  phone?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  isActive?: boolean;
}

/** Resultado paginado (mesmo padrão do módulo advertiser) */
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
 * CONTRATO DO REPOSITÓRIO DE USUÁRIOS INTERNOS
 *
 * Responsável pelas operações de leitura e atualização da equipe interna.
 * A criação/sincronização de usuários é feita pelo IdentityModule (upsert no login).
 */
export interface IUserRepository {
  /** Busca por UUID. Retorna null se não encontrado. */
  findById(id: string): Promise<UserEntity | null>;

  /** Lista paginada com filtros opcionais. */
  findMany(filters: UserFilters): Promise<PaginatedResult<UserEntity>>;

  /**
   * Atualiza dados de um usuário.
   * Lança NotFoundException se o ID não existir.
   */
  update(id: string, data: UpdateUserData): Promise<UserEntity>;

  /** Lista paginada de imóveis cadastrados pelo usuário admin. */
  findMyProperties(
    userId: string,
    filters: MyPropertiesFilters,
  ): Promise<PaginatedResult<PropertySummaryEntity>>;
}
