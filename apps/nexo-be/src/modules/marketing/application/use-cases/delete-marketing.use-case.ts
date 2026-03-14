import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LISTING_REPOSITORY,
  ListingRepository,
} from '../../domain/repositories/marketing.repository';
import { UserRole } from '@/modules/identity/domain/entities/user.entity';

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
  async execute(
    listingId: string,
    requesterKeycloakId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    const listing = await this.listings.findById(listingId);
    if (!listing || listing.deletedAt !== null) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    const advertiserId =
      await this.listings.resolveAdvertiserIdByKeycloakId(requesterKeycloakId);
    const isOwner = listing.advertiserId === advertiserId;
    const isPrivileged =
      requesterRole === 'ADMIN' || requesterRole === 'MODERATOR';
    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este anúncio.',
      );
    }

    await this.listings.softDelete(listingId);
  }
}
