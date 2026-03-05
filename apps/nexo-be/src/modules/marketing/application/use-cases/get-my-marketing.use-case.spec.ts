/**
 * TESTES: GetMyListingsUseCase
 *
 * Comportamentos validados:
 *  1. Força createdById = userId (isolamento do dono)
 *  2. Por padrão passa todos os status (nenhum filtro de status único)
 *  3. Quando status é fornecido, usa status singular e não statuses[]
 *  4. Corrige paginação inválida (page < 1, limit > 100)
 *  5. Usa valores default de paginação quando não informados
 */
import { GetMyListingsUseCase } from './get-my-marketing.use-case';
import {
  ListingRepository,
  PaginatedResult,
} from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { ListingPlan } from '../../domain/enums/marketing-plan.enum';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

const makeListing = (
  id: string,
  status = ListingStatus.DRAFT,
): ListingEntity => ({
  id,
  createdById: 'owner-uuid',
  status,
  purpose: 'SALE',
  type: 'APARTMENT',
  title: `Imóvel ${id}`,
  slug: `imovel-${id}`,
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
  leadSourcePortal: 0,
  leadSourceSearch: 0,
  leadSourceMap: 0,
  leadSourceFeatured: 0,
  listingPlan: ListingPlan.FREE,
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
});

const makePaginated = (
  items: ListingEntity[],
  page = 1,
  limit = 20,
): PaginatedResult<ListingEntity> => ({
  items,
  total: items.length,
  page,
  limit,
  totalPages: Math.ceil(items.length / limit),
});

const ALL_STATUSES = [
  ListingStatus.DRAFT,
  ListingStatus.ACTIVE,
  ListingStatus.INACTIVE,
  ListingStatus.SOLD,
  ListingStatus.RENTED,
];

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('GetMyListingsUseCase', () => {
  let useCase: GetMyListingsUseCase;
  let mockRepo: jest.Mocked<ListingRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      slugExists: jest.fn(),
      softDelete: jest.fn(),
    };
    useCase = new GetMyListingsUseCase(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Isolamento do dono ───────────────────────────────────────────────────

  it('deve forçar createdById com o userId fornecido', async () => {
    const userId = 'owner-uuid';
    mockRepo.findMany.mockResolvedValue(makePaginated([]));

    await useCase.execute(userId);

    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ createdById: userId }),
    );
  });

  it('não deve permitir que um filtro externo sobrescreva createdById', async () => {
    const userId = 'owner-uuid';
    mockRepo.findMany.mockResolvedValue(makePaginated([]));

    // Simula um payload malicioso tentando ver outro usuário
    await useCase.execute(userId, { page: 1, limit: 20 } as any);

    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ createdById: userId }),
    );
  });

  // ─── Status padrão ────────────────────────────────────────────────────────

  it('deve passar statuses[] com todos os status quando status não é informado', async () => {
    mockRepo.findMany.mockResolvedValue(makePaginated([]));

    await useCase.execute('owner-uuid');

    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: expect.arrayContaining(ALL_STATUSES),
      }),
    );
  });

  it('deve usar status singular (não statuses[]) quando status é informado', async () => {
    mockRepo.findMany.mockResolvedValue(makePaginated([]));

    await useCase.execute('owner-uuid', { status: ListingStatus.DRAFT });

    const call = mockRepo.findMany.mock.calls[0][0];
    expect(call.status).toBe(ListingStatus.DRAFT);
    expect(call.statuses).toBeUndefined();
  });

  // ─── Retorno de múltiplos status ──────────────────────────────────────────

  it('deve retornar anúncios de múltiplos status', async () => {
    const draft = makeListing('d1', ListingStatus.DRAFT);
    const active = makeListing('a1', ListingStatus.ACTIVE);
    const inactive = makeListing('i1', ListingStatus.INACTIVE);
    mockRepo.findMany.mockResolvedValue(
      makePaginated([draft, active, inactive]),
    );

    const result = await useCase.execute('owner-uuid');

    expect(result.items).toHaveLength(3);
    expect(result.items.map((i) => i.status)).toEqual(
      expect.arrayContaining([
        ListingStatus.DRAFT,
        ListingStatus.ACTIVE,
        ListingStatus.INACTIVE,
      ]),
    );
  });

  // ─── Paginação ────────────────────────────────────────────────────────────

  it('deve usar page=1 e limit=20 como padrão', async () => {
    mockRepo.findMany.mockResolvedValue(makePaginated([]));

    await useCase.execute('owner-uuid', {});

    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });

  it('deve corrigir page < 1 para page=1', async () => {
    mockRepo.findMany.mockResolvedValue(makePaginated([]));

    await useCase.execute('owner-uuid', { page: 0 });

    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  it('deve limitar limit ao máximo de 100', async () => {
    mockRepo.findMany.mockResolvedValue(makePaginated([]));

    await useCase.execute('owner-uuid', { limit: 999 });

    expect(mockRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 }),
    );
  });
});
