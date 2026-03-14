import { Inject, Injectable } from '@nestjs/common';
import {
  LISTING_REPOSITORY,
  ListingFilters,
  ListingRepository,
  PaginatedResult,
} from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';

/** Todos os status possíveis, usados quando o dono quer ver tudo. */
const ALL_STATUSES: ListingStatus[] = [
  ListingStatus.DRAFT,
  ListingStatus.ACTIVE,
  ListingStatus.INACTIVE,
  ListingStatus.SOLD,
  ListingStatus.RENTED,
];

/**
 * USE CASE: LISTAR MEUS ANÚnCIOS
 *
 * Retorna uma lista paginada dos anúncios que pertencem ao usuário autenticado.
 *
 * Diferenças em relação a GetListingsUseCase (busca pública):
 *  - `createdById` é forçado para o ID do caller — sem acesso a dados de outros donos.
 *  - Por padrão retorna TODOS os status (DRAFT, ACTIVE, INACTIVE, SOLD, RENTED).
 *  - O filtro `status` pode ser usado para refinar (ex: só DRAFT).
 *
 * Segurança:
 *  - A rota usa JwtAuthGuard → o `userId` vem do token, não do cliente.
 *  - O repositório filtra por `createdById`, garantindo isolamento total.
 */
@Injectable()
export class GetMyListingsUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param keycloakId - Sub do JWT do usuário autenticado
   * @param filters    - Filtros opcionais (status, page, limit, etc.)
   */
  async execute(
    keycloakId: string,
    filters: Omit<ListingFilters, 'advertiserId'> = {},
  ): Promise<PaginatedResult<ListingEntity>> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 10));

    const advertiserId =
      await this.listings.resolveAdvertiserIdByKeycloakId(keycloakId);

    if (!advertiserId) {
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    return this.listings.findMany({
      ...filters,
      // Isola os dados: somente anúncios do anunciante autenticado
      advertiserId,
      // Quando nenhum status é informado, retorna TODOS (não apenas ACTIVE)
      statuses: filters.status ? undefined : ALL_STATUSES,
      page,
      limit,
    });
  }
}
