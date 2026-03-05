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
 * USE CASE: PUBLICAR ANÚNCIO
 *
 * Responsável por mover um anúncio do estado DRAFT para ACTIVE.
 *
 * Regras de negócio:
 *  - O anúncio deve existir
 *  - Deve estar em status DRAFT (não faz sentido publicar algo já ativo)
 *  - Deve ter, no mínimo, preço, cidade e distrito preenchidos (campos obrigatórios)
 *  - Ao publicar: define publishedAt = agora, status = ACTIVE
 */
@Injectable()
export class PublishListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param listingId - ID do anúncio a publicar
   * @returns Anúncio com status ACTIVE e publishedAt preenchido
   */
  async execute(
    listingId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<ListingEntity> {
    // 1. Busca o anúncio. Se não existir, retorna 404.
    const listing = await this.listings.findById(listingId);
    if (!listing) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    // 2. Verifica ownership: apenas o dono ou Admin/Moderador podem publicar.
    const isOwner = listing.createdById === requesterId;
    const isPrivileged =
      requesterRole === 'ADMIN' || requesterRole === 'MODERATOR';
    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException(
        'Você não tem permissão para publicar este anúncio.',
      );
    }

    // 3. Valida que está em DRAFT ou INACTIVE.
    //    DRAFT  → primeira publicação.
    //    INACTIVE → reativação de anúncio pausado.
    const canPublish =
      listing.status === ListingStatus.DRAFT ||
      listing.status === ListingStatus.INACTIVE;
    if (!canPublish) {
      throw new BadRequestException(
        `Apenas anúncios em DRAFT ou INACTIVE podem ser publicados. Status atual: ${listing.status}`,
      );
    }

    // 5. Valida dados obrigatórios para estar ativo.
    //    Um anúncio sem preço ou localização não pode aparecer no portal.
    const missingFields: string[] = [];
    if (!listing.price || listing.price <= 0) missingFields.push('preço');
    if (!listing.city) missingFields.push('cidade');
    if (!listing.state) missingFields.push('estado');
    if (!listing.district) missingFields.push('bairro');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Para publicar, preencha os campos obrigatórios: ${missingFields.join(', ')}.`,
      );
    }

    // 6. Publica: atualiza status e publishedAt
    return this.listings.update(listingId, {
      status: ListingStatus.ACTIVE,
      publishedAt: new Date(),
    });
  }
}
