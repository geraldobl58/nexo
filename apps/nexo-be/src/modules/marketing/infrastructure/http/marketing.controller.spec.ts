/**
 * TESTES: MarketingController
 *
 * O que testamos no controller?
 * APENAS que o controller:
 *  1. Delega para o use-case correto
 *  2. Formata a resposta via ListingResponseDto
 *
 * O QUE NÃO testamos aqui:
 *  - Lógica de negócio (isso está nos testes dos use-cases)
 *  - Validação de JWT/guard (isso é responsabilidade do middleware)
 *  - Parsing de DTOs (isso é responsabilidade do ValidationPipe)
 *
 * Padrão: mockamos todos os use-cases com jest.fn()
 */
import { Test, TestingModule } from '@nestjs/testing';
import { MarketingController } from './marketing.controller';
import { CreateListingUseCase } from '../../application/use-cases/create-marketing.use-case';
import { GetListingUseCase } from '../../application/use-cases/get-marketing-by-id.use-case';
import { UpdateListingUseCase } from '../../application/use-cases/update-marketing.use-case';
import { DeleteListingUseCase } from '../../application/use-cases/delete-marketing.use-case';
import { PublishListingUseCase } from '../../application/use-cases/publish-marketing.use-case';
import { UnpublishListingUseCase } from '../../application/use-cases/unpublish-marketing.use-case';
import { GetListingsUseCase } from '../../application/use-cases/get-marketing.use-case';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { ListingPlan } from '../../domain/enums/marketing-plan.enum';
import { CreateListingDto } from './dtos/create-marketing.dto';
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

const mockCreateListing = { execute: jest.fn() };
const mockGetListing = { execute: jest.fn() };
const mockUpdateListing = { execute: jest.fn() };
const mockDeleteListing = { execute: jest.fn() };
const mockPublishListing = { execute: jest.fn() };
const mockUnpublishListing = { execute: jest.fn() };
const mockGetListings = { execute: jest.fn() };

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('MarketingController', () => {
  let controller: MarketingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketingController],
      providers: [
        // Fornece implementações falsas no lugar das reais
        { provide: CreateListingUseCase, useValue: mockCreateListing },
        { provide: GetListingUseCase, useValue: mockGetListing },
        { provide: UpdateListingUseCase, useValue: mockUpdateListing },
        { provide: DeleteListingUseCase, useValue: mockDeleteListing },
        { provide: PublishListingUseCase, useValue: mockPublishListing },
        { provide: UnpublishListingUseCase, useValue: mockUnpublishListing },
        { provide: GetListingsUseCase, useValue: mockGetListings },
      ],
    }).compile();

    controller = module.get<MarketingController>(MarketingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /listings ──────────────────────────────────────────────────────

  describe('create()', () => {
    it('deve estar definido', () => {
      expect(controller.create).toBeDefined();
    });

    it('deve chamar CreateListingUseCase.execute() e retornar ListingResponseDto', async () => {
      // Arrange
      const listing = makeListing();
      mockCreateListing.execute.mockResolvedValue(listing);

      const dto = {
        purpose: listing.purpose,
        type: listing.type,
        title: listing.title,
        price: listing.price,
        city: listing.city,
        state: listing.state,
        district: listing.district,
      } as CreateListingDto;

      const currentUser = { id: 'user-uuid' } as any;

      // Act
      const result = await controller.create(currentUser, dto);

      // Assert
      expect(mockCreateListing.execute).toHaveBeenCalledWith({
        ...dto,
        createdById: currentUser.id,
      });
      expect(mockCreateListing.execute).toHaveBeenCalledTimes(1);
      // O resultado deve ser um DTO (com o id) — não a entidade bruta
      expect(result.id).toBe(listing.id);
      expect(result.title).toBe(listing.title);
      expect(result.status).toBe(ListingStatus.DRAFT);
    });
  });

  // ─── PATCH /listings/:id/publish ────────────────────────────────────────

  describe('publish()', () => {
    it('deve estar definido', () => {
      expect(controller.publish).toBeDefined();
    });

    it('deve chamar PublishListingUseCase.execute() com id e currentUser', async () => {
      // Arrange
      const published = makeListing({
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
      });
      mockPublishListing.execute.mockResolvedValue(published);
      const currentUser = { id: 'owner-uuid', role: 'SUPPORT' } as any;

      // Act
      const result = await controller.publish('listing-uuid-1', currentUser);

      // Assert
      expect(mockPublishListing.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
        'owner-uuid',
        'SUPPORT',
      );
      expect(result.status).toBe(ListingStatus.ACTIVE);
    });
  });

  // ─── PATCH /listings/:id/unpublish ──────────────────────────────────────

  describe('unpublish()', () => {
    it('deve estar definido', () => {
      expect(controller.unpublish).toBeDefined();
    });

    it('deve chamar UnpublishListingUseCase.execute() com id e currentUser', async () => {
      // Arrange
      const inactive = makeListing({ status: ListingStatus.INACTIVE });
      mockUnpublishListing.execute.mockResolvedValue(inactive);
      const currentUser = { id: 'owner-uuid', role: 'SUPPORT' } as any;

      // Act
      const result = await controller.unpublish('listing-uuid-1', currentUser);

      // Assert
      expect(mockUnpublishListing.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
        'owner-uuid',
        'SUPPORT',
      );
      expect(result.status).toBe(ListingStatus.INACTIVE);
    });
  });

  // ─── GET /listings ───────────────────────────────────────────────────────

  describe('list()', () => {
    it('deve estar definido', () => {
      expect(controller.list).toBeDefined();
    });

    it('deve chamar GetListingsUseCase.execute() e retornar PaginatedListingResponseDto', async () => {
      // Arrange
      const listing = makeListing({ status: ListingStatus.ACTIVE });
      mockGetListings.execute.mockResolvedValue({
        items: [listing],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const query = { page: 1, limit: 20 } as GetListingsQueryDto;
      const currentUser = null; // rota pública, sem usuário logado

      // Act
      const result = await controller.list(query, currentUser);

      // Assert: o execute é chamado com advertiserId mapeado para createdById
      expect(mockGetListings.execute).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
      // O item deve ter sido convertido para ListingResponseDto
      expect(result.items[0].id).toBe(listing.id);
    });

    it('deve retornar lista vazia quando não há anúncios', async () => {
      // Arrange
      mockGetListings.execute.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      // Act
      const result = await controller.list({} as GetListingsQueryDto, null);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ─── Definição geral ──────────────────────────────────────────────────────

  describe('definição', () => {
    it('deve estar definido', () => {
      expect(controller).toBeDefined();
    });
  });
});
