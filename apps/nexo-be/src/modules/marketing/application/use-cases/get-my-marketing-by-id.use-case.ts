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
import { ListingEntity } from '../../domain/entities/marketing.entity';

/**
 * USE CASE: BUSCAR MEU ANÚNCIO POR ID
 *
 * Retorna os dados completos de um anúncio que pertence ao usuário autenticado.
 *
 * Diferenças em relação a GetListingUseCase (busca pública):
 *  - Exige que o caller seja o dono do anúncio.
 *  - Retorna qualquer status (DRAFT, ACTIVE, INACTIVE, SOLD, RENTED).
 *  - Rota exige JwtAuthGuard → nunca há chamada anônima.
 *
 * Regras de negócio:
 *  - 404 se o anúncio não existir ou estiver soft-deletado.
 *  - 403 se o anúncio existir mas pertencer a outro usuário
 *    (403 e não 404 porque o caller está autenticado e acessou a rota /me —
 *    não há risco de vazar existência de anúncio de terceiros neste contexto).
 */
@Injectable()
export class GetMyListingByIdUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param listingId  - UUID do anúncio
   * @param keycloakId - Sub do JWT do usuário autenticado
   * @returns Entidade completa do anúncio
   * @throws NotFoundException  quando o anúncio não existe ou está deletado
   * @throws ForbiddenException quando o anúncio pertence a outro usuário
   */
  async execute(listingId: string, keycloakId: string): Promise<ListingEntity> {
    const listing = await this.listings.findById(listingId);

    if (!listing || listing.deletedAt !== null) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    const advertiserId =
      await this.listings.resolveAdvertiserIdByKeycloakId(keycloakId);

    if (listing.advertiserId !== advertiserId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este anúncio.',
      );
    }

    return listing;
  }
}
