/**
 * TESTES: GetMyListingByIdUseCase
 *
 * Comportamentos validados:
 *  1. Retorna o anúncio quando pertence ao usuário autenticado
 *  2. Lança NotFoundException quando o anúncio não existe
 *  3. Lança NotFoundException quando o anúncio está soft-deletado
 *  4. Lança ForbiddenException quando o anúncio pertence a outro usuário
 */
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetMyListingByIdUseCase } from './get-my-marketing-by-id.use-case';
import { ListingRepository } from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';

// ─── Fixture ─────────────────────────────────────────────────────────────────

const makeListing = (
  overrides: Partial<ListingEntity> = {},
): ListingEntity => ({
  id: 'listing-uuid',
  advertiserId: 'owner-uuid',
  status: ListingStatus.DRAFT,
  purpose: 'SALE',
  type: 'APARTMENT',
  title: 'Apartamento no Centro',
  slug: 'apartamento-no-centro',
  description: null,
  price: 20000000,
  condominiumFee: null,
  iptuYearly: null,
  areaM2: 60,
  builtArea: 55,
  bedrooms: 2,
  suites: 0,
  bathrooms: 1,
  garageSpots: 1,
  floor: 1,
  totalFloors: 10,
  furnished: false,
  petFriendly: false,
  yearBuilt: 2020,
  city: 'Recife',
  state: 'PE',
  district: 'Boa Viagem',
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
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('GetMyListingByIdUseCase', () => {
  let useCase: GetMyListingByIdUseCase;
  let mockRepo: jest.Mocked<ListingRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      countActiveByAdvertiser: jest.fn().mockResolvedValue(0),
      getAdvertiserPlanLimits: jest.fn().mockResolvedValue({
        maxProperties: 1,
        maxPhotos: 5,
        maxVideos: 0,
      }),
      slugExists: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new GetMyListingByIdUseCase(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Sucesso ─────────────────────────────────────────────────────────────

  it('deve retornar o anúncio quando pertence ao usuário autenticado', async () => {
    const listing = makeListing();
    mockRepo.findById.mockResolvedValue(listing);

    const result = await useCase.execute('listing-uuid', 'owner-uuid');

    expect(result).toBe(listing);
    expect(mockRepo.findById).toHaveBeenCalledWith('listing-uuid');
  });

  it('deve retornar anúncio de qualquer status para o dono', async () => {
    for (const status of Object.values(ListingStatus)) {
      const listing = makeListing({ status });
      mockRepo.findById.mockResolvedValue(listing);

      const result = await useCase.execute('listing-uuid', 'owner-uuid');

      expect(result.status).toBe(status);
    }
  });

  // ─── Não encontrado ───────────────────────────────────────────────────────

  it('deve lançar NotFoundException quando o anúncio não existe', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent-uuid', 'owner-uuid'),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException quando o anúncio está soft-deletado', async () => {
    const deleted = makeListing({ deletedAt: new Date() });
    mockRepo.findById.mockResolvedValue(deleted);

    await expect(useCase.execute('listing-uuid', 'owner-uuid')).rejects.toThrow(
      NotFoundException,
    );
  });

  // ─── Proibido ─────────────────────────────────────────────────────────────

  it('deve lançar ForbiddenException quando o anúncio pertence a outro usuário', async () => {
    const listing = makeListing({ advertiserId: 'other-owner-uuid' });
    mockRepo.findById.mockResolvedValue(listing);

    await expect(
      useCase.execute('listing-uuid', 'caller-uuid'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('não deve vazar a existência do anúncio a um usuário sem acesso via mensagem de ForbiddenException', async () => {
    const listing = makeListing({ advertiserId: 'other-owner-uuid' });
    mockRepo.findById.mockResolvedValue(listing);

    await expect(
      useCase.execute('listing-uuid', 'caller-uuid'),
    ).rejects.toThrow('permissão');
  });
});
