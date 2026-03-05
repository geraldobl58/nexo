/**
 * TESTES: MarketingController (rotas públicas)
 *
 * O que testamos:
 *  - GET /marketing       → list()
 *  - GET /marketing/:id   → findOne()
 *
 * O controller delega para o use-case correto e formata a resposta.
 * Lógica de negócio (validações, permissões) é testada nos use-cases.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { GetListingUseCase } from '../../application/use-cases/get-marketing-by-id.use-case';
import { GetListingsUseCase } from '../../application/use-cases/get-marketing.use-case';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { ListingPlan } from '../../domain/enums/marketing-plan.enum';
import { GetListingsQueryDto } from './dtos/get-marketing-query.dto';

// ─── Fixture helper ───────────────────────────────────────────────────────────

const makeListing = (override: Partial<ListingEntity> = {}): ListingEntity => ({
  id: 'listing-uuid-1',
  createdById: 'user-uuid',
  status: ListingStatus.DRAFT,
  purpose: 'SALE',
  type: 'APARTMENT',
  title: 'Apartamento 3 quartos no Leblon',
  slug: 'apartamento-3-quartos-leblon-x7k2m9',
  description: null,
  price: 120000000, // R$ 1.200.000
  condominiumFee: null,
  iptuYearly: null,
  areaM2: 100,
  builtArea: 90,
  bedrooms: 3,
  suites: 2,
  bathrooms: 3,
  garageSpots: 2,
  floor: 8,
  totalFloors: 15,
  furnished: false,
  petFriendly: true,
  yearBuilt: 2010,
  city: 'Rio de Janeiro',
  state: 'RJ',
  district: 'Leblon',
  street: null,
  streetNumber: null,
  complement: null,
  zipcode: null,
  latitude: null,
  longitude: null,
  acceptsExchange: false,
  acceptsFinancing: true,
  acceptsCarTrade: false,
  isLaunch: false,
  isReadyToMove: true,
  metaTitle: null,
  metaDescription: null,
  // Contato
  contactName: null,
  contactEmail: null,
  contactPhone: null,
  contactWhatsApp: null,
  // Mídia
  videoUrl: null,
  virtualTourUrl: null,
  // Analytics
  viewsCount: 0,
  uniqueViewsCount: 0,
  leadsCount: 0,
  favoritesCount: 0,
  sharesCount: 0,
  phoneClicksCount: 0,
  whatsappClicksCount: 0,
  emailClicksCount: 0,
  leadSourcePortal: 0,
  leadSourceSearch: 0,
  leadSourceMap: 0,
  leadSourceFeatured: 0,
  // Plano
  listingPlan: ListingPlan.FREE,
  isFeatured: false,
  highlightUntil: null,
  // Avaliação
  averageRating: null,
  totalReviews: 0,
  // Integração
  publishToVivaReal: false,
  publishToOLX: false,
  publishToZapImoveis: false,
  // Identificação
  externalId: null,
  publishedAt: null,
  expiresAt: null,
  deletedAt: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  ...override,
});

// ─── Mocks dos use-cases ──────────────────────────────────────────────────────

const mockGetListing = { execute: jest.fn() };
const mockGetListings = { execute: jest.fn() };

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('MarketingController', () => {
  let controller: MarketingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketingController],
      providers: [
        { provide: GetListingUseCase, useValue: mockGetListing },
        { provide: GetListingsUseCase, useValue: mockGetListings },
      ],
    }).compile();

    controller = module.get<MarketingController>(MarketingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /marketing ──────────────────────────────────────────────────────

  describe('list()', () => {
    it('deve estar definido', () => {
      expect(controller.list).toBeDefined();
    });

    it('deve chamar GetListingsUseCase.execute() e retornar PaginatedListingResponseDto', async () => {
      const listing = makeListing({ status: ListingStatus.ACTIVE });
      mockGetListings.execute.mockResolvedValue({
        items: [listing],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await controller.list(
        { page: 1, limit: 20 } as GetListingsQueryDto,
        null,
      );

      expect(mockGetListings.execute).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe(listing.id);
    });

    it('deve retornar lista vazia quando não há anúncios', async () => {
      mockGetListings.execute.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const result = await controller.list({} as GetListingsQueryDto, null);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('deve lançar ForbiddenException ao filtrar status não-ACTIVE sem autenticação', async () => {
      const query = { status: 'DRAFT' } as GetListingsQueryDto;

      await expect(controller.list(query, null)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── GET /marketing/:id ──────────────────────────────────────────────────

  describe('findOne()', () => {
    it('deve estar definido', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('deve chamar GetListingUseCase.execute() e retornar ListingResponseDto', async () => {
      const listing = makeListing({ status: ListingStatus.ACTIVE });
      mockGetListing.execute.mockResolvedValue(listing);

      const result = await controller.findOne('listing-uuid-1', null);

      expect(mockGetListing.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
        undefined,
        undefined,
      );
      expect(result.id).toBe(listing.id);
    });
  });

  // ─── Definição geral ──────────────────────────────────────────────────────

  describe('definição', () => {
    it('deve estar definido', () => {
      expect(controller).toBeDefined();
    });
  });
});
