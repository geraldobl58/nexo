/**
 * TESTES: PublishListingUseCase
 *
 * Regras validadas neste arquivo:
 *  1. Retorna o anúncio publicado quando tudo está certo
 *  2. Lança NotFoundException se o anúncio não existe
 *  3. Lança ForbiddenException se o requester não é o dono nem Admin/Moderador
 *  4. Lança BadRequestException se o anúncio não está em DRAFT
 *  5. Lança BadRequestException se faltam campos obrigatórios (preço, cidade, etc.)
 */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PublishListingUseCase } from './publish-marketing.use-case';
import { ListingRepository } from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { ListingPlan } from '../../domain/enums/marketing-plan.enum';

// ─── Fixture helper ───────────────────────────────────────────────────────────

const makeDraftListing = (
  override: Partial<ListingEntity> = {},
): ListingEntity => ({
  id: 'listing-uuid-1',
  createdById: 'owner-uuid',
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
      softDelete: jest.fn(),
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

      // Act — dono publicando o próprio anúncio
      const result = await useCase.execute(draft.id, 'owner-uuid', 'SUPPORT');

      // Assert
      expect(result.status).toBe(ListingStatus.ACTIVE);
      expect(result.publishedAt).toBeDefined();
    });

    it('deve permitir Admin publicar anúncio de outro usuário', async () => {
      const draft = makeDraftListing();
      const published = makeDraftListing({
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
      });

      mockRepo.findById.mockResolvedValue(draft);
      mockRepo.update.mockResolvedValue(published);

      // Admin com id diferente do dono
      const result = await useCase.execute(draft.id, 'admin-uuid', 'ADMIN');

      expect(result.status).toBe(ListingStatus.ACTIVE);
    });

    it('deve permitir Moderador publicar anúncio de outro usuário', async () => {
      const draft = makeDraftListing();
      const published = makeDraftListing({
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
      });

      mockRepo.findById.mockResolvedValue(draft);
      mockRepo.update.mockResolvedValue(published);

      const result = await useCase.execute(
        draft.id,
        'moderator-uuid',
        'MODERATOR',
      );

      expect(result.status).toBe(ListingStatus.ACTIVE);
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
      await useCase.execute(draft.id, 'owner-uuid', 'SUPPORT');

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
      await expect(
        useCase.execute('id-inexistente', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException quando usuário não é o dono', async () => {
      const draft = makeDraftListing(); // createdById = 'owner-uuid'
      mockRepo.findById.mockResolvedValue(draft);

      // Outro usuário comum tentando publicar
      await expect(
        useCase.execute(draft.id, 'outro-usuario-uuid', 'SUPPORT'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException ao publicar anúncio já ACTIVE', async () => {
      mockRepo.findById.mockResolvedValue(
        makeDraftListing({ status: ListingStatus.ACTIVE }),
      );

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException ao publicar anúncio INACTIVE', async () => {
      mockRepo.findById.mockResolvedValue(
        makeDraftListing({ status: ListingStatus.INACTIVE }),
      );

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException ao publicar anúncio SOLD', async () => {
      mockRepo.findById.mockResolvedValue(
        makeDraftListing({ status: ListingStatus.SOLD }),
      );

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando preço está zerado', async () => {
      // Anúncio está em DRAFT mas sem preço — não pode ser publicado
      mockRepo.findById.mockResolvedValue(makeDraftListing({ price: 0 }));

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando cidade está vazia', async () => {
      mockRepo.findById.mockResolvedValue(makeDraftListing({ city: '' }));

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando estado está vazio', async () => {
      mockRepo.findById.mockResolvedValue(makeDraftListing({ state: '' }));

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando bairro está vazio', async () => {
      mockRepo.findById.mockResolvedValue(makeDraftListing({ district: '' }));

      await expect(
        useCase.execute('listing-uuid-1', 'owner-uuid', 'SUPPORT'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
