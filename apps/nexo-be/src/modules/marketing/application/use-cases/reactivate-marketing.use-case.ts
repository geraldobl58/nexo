import {
  BadRequestException,
  ForbiddenException,
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
import { UserRole } from '@/modules/identity/domain/entities/user.entity';

/**
 * USE CASE: REATIVAR ANÚNCIO
 *
 * Move um anúncio de INACTIVE para ACTIVE.
 * Útil quando o anunciante quer colocar de volta no ar um imóvel pausado,
 * sem precisar passar pelo fluxo de criação/publicação novamente.
 *
 * Regras de negócio:
 *  - O anúncio deve existir
 *  - Deve estar em status INACTIVE
 *  - Apenas o dono ou Admin/Moderador podem reativar
 */
@Injectable()
export class ReactivateListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param listingId    - ID do anúncio a reativar
   * @param requesterId  - ID do usuário que fez a requisição
   * @param requesterRole - Papel do usuário
   * @returns Anúncio com status ACTIVE
   */
  async execute(
    listingId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<ListingEntity> {
    // 1. Valida existência
    const listing = await this.listings.findById(listingId);
    if (!listing) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    // 2. Verifica ownership
    const isOwner = listing.advertiserId === requesterId;
    const isPrivileged =
      requesterRole === 'ADMIN' || requesterRole === 'MODERATOR';
    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException(
        'Você não tem permissão para reativar este anúncio.',
      );
    }

    // 3. Valida que está em INACTIVE
    if (listing.status !== ListingStatus.INACTIVE) {
      throw new BadRequestException(
        `Apenas anúncios INACTIVE podem ser reativados. Status atual: ${listing.status}`,
      );
    }

    // 4. Reativa: volta para ACTIVE
    return this.listings.update(listingId, {
      status: ListingStatus.ACTIVE,
    });
  }
}
