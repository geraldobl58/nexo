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
import { CreateListingUseCase } from '../../application/use-cases/create-listing.use-case';
import { PublishListingUseCase } from '../../application/use-cases/publish-listing.use-case';
import { UnpublishListingUseCase } from '../../application/use-cases/unpublish-listing.use-case';
import { GetListingsUseCase } from '../../application/use-cases/get-listings.use-case';
import { ListingEntity } from '../../domain/entities/listing.entity';
import { ListingStatus } from '../../domain/enums/listing-status.enum';
import { CreateListingDto } from './dtos/create-listing.dto';
import { GetListingsQueryDto } from './dtos/get-listings-query.dto';

// ─── Fixture helper ───────────────────────────────────────────────────────────

const makeListing = (override: Partial<ListingEntity> = {}): ListingEntity => ({
  id: 'listing-uuid-1',
  advertiserId: 'adv-uuid',
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
  publishedAt: null,
  expiresAt: null,
  deletedAt: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  ...override,
});

// ─── Mocks dos use-cases ──────────────────────────────────────────────────────

const mockCreateListing = { execute: jest.fn() };
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
        advertiserId: listing.advertiserId,
        purpose: listing.purpose,
        type: listing.type,
        title: listing.title,
        price: listing.price,
        city: listing.city,
        state: listing.state,
        district: listing.district,
      } as CreateListingDto;

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(mockCreateListing.execute).toHaveBeenCalledWith(dto);
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

    it('deve chamar PublishListingUseCase.execute() com o id correto', async () => {
      // Arrange
      const published = makeListing({
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
      });
      mockPublishListing.execute.mockResolvedValue(published);

      // Act
      const result = await controller.publish('listing-uuid-1');

      // Assert
      expect(mockPublishListing.execute).toHaveBeenCalledWith('listing-uuid-1');
      expect(result.status).toBe(ListingStatus.ACTIVE);
    });
  });

  // ─── PATCH /listings/:id/unpublish ──────────────────────────────────────

  describe('unpublish()', () => {
    it('deve estar definido', () => {
      expect(controller.unpublish).toBeDefined();
    });

    it('deve chamar UnpublishListingUseCase.execute() com o id correto', async () => {
      // Arrange
      const inactive = makeListing({ status: ListingStatus.INACTIVE });
      mockUnpublishListing.execute.mockResolvedValue(inactive);

      // Act
      const result = await controller.unpublish('listing-uuid-1');

      // Assert
      expect(mockUnpublishListing.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
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

      // Act
      const result = await controller.list(query);

      // Assert
      expect(mockGetListings.execute).toHaveBeenCalledWith(query);
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
      const result = await controller.list({} as GetListingsQueryDto);

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
