import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LISTING_REPOSITORY,
  ListingRepository,
} from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';

/**
 * USE CASE: DESPUBLICAR ANÚNCIO
 *
 * Move um anúncio de ACTIVE para INACTIVE.
 * O anúncio some das buscas públicas, mas não é excluído do banco.
 *
 * Casos de uso:
 *  - Anunciante quer pausar temporariamente sem perder o conteúdo
 *  - Moderador remove anúncio que viola políticas
 *  - Imóvel em manutenção/reforma antes de mostrar fotos definitivas
 */
@Injectable()
export class UnpublishListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param listingId - ID do anúncio a despublicar
   * @returns Anúncio com status INACTIVE
   */
  async execute(listingId: string): Promise<ListingEntity> {
    // 1. Valida existeência
    const listing = await this.listings.findById(listingId);
    if (!listing) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    // 2. Só anúncios ATIVOS podem ser despublicados.
    //    Despublicar um DRAFT ou SOLD não faz sentido de negócio.
    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException(
        `Apenas anúncios ACTIVE podem ser despublicados. Status atual: ${listing.status}`,
      );
    }

    // 3. Marca como inativo
    return this.listings.update(listingId, {
      status: ListingStatus.INACTIVE,
    });
  }
}
