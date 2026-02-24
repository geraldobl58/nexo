/**
 * TESTES: UnpublishListingUseCase
 *
 * Regras validadas:
 *  1. Move um anúncio ACTIVE para INACTIVE
 *  2. Lança NotFoundException quando o anúncio não existe
 *  3. Lança BadRequestException quando o anúncio não está ACTIVE
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UnpublishListingUseCase } from './unpublish-listing.use-case';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { ListingEntity } from '../../domain/entities/listing.entity';
import { ListingStatus } from '../../domain/enums/listing-status.enum';

// ─── Fixture helper ───────────────────────────────────────────────────────────

const makeActiveListing = (
  override: Partial<ListingEntity> = {},
): ListingEntity => ({
  id: 'listing-uuid-1',
  advertiserId: 'adv-uuid',
  status: ListingStatus.ACTIVE,
  purpose: 'RENT',
  type: 'APARTMENT',
  title: 'Apartamento para alugar no Bairro Alto',
  slug: 'apartamento-alugar-bairro-alto-x7k2m9',
  description: null,
  price: 250000, // R$ 2.500,00/mês
  condominiumFee: null,
  iptuYearly: null,
  areaM2: 60,
  builtArea: 55,
  bedrooms: 2,
  suites: 0,
  bathrooms: 1,
  garageSpots: 1,
  floor: 3,
  totalFloors: 8,
  furnished: true,
  petFriendly: false,
  yearBuilt: 2015,
  city: 'Curitiba',
  state: 'PR',
  district: 'Bairro Alto',
  street: null,
  streetNumber: null,
  complement: null,
  zipcode: null,
  latitude: null,
  longitude: null,
  acceptsExchange: false,
  acceptsFinancing: false,
  acceptsCarTrade: false,
  isLaunch: false,
  isReadyToMove: true,
  metaTitle: null,
  metaDescription: null,
  publishedAt: new Date('2024-03-01'),
  expiresAt: null,
  deletedAt: null,
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-03-01'),
  ...override,
});

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('UnpublishListingUseCase', () => {
  let useCase: UnpublishListingUseCase;
  let mockRepo: jest.Mocked<ListingRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      slugExists: jest.fn(),
    };

    useCase = new UnpublishListingUseCase(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Caminho feliz ────────────────────────────────────────────────────────

  describe('execute() — caminho feliz', () => {
    it('deve retornar anúncio com status INACTIVE', async () => {
      // Arrange
      const active = makeActiveListing();
      const inactive = makeActiveListing({ status: ListingStatus.INACTIVE });

      mockRepo.findById.mockResolvedValue(active);
      mockRepo.update.mockResolvedValue(inactive);

      // Act
      const result = await useCase.execute(active.id);

      // Assert
      expect(result.status).toBe(ListingStatus.INACTIVE);
    });

    it('deve chamar update com status INACTIVE', async () => {
      // Arrange
      const active = makeActiveListing();
      mockRepo.findById.mockResolvedValue(active);
      mockRepo.update.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.INACTIVE }),
      );

      // Act
      await useCase.execute(active.id);

      // Assert
      expect(mockRepo.update).toHaveBeenCalledWith(active.id, {
        status: ListingStatus.INACTIVE,
      });
    });
  });

  // ─── Erros esperados ────────────────────────────────────────────────────────

  describe('execute() — erros', () => {
    it('deve lançar NotFoundException quando anúncio não existe', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('id-nao-existe')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException ao despublicar anúncio DRAFT', async () => {
      mockRepo.findById.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.DRAFT }),
      );

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException ao despublicar anúncio INACTIVE', async () => {
      mockRepo.findById.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.INACTIVE }),
      );

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException ao despublicar anúncio SOLD', async () => {
      mockRepo.findById.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.SOLD }),
      );

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException ao despublicar anúncio RENTED', async () => {
      mockRepo.findById.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.RENTED }),
      );

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
