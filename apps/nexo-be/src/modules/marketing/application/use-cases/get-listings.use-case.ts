import { Inject, Injectable } from '@nestjs/common';
import {
  LISTING_REPOSITORY,
  ListingFilters,
  ListingRepository,
  PaginatedResult,
} from '../../domain/repositories/listing.repository';
import { ListingEntity } from '../../domain/entities/listing.entity';

/**
 * USE CASE: LISTAR ANÚnCIOS
 *
 * Retorna uma lista paginada de anúncios com filtros.
 *
 * Este use-case é usado pela página de busca pública do portal.
 *
 * Regras de negócio:
 *  - Apenas anúncios ATIVOS são retornados por padrão
 *  - A paginação é obrigatória (max 100 itens por página) para proteger o servidor
 *  - Qualquer combinação de filtros é válida (são todos opcionais)
 *
 * Exemplo de filtros válidos:
 *  - { purpose: 'RENT', city: 'São Paulo', maxPrice: 200000, bedrooms: 2 }
 *  - { type: 'APARTMENT', state: 'SP', page: 2, limit: 10 }
 *  - {} // retorna tudo, página 1, 20 itens
 */
@Injectable()
export class GetListingsUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param filters - Filtros opcionais de busca
   * @returns Lista paginada de anúncios ativos
   */
  async execute(
    filters: ListingFilters,
  ): Promise<PaginatedResult<ListingEntity>> {
    // Aplica limites de paginação para evitar abuso da API.
    const page = Math.max(1, filters.page ?? 1); // mínimo página 1
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20)); // entre 1 e 100

    return this.listings.findMany({
      ...filters,
      page,
      limit,
    });
  }
}
