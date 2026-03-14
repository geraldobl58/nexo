import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  LISTING_REPOSITORY,
  ListingRepository,
} from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { UserRole } from '@/modules/identity/domain/entities/user.entity';

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
  async execute(
    listingId: string,
    requesterId?: string | null,
    requesterRole?: UserRole | null,
  ): Promise<ListingEntity> {
    const listing = await this.listings.findById(listingId);

    if (!listing || listing.deletedAt !== null) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    // Anúncios não-ACTIVE (DRAFT, INACTIVE, etc.) só são visíveis para o
    // dono ou para Admin/Moderador. Para qualquer outro caller, retorna 404
    // (não 403) para não vazar informação sobre a existência do rascunho.
    if (listing.status !== ListingStatus.ACTIVE) {
      const isOwner = requesterId && listing.advertiserId === requesterId;
      const isPrivileged =
        requesterRole === 'ADMIN' || requesterRole === 'MODERATOR';
      if (!isOwner && !isPrivileged) {
        throw new NotFoundException(
          `Anúncio com id "${listingId}" não encontrado.`,
        );
      }
    }

    return listing;
  }

  /**
   * @param slug - URL amigável do anúncio
   * @returns A entidade completa do anúncio
   * @throws NotFoundException quando o anúncio não existe ou está deletado
   */
  async executeBySlug(
    slug: string,
    requesterId?: string | null,
    requesterRole?: UserRole | null,
  ): Promise<ListingEntity> {
    const listing = await this.listings.findBySlug(slug);

    if (!listing || listing.deletedAt !== null) {
      throw new NotFoundException(`Anúncio com slug "${slug}" não encontrado.`);
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      const isOwner = requesterId && listing.advertiserId === requesterId;
      const isPrivileged =
        requesterRole === 'ADMIN' || requesterRole === 'MODERATOR';
      if (!isOwner && !isPrivileged) {
        throw new NotFoundException(
          `Anúncio com slug "${slug}" não encontrado.`,
        );
      }
    }

    return listing;
  }
}
