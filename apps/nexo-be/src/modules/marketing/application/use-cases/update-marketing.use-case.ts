import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LISTING_REPOSITORY,
  ListingRepository,
  UpdateListingData,
} from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingTitle } from '../../domain/value-objects/marketing-title.vo';
import { ListingPlan } from '../../domain/enums/marketing-plan.enum';
import { generateListingSlug } from '../utils/slug.util';

/**
 * Campos editáveis pelo usuário.
 * Status, publishedAt, analytics e datas de controle são gerenciados
 * exclusivamente por use-cases específicos (publish, unpublish, etc.).
 */
export type UpdateListingInput = {
  // Conteúdo
  title?: string;
  description?: string;
  // Valores
  price?: number;
  condominiumFee?: number;
  iptuYearly?: number;
  // Características físicas
  areaM2?: number;
  builtArea?: number;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  garageSpots?: number;
  floor?: number;
  totalFloors?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  yearBuilt?: number;
  // Localização
  city?: string;
  state?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  // Contato
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsApp?: string;
  // Negociação
  acceptsExchange?: boolean;
  acceptsFinancing?: boolean;
  acceptsCarTrade?: boolean;
  isLaunch?: boolean;
  isReadyToMove?: boolean;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  // Mídia
  videoUrl?: string;
  virtualTourUrl?: string;
  // Plano e integração
  listingPlan?: ListingPlan;
  publishToVivaReal?: boolean;
  publishToOLX?: boolean;
  publishToZapImoveis?: boolean;
  // Classificação
  type?: ListingEntity['type'];
  purpose?: ListingEntity['purpose'];
};

/**
 * USE CASE: ATUALIZAR ANÚNCIO
 *
 * Permite atualizar campos editáveis de um anúncio existente.
 * Campos de controle (status, analytics, datas de publicação) são gerenciados
 * por use-cases dedicados.
 *
 * Regras de negócio:
 *  - O anúncio deve existir e não estar deletado
 *  - Se o título for alterado, é revalidado pelo Value Object e um
 *    novo slug único é regenerado
 *  - Se o preço for alterado, deve ser maior que zero
 */
@Injectable()
export class UpdateListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * @param listingId - UUID do anúncio a atualizar
   * @param input     - Campos a modificar (somente os enviados são alterados)
   * @returns Anúncio com os dados atualizados
   */
  async execute(
    listingId: string,
    input: UpdateListingInput,
  ): Promise<ListingEntity> {
    // 1. Busca e verifica existência
    const listing = await this.listings.findById(listingId);
    if (!listing || listing.deletedAt !== null) {
      throw new NotFoundException(
        `Anúncio com id "${listingId}" não encontrado.`,
      );
    }

    const changes: UpdateListingData = {};

    // 2. Se o título foi alterado, revalida e regenera slug
    if (input.title !== undefined) {
      let titleVO: ListingTitle;
      try {
        titleVO = ListingTitle.create(input.title);
      } catch (err: unknown) {
        throw new BadRequestException(
          err instanceof Error ? err.message : 'Título inválido.',
        );
      }
      changes.title = titleVO.value;

      // Regenera slug com o novo título (só se mudou de fato)
      if (titleVO.value !== listing.title) {
        const city = input.city ?? listing.city;
        let slug = generateListingSlug(titleVO.value, city);
        let attempts = 0;
        const MAX_ATTEMPTS = 5;

        while (await this.listings.slugExists(slug)) {
          if (++attempts >= MAX_ATTEMPTS) {
            throw new BadRequestException(
              'Não foi possível gerar slug único. Tente novamente.',
            );
          }
          slug = generateListingSlug(titleVO.value, city);
        }
        changes.slug = slug;
      }
    }

    // 3. Valida preço quando alterado
    if (input.price !== undefined) {
      if (input.price <= 0) {
        throw new BadRequestException('O preço deve ser maior que zero.');
      }
      changes.price = input.price;
    }

    // 4. Propaga os demais campos diretamente
    const passthrough: (keyof Omit<UpdateListingInput, 'title' | 'price'>)[] = [
      'description',
      'condominiumFee',
      'iptuYearly',
      'areaM2',
      'builtArea',
      'bedrooms',
      'suites',
      'bathrooms',
      'garageSpots',
      'floor',
      'totalFloors',
      'furnished',
      'petFriendly',
      'yearBuilt',
      'city',
      'state',
      'district',
      'street',
      'streetNumber',
      'complement',
      'zipcode',
      'latitude',
      'longitude',
      'contactName',
      'contactEmail',
      'contactPhone',
      'contactWhatsApp',
      'acceptsExchange',
      'acceptsFinancing',
      'acceptsCarTrade',
      'isLaunch',
      'isReadyToMove',
      'metaTitle',
      'metaDescription',
      'videoUrl',
      'virtualTourUrl',
      'listingPlan',
      'publishToVivaReal',
      'publishToOLX',
      'publishToZapImoveis',
      'type',
      'purpose',
    ];

    for (const key of passthrough) {
      if (input[key] !== undefined) {
        // Type assertion necessária pois trabalhamos com tipos dinâmicos
        (changes as Record<string, unknown>)[key] = input[key];
      }
    }

    return this.listings.update(listingId, changes);
  }
}
