/**
 * TESTES: PublishListingUseCase
 *
 * Regras validadas neste arquivo:
 *  1. Retorna o anúncio publicado quando tudo está certo
 *  2. Lança NotFoundException se o anúncio não existe
 *  3. Lança BadRequestException se o anúncio não está em DRAFT
 *  4. Lança BadRequestException se faltam campos obrigatórios (preço, cidade, etc.)
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PublishListingUseCase } from './publish-listing.use-case';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { ListingEntity } from '../../domain/entities/listing.entity';
import { ListingStatus } from '../../domain/enums/listing-status.enum';

// ─── Fixture helper ───────────────────────────────────────────────────────────

const makeDraftListing = (
  override: Partial<ListingEntity> = {},
): ListingEntity => ({
  id: 'listing-uuid-1',
  advertiserId: 'adv-uuid',
  status: ListingStatus.DRAFT,
  purpose: 'SALE',
  type: 'APARTMENT',
  title: 'Apartamento 3 quartos no centro',
  slug: 'apartamento-3-quartos-x7k2m9',
  description: null,
  price: 35000000, // R$ 350.000,00
  condominiumFee: null,
  iptuYearly: null,
  areaM2: 80,
  builtArea: 70,
  bedrooms: 3,
  suites: 1,
  bathrooms: 2,
  garageSpots: 1,
  floor: 5,
  totalFloors: 12,
  furnished: false,
  petFriendly: true,
  yearBuilt: 2018,
  city: 'São Paulo',
  state: 'SP',
  district: 'Centro',
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
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...override,
});

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('PublishListingUseCase', () => {
  let useCase: PublishListingUseCase;
  let mockRepo: jest.Mocked<ListingRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      slugExists: jest.fn(),
    };

    useCase = new PublishListingUseCase(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Caminho feliz ────────────────────────────────────────────────────────

  describe('execute() — caminho feliz', () => {
    it('deve retornar anúncio com status ACTIVE e publishedAt preenchido', async () => {
      // Arrange
      const draft = makeDraftListing();
      const published = makeDraftListing({
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
      });

      mockRepo.findById.mockResolvedValue(draft);
      mockRepo.update.mockResolvedValue(published);

      // Act
      const result = await useCase.execute(draft.id);

      // Assert
      expect(result.status).toBe(ListingStatus.ACTIVE);
      expect(result.publishedAt).toBeDefined();
    });

    it('deve chamar update com status ACTIVE e publishedAt', async () => {
      // Arrange
      const draft = makeDraftListing();
      mockRepo.findById.mockResolvedValue(draft);
      mockRepo.update.mockResolvedValue(
        makeDraftListing({
          status: ListingStatus.ACTIVE,
          publishedAt: new Date(),
        }),
      );

      // Act
      await useCase.execute(draft.id);

      // Assert: verifica que o repositório foi chamado corretamente
      expect(mockRepo.update).toHaveBeenCalledWith(
        draft.id,
        expect.objectContaining({
          status: ListingStatus.ACTIVE,
          publishedAt: expect.any(Date),
        }),
      );
    });
  });

  // ─── Erros esperados ────────────────────────────────────────────────────────

  describe('execute() — erros', () => {
    it('deve lançar NotFoundException quando anúncio não existe', async () => {
      // Arrange: repositório retorna null (não encontrado)
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException ao publicar anúncio já ACTIVE', async () => {
      mockRepo.findById.mockResolvedValue(
        makeDraftListing({ status: ListingStatus.ACTIVE }),
      );

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException ao publicar anúncio INACTIVE', async () => {
      mockRepo.findById.mockResolvedValue(
        makeDraftListing({ status: ListingStatus.INACTIVE }),
      );

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException ao publicar anúncio SOLD', async () => {
      mockRepo.findById.mockResolvedValue(
        makeDraftListing({ status: ListingStatus.SOLD }),
      );

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando preço está zerado', async () => {
      // Anúncio está em DRAFT mas sem preço — não pode ser publicado
      mockRepo.findById.mockResolvedValue(makeDraftListing({ price: 0 }));

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando cidade está vazia', async () => {
      mockRepo.findById.mockResolvedValue(makeDraftListing({ city: '' }));

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando estado está vazio', async () => {
      mockRepo.findById.mockResolvedValue(makeDraftListing({ state: '' }));

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando bairro está vazio', async () => {
      mockRepo.findById.mockResolvedValue(makeDraftListing({ district: '' }));

      await expect(useCase.execute('listing-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
