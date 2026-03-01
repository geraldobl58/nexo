import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  LISTING_REPOSITORY,
  ListingRepository,
} from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';

/**
 * USE CASE: BUSCAR ANÚNCIO POR ID
 *
 * Carrega os dados completos de um único anúncio.
 * Utilizado nas páginas de detalhe do imóvel no portal.
 *
 * Regras de negócio:
 *  - O anúncio deve existir e não estar deletado (soft delete)
 *  - Retorna 404 caso não encontrado
 */
@Injectable()
export class GetListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param listingId - UUID do anúncio
   * @returns A entidade completa do anúncio
   * @throws NotFoundException quando o anúncio não existe ou está deletado
   */
  async execute(listingId: string): Promise<ListingEntity> {
    const listing = await this.listings.findById(listingId);

    if (!listing || listing.deletedAt !== null) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    return listing;
  }
}
