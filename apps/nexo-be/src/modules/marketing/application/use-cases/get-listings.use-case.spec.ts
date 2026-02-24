/**
 * TESTES: GetListingsUseCase
 *
 * Comportamentos validados:
 *  1. Delega corretamente para o repositório com os filtros fornecidos
 *  2. Corrige paginação inválida (page < 1, limit > 100, limit < 1)
 *  3. Usa valores padrão quando page/limit não são fornecidos
 */
import { GetListingsUseCase } from './get-listings.use-case';
import {
  ListingRepository,
  PaginatedResult,
} from '../../domain/repositories/listing.repository';
import { ListingEntity } from '../../domain/entities/listing.entity';
import { ListingStatus } from '../../domain/enums/listing-status.enum';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

const makeListing = (id: string): ListingEntity => ({
  id,
  advertiserId: 'adv-uuid',
  status: ListingStatus.ACTIVE,
  purpose: 'SALE',
  type: 'APARTMENT',
  title: `Apartamento número ${id}`,
  slug: `apartamento-numero-${id}`,
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
  publishedAt: new Date(),
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

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('GetListingsUseCase', () => {
  let useCase: GetListingsUseCase;
  let mockRepo: jest.Mocked<ListingRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      slugExists: jest.fn(),
    };

    useCase = new GetListingsUseCase(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Delegação ao repositório ────────────────────────────────────────────

  describe('execute() — delegação ao repositório', () => {
    it('deve retornar o resultado do repositório', async () => {
      // Arrange
      const listings = [makeListing('1'), makeListing('2')];
      const paginated = makePaginated(listings);
      mockRepo.findMany.mockResolvedValue(paginated);

      // Act
      const result = await useCase.execute({ page: 1, limit: 20 });

      // Assert
      expect(result).toEqual(paginated);
      expect(mockRepo.findMany).toHaveBeenCalledTimes(1);
    });

    it('deve repassar filtros opcionais para o repositório', async () => {
      // Arrange
      mockRepo.findMany.mockResolvedValue(makePaginated([]));

      const filters = {
        purpose: 'RENT' as const,
        city: 'São Paulo',
        maxPrice: 500000,
        bedrooms: 3,
        page: 1,
        limit: 10,
      };

      // Act
      await useCase.execute(filters);

      // Assert: o repositório recebeu os filtros corretos
      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          purpose: 'RENT',
          city: 'São Paulo',
          maxPrice: 500000,
          bedrooms: 3,
        }),
      );
    });
  });

  // ─── Paginação: valores padrão ───────────────────────────────────────────

  describe('execute() — valores padrão de paginação', () => {
    it('deve usar page=1 e limit=20 quando não fornecidos', async () => {
      mockRepo.findMany.mockResolvedValue(makePaginated([]));

      await useCase.execute({});

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });
  });

  // ─── Paginação: limites de segurança ─────────────────────────────────────

  describe('execute() — limites de paginação', () => {
    it('deve corrigir page=0 para page=1', async () => {
      mockRepo.findMany.mockResolvedValue(makePaginated([]));

      await useCase.execute({ page: 0 });

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      );
    });

    it('deve corrigir page negativo para page=1', async () => {
      mockRepo.findMany.mockResolvedValue(makePaginated([]));

      await useCase.execute({ page: -5 });

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      );
    });

    it('deve corrigir limit > 100 para limit=100', async () => {
      mockRepo.findMany.mockResolvedValue(makePaginated([]));

      await useCase.execute({ limit: 500 });

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 }),
      );
    });

    it('deve corrigir limit=0 para limit=1', async () => {
      mockRepo.findMany.mockResolvedValue(makePaginated([]));

      await useCase.execute({ limit: 0 });

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 }),
      );
    });

    it('deve aceitar limit=100 sem modificar', async () => {
      mockRepo.findMany.mockResolvedValue(makePaginated([]));

      await useCase.execute({ limit: 100 });

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 }),
      );
    });

    it('deve aceitar page=99 sem modificar', async () => {
      mockRepo.findMany.mockResolvedValue(makePaginated([]));

      await useCase.execute({ page: 99 });

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ page: 99 }),
      );
    });
  });
});
