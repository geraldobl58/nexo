/**
 * TESTES: MyListingsController (rotas protegidas — dono autenticado)
 *
 * O que testamos:
 *  - POST   /marketing              → create()
 *  - GET    /marketing/me           → listMine()
 *  - GET    /marketing/me/:id       → findMine()
 *  - PATCH  /marketing/:id          → update()
 *  - DELETE /marketing/:id          → remove()
 *  - PATCH  /marketing/:id/publish  → publish()
 *  - PATCH  /marketing/:id/unpublish → unpublish()
 *
 * O controller delega para o use-case correto e formata a resposta.
 * Lógica de negócio (validações, permissões) é testada nos use-cases.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { MyListingsController } from './my-listings.controller';
import { CreateListingUseCase } from '../../application/use-cases/create-marketing.use-case';
import { UpdateListingUseCase } from '../../application/use-cases/update-marketing.use-case';
import { DeleteListingUseCase } from '../../application/use-cases/delete-marketing.use-case';
import { PublishListingUseCase } from '../../application/use-cases/publish-marketing.use-case';
import { UnpublishListingUseCase } from '../../application/use-cases/unpublish-marketing.use-case';
import { GetMyListingsUseCase } from '../../application/use-cases/get-my-marketing.use-case';
import { GetMyListingByIdUseCase } from '../../application/use-cases/get-my-marketing-by-id.use-case';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { CreateListingDto } from './dtos/create-marketing.dto';
import { GetListingsQueryDto } from './dtos/get-marketing-query.dto';

// ─── Fixture helper ───────────────────────────────────────────────────────────

const makeListing = (override: Partial<ListingEntity> = {}): ListingEntity => ({
  id: 'listing-uuid-1',
  advertiserId: 'owner-uuid',
  status: ListingStatus.DRAFT,
  purpose: 'SALE',
  type: 'APARTMENT',
  title: 'Apartamento 3 quartos no Leblon',
  slug: 'apartamento-3-quartos-leblon-x7k2m9',
  description: null,
  price: 120000000,
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
  contactName: null,
  contactEmail: null,
  contactPhone: null,
  contactWhatsApp: null,
  videoUrl: null,
  virtualTourUrl: null,
  viewsCount: 0,
  uniqueViewsCount: 0,
  leadsCount: 0,
  favoritesCount: 0,
  sharesCount: 0,
  phoneClicksCount: 0,
  whatsappClicksCount: 0,
  emailClicksCount: 0,
  isFeatured: false,
  highlightUntil: null,
  averageRating: null,
  totalReviews: 0,
  publishToVivaReal: false,
  publishToOLX: false,
  publishToZapImoveis: false,
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
const mockUpdateListing = { execute: jest.fn() };
const mockDeleteListing = { execute: jest.fn() };
const mockPublishListing = { execute: jest.fn() };
const mockUnpublishListing = { execute: jest.fn() };
const mockGetMyListings = { execute: jest.fn() };
const mockGetMyListingById = { execute: jest.fn() };

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('MyListingsController', () => {
  let controller: MyListingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyListingsController],
      providers: [
        { provide: CreateListingUseCase, useValue: mockCreateListing },
        { provide: UpdateListingUseCase, useValue: mockUpdateListing },
        { provide: DeleteListingUseCase, useValue: mockDeleteListing },
        { provide: PublishListingUseCase, useValue: mockPublishListing },
        { provide: UnpublishListingUseCase, useValue: mockUnpublishListing },
        { provide: GetMyListingsUseCase, useValue: mockGetMyListings },
        { provide: GetMyListingByIdUseCase, useValue: mockGetMyListingById },
      ],
    }).compile();

    controller = module.get<MyListingsController>(MyListingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /marketing ─────────────────────────────────────────────────────

  describe('create()', () => {
    it('deve estar definido', () => {
      expect(controller.create).toBeDefined();
    });

    it('deve chamar CreateListingUseCase com advertiserId do token JWT', async () => {
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
      const currentUser = { id: 'owner-uuid' } as any;

      const result = await controller.create(currentUser, dto);

      expect(mockCreateListing.execute).toHaveBeenCalledWith({
        ...dto,
        advertiserId: 'owner-uuid',
      });
      expect(result.id).toBe(listing.id);
      expect(result.status).toBe(ListingStatus.DRAFT);
    });
  });

  // ─── GET /marketing/me ───────────────────────────────────────────────────

  describe('listMine()', () => {
    it('deve estar definido', () => {
      expect(controller.listMine).toBeDefined();
    });

    it('deve chamar GetMyListingsUseCase com o ID do usuário autenticado', async () => {
      const draft = makeListing({ status: ListingStatus.DRAFT });
      const active = makeListing({
        id: 'listing-uuid-2',
        status: ListingStatus.ACTIVE,
      });
      mockGetMyListings.execute.mockResolvedValue({
        items: [draft, active],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      const currentUser = { id: 'owner-uuid' } as any;

      const result = await controller.listMine(currentUser, {
        page: 1,
        limit: 10,
      } as GetListingsQueryDto);

      expect(mockGetMyListings.execute).toHaveBeenCalledWith(
        'owner-uuid',
        expect.objectContaining({ page: 1, limit: 10 }),
      );
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('deve retornar lista vazia quando o dono não tem anúncios', async () => {
      mockGetMyListings.execute.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      const result = await controller.listMine(
        { id: 'owner-uuid' } as any,
        {} as GetListingsQueryDto,
      );

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ─── GET /marketing/me/:id ───────────────────────────────────────────────

  describe('findMine()', () => {
    it('deve estar definido', () => {
      expect(controller.findMine).toBeDefined();
    });

    it('deve chamar GetMyListingByIdUseCase com id e userId', async () => {
      const listing = makeListing();
      mockGetMyListingById.execute.mockResolvedValue(listing);

      const result = await controller.findMine('listing-uuid-1', {
        id: 'owner-uuid',
      } as any);

      expect(mockGetMyListingById.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
        'owner-uuid',
      );
      expect(result.id).toBe(listing.id);
    });
  });

  // ─── PATCH /marketing/:id ────────────────────────────────────────────────

  describe('update()', () => {
    it('deve estar definido', () => {
      expect(controller.update).toBeDefined();
    });

    it('deve chamar UpdateListingUseCase com id, dto, userId e role', async () => {
      const updated = makeListing({ title: 'Novo Título' });
      mockUpdateListing.execute.mockResolvedValue(updated);
      const currentUser = { id: 'owner-uuid', role: 'SUPPORT' } as any;

      const result = await controller.update('listing-uuid-1', currentUser, {
        title: 'Novo Título',
      } as any);

      expect(mockUpdateListing.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
        { title: 'Novo Título' },
        'owner-uuid',
        'SUPPORT',
      );
      expect(result.title).toBe('Novo Título');
    });
  });

  // ─── DELETE /marketing/:id ───────────────────────────────────────────────

  describe('remove()', () => {
    it('deve estar definido', () => {
      expect(controller.remove).toBeDefined();
    });

    it('deve chamar DeleteListingUseCase com id, userId e role', async () => {
      mockDeleteListing.execute.mockResolvedValue(undefined);
      const currentUser = { id: 'owner-uuid', role: 'SUPPORT' } as any;

      await controller.remove('listing-uuid-1', currentUser);

      expect(mockDeleteListing.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
        'owner-uuid',
        'SUPPORT',
      );
    });
  });

  // ─── PATCH /marketing/:id/publish ────────────────────────────────────────

  describe('publish()', () => {
    it('deve estar definido', () => {
      expect(controller.publish).toBeDefined();
    });

    it('deve chamar PublishListingUseCase com id, userId e role', async () => {
      const published = makeListing({
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
      });
      mockPublishListing.execute.mockResolvedValue(published);
      const currentUser = { id: 'owner-uuid', role: 'SUPPORT' } as any;

      const result = await controller.publish('listing-uuid-1', currentUser);

      expect(mockPublishListing.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
        'owner-uuid',
        'SUPPORT',
      );
      expect(result.status).toBe(ListingStatus.ACTIVE);
    });
  });

  // ─── PATCH /marketing/:id/unpublish ──────────────────────────────────────

  describe('unpublish()', () => {
    it('deve estar definido', () => {
      expect(controller.unpublish).toBeDefined();
    });

    it('deve chamar UnpublishListingUseCase com id, userId e role', async () => {
      const inactive = makeListing({ status: ListingStatus.INACTIVE });
      mockUnpublishListing.execute.mockResolvedValue(inactive);
      const currentUser = { id: 'owner-uuid', role: 'SUPPORT' } as any;

      const result = await controller.unpublish('listing-uuid-1', currentUser);

      expect(mockUnpublishListing.execute).toHaveBeenCalledWith(
        'listing-uuid-1',
        'owner-uuid',
        'SUPPORT',
      );
      expect(result.status).toBe(ListingStatus.INACTIVE);
    });
  });

  // ─── Definição geral ─────────────────────────────────────────────────────

  describe('definição', () => {
    it('deve estar definido', () => {
      expect(controller).toBeDefined();
    });
  });
});
