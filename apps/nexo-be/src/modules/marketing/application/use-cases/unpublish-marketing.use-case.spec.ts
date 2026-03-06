/**
 * TESTES: UnpublishListingUseCase
 *
 * Regras validadas:
 *  1. Move um anúncio ACTIVE para INACTIVE
 *  2. Lança NotFoundException quando o anúncio não existe
 *  3. Lança ForbiddenException quando o requester não é o dono nem Admin/Moderador
 *  4. Lança BadRequestException quando o anúncio não está ACTIVE
 */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UnpublishListingUseCase } from './unpublish-marketing.use-case';
import { ListingRepository } from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { ListingPlan } from '../../domain/enums/marketing-plan.enum';

// ─── Fixture helper ───────────────────────────────────────────────────────────

const makeActiveListing = (
  override: Partial<ListingEntity> = {},
): ListingEntity => ({
  id: 'listing-uuid-1',
  createdById: 'owner-uuid',
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
      softDelete: jest.fn(),
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

      // Act — dono despublicando o próprio anúncio
      const result = await useCase.execute(active.id, 'owner-uuid', 'SUPPORT');

      // Assert
      expect(result.status).toBe(ListingStatus.INACTIVE);
    });

    it('deve permitir Admin despublicar anúncio de outro usuário', async () => {
      const active = makeActiveListing();
      mockRepo.findById.mockResolvedValue(active);
      mockRepo.update.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.INACTIVE }),
      );

      const result = await useCase.execute(active.id, 'admin-uuid', 'ADMIN');

      expect(result.status).toBe(ListingStatus.INACTIVE);
    });

    it('deve permitir Moderador despublicar anúncio de outro usuário', async () => {
      const active = makeActiveListing();
      mockRepo.findById.mockResolvedValue(active);
      mockRepo.update.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.INACTIVE }),
      );

      const result = await useCase.execute(
        active.id,
        'moderator-uuid',
        'MODERATOR',
      );

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
      await useCase.execute(active.id, 'owner-uuid', 'SUPPORT');

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

      await expect(
        useCase.execute('id-nao-existe', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException quando usuário não é o dono', async () => {
      const active = makeActiveListing(); // createdById = 'owner-uuid'
      mockRepo.findById.mockResolvedValue(active);

      await expect(
        useCase.execute(active.id, 'outro-usuario-uuid', 'SUPPORT'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException ao despublicar anúncio DRAFT', async () => {
      mockRepo.findById.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.DRAFT }),
      );

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException ao despublicar anúncio INACTIVE', async () => {
      mockRepo.findById.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.INACTIVE }),
      );

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException ao despublicar anúncio SOLD', async () => {
      mockRepo.findById.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.SOLD }),
      );

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException ao despublicar anúncio RENTED', async () => {
      mockRepo.findById.mockResolvedValue(
        makeActiveListing({ status: ListingStatus.RENTED }),
      );

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
