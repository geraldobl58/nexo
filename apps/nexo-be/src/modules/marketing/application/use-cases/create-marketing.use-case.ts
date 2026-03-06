import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  CreateListingData,
  LISTING_REPOSITORY,
  ListingRepository,
} from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingTitle } from '../../domain/value-objects/marketing-title.vo';
import { ListingPlan } from '../../domain/enums/marketing-plan.enum';
import { generateListingSlug } from '../utils/slug.util';

/**
 * DADOS DE ENTRADA para criar um anúncio.
 *
 * Esse tipo é o "contrato" entre o controller (HTTP) e o use-case.
 * O controller valida o formato (via DTOs com class-validator),
 * e o use-case valida as regras de negócio.
 */
export type CreateListingInput = {
  createdById: string;
  purpose: ListingEntity['purpose'];
  type: ListingEntity['type'];
  title: string;
  description?: string;
  price: number;
  condominiumFee?: number;
  iptuYearly?: number;
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
  city: string;
  state: string;
  district: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  acceptsExchange?: boolean;
  acceptsFinancing?: boolean;
  acceptsCarTrade?: boolean;
  isLaunch?: boolean;
  isReadyToMove?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  // Identificação externa
  externalId?: string;
  // Contato específico do anúncio
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsApp?: string;
  // Mídia
  videoUrl?: string;
  virtualTourUrl?: string;
  // Plano e integração
  listingPlan?: ListingPlan;
  publishToVivaReal?: boolean;
  publishToOLX?: boolean;
  publishToZapImoveis?: boolean;
};

/**
 * USE CASE: CRIAR ANÚNCIO
 *
 * O que é um Use Case?
 * É uma classe responsável por UMA ação do negócio.
 * Contém a lógica de negócio, MAS não sabe nada de HTTP, banco de dados
 * ou qualquer framework. Ele é puro TypeScript.
 *
 * Responsabilidades deste use-case:
 *  1. Validar o título com o Value Object ListingTitle
 *  2. Validar preço positivo
 *  3. Gerar um slug único
 *  4. Persistir o anúncio como DRAFT via repositório
 */
@Injectable()
export class CreateListingUseCase {
  constructor(
    /**
     * @Inject(): usamos o token string porque o repositório é uma interface.
     * Interfaces não existem em runtime no JavaScript — precisamos do token.
     */
    @Inject(LISTING_REPOSITORY)
    private readonly listings: ListingRepository,
  ) {}

  /**
   * Executa a criação do anúncio.
   *
   * @param input - Dados do formulário de criação
   * @returns A entidade criada com status DRAFT
   */
  async execute(input: CreateListingInput): Promise<ListingEntity> {
    // --- Validação de negócio ---

    // 1. Valida o título com nosso Value Object.
    //    Se for inválido, lança Error que convertemos em 400.
    let titleVO: ListingTitle;
    try {
      titleVO = ListingTitle.create(input.title);
    } catch (err: unknown) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Título inválido.',
      );
    }

    // 2. Preço deve ser positivo.
    if (input.price <= 0) {
      throw new BadRequestException('O preço deve ser maior que zero.');
    }

    // 3. Limite do plano FREE: máximo 1 anúncio (não-deletado, não SOLD/RENTED).
    const effectivePlan = input.listingPlan ?? ListingPlan.FREE;
    if (effectivePlan === ListingPlan.FREE) {
      const freeCount = await this.listings.countActiveFreeByOwner(
        input.createdById,
      );
      if (freeCount >= 1) {
        throw new ForbiddenException(
          'O plano FREE permite apenas 1 imóvel ativo. Faça upgrade para continuar anunciando.',
        );
      }
    }

    // --- Geração do slug único ---

    // Tentamos gerar um slug. Em caso (muito raro) de colisão, tentamos de novo.
    let slug = generateListingSlug(titleVO.value, input.city);
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (await this.listings.slugExists(slug)) {
      if (++attempts >= MAX_ATTEMPTS) {
        throw new BadRequestException(
          'Não foi possível gerar slug único. Tente novamente.',
        );
      }
      slug = generateListingSlug(titleVO.value, input.city);
    }

    // --- Persistência ---

    // Monta o objeto de criação com todos os campos + slug gerado.
    // Status "DRAFT" é definido pelo repositório como padrão (via Prisma schema).
    const data: CreateListingData = {
      createdById: input.createdById,
      purpose: input.purpose,
      type: input.type,
      title: titleVO.value, // usamos o título normalizado (sem espaços extras)
      description: input.description,
      price: input.price,
      condominiumFee: input.condominiumFee,
      iptuYearly: input.iptuYearly,
      areaM2: input.areaM2,
      builtArea: input.builtArea,
      bedrooms: input.bedrooms,
      suites: input.suites,
      bathrooms: input.bathrooms,
      garageSpots: input.garageSpots,
      floor: input.floor,
      totalFloors: input.totalFloors,
      furnished: input.furnished,
      petFriendly: input.petFriendly,
      yearBuilt: input.yearBuilt,
      city: input.city,
      state: input.state,
      district: input.district,
      street: input.street,
      streetNumber: input.streetNumber,
      complement: input.complement,
      zipcode: input.zipcode,
      latitude: input.latitude,
      longitude: input.longitude,
      acceptsExchange: input.acceptsExchange ?? false,
      acceptsFinancing: input.acceptsFinancing ?? true,
      acceptsCarTrade: input.acceptsCarTrade ?? false,
      isLaunch: input.isLaunch ?? false,
      isReadyToMove: input.isReadyToMove ?? false,
      slug,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      // Identificação externa
      externalId: input.externalId,
      // Contato específico do anúncio
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      contactWhatsApp: input.contactWhatsApp,
      // Mídia
      videoUrl: input.videoUrl,
      virtualTourUrl: input.virtualTourUrl,
      // Plano e integração
      listingPlan: input.listingPlan,
      publishToVivaReal: input.publishToVivaReal ?? false,
      publishToOLX: input.publishToOLX ?? false,
      publishToZapImoveis: input.publishToZapImoveis ?? false,
    };

    return this.listings.create(data);
  }
}
