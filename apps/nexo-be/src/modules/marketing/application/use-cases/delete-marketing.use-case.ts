import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  LISTING_REPOSITORY,
  ListingRepository,
} from '../../domain/repositories/marketing.repository';

/**
 * USE CASE: EXCLUIR ANÚNCIO (Soft Delete)
 *
 * Marca o anúncio como excluído preenchendo o campo `deletedAt`.
 * O registro permanece no banco para fins de auditoria e histórico,
 * mas fica invisível para todas as consultas normais.
 *
 * Regras de negócio:
 *  - O anúncio deve existir e não estar já deletado
 *  - A exclusão é irreversível via API (apenas por operação direta no banco)
 */
@Injectable()
export class DeleteListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param listingId - UUID do anúncio a excluir
   * @throws NotFoundException quando o anúncio não existe ou já foi deletado
   */
  async execute(listingId: string): Promise<void> {
    // Verifica existência antes de deleter para retornar 404 claro
    const listing = await this.listings.findById(listingId);
    if (!listing || listing.deletedAt !== null) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    await this.listings.softDelete(listingId);
  }
}
