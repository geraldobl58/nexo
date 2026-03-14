/**
 * TESTES: CreateListingUseCase
 *
 * Objetivo: garantir que a lógica de criação de anúncios
 * está correta ANTES de qualquer banco de dados ou HTTP entrar em cena.
 *
 * Estratégia: "mock" do repositório
 * Em vez de usar o banco real, criamos um objeto falso (mock) que
 * simula o comportamento do `ListingRepository`. Assim o teste:
 *  - Executa em milissegundos (sem I/O)
 *  - Não depende de banco configurado
 *  - Testa APENAS a lógica do use-case
 */
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateListingUseCase } from './create-marketing.use-case';
import { ListingRepository } from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';

// ─── Fixture helpers ─────────────────────────────────────────────────────────

/**
 * Cria uma ListingEntity mínima para usar como retorno dos mocks.
 * `override` permite sobrescrever campos individualmente em cada teste.
 */
const makeListing = (override: Partial<ListingEntity> = {}): ListingEntity => ({
  id: 'uuid-1',
  advertiserId: 'user-uuid',
  status: ListingStatus.DRAFT,
  purpose: 'SALE',
  type: 'APARTMENT',
  title: 'Apartamento 3 quartos no centro',
  slug: 'apartamento-3-quartos-no-centro-x7k2m9',
  description: null,
  price: 35000000,
  condominiumFee: null,
  iptuYearly: null,
  areaM2: null,
  builtArea: null,
  bedrooms: null,
  suites: null,
  bathrooms: null,
  garageSpots: null,
  floor: null,
  totalFloors: null,
  furnished: false,
  petFriendly: false,
  yearBuilt: null,
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
  isReadyToMove: false,
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
  // Destaque
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

/**
 * Dados de entrada mínimos válidos para CreateListingUseCase.
 */
const makeInput = (
  override: Partial<Parameters<CreateListingUseCase['execute']>[0]> = {},
) => ({
  advertiserKeycloakId: 'user-uuid',
  purpose: 'SALE' as const,
  type: 'APARTMENT' as const,
  title: 'Apartamento 3 quartos no centro',
  price: 35000000,
  city: 'São Paulo',
  state: 'SP',
  district: 'Centro',
  ...override,
});

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('CreateListingUseCase', () => {
  let useCase: CreateListingUseCase;
  let mockRepo: jest.Mocked<ListingRepository>;

  beforeEach(() => {
    // Cria um mock: todas as funções do repositório são substituídas por jest.fn()
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      slugExists: jest.fn(),
      softDelete: jest.fn(),
      countActiveByAdvertiser: jest.fn().mockResolvedValue(0),
      getAdvertiserPlanLimits: jest.fn().mockResolvedValue({
        maxProperties: 1,
        maxPhotos: 5,
        maxVideos: 0,
      }),
      resolveAdvertiserIdByKeycloakId: jest
        .fn()
        .mockImplementation((id: string) => Promise.resolve(id)),
    };

    // Instancia o use-case diretamente (sem NestJS TestingModule)
    // porque ele não tem dependências além do repositório.
    useCase = new CreateListingUseCase(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Caminho feliz ────────────────────────────────────────────────────────

  describe('execute() — casos de sucesso', () => {
    it('deve criar anúncio e retornar a entidade criada', async () => {
      // Arrange
      const input = makeInput();
      const expected = makeListing();

      mockRepo.slugExists.mockResolvedValue(false); // slug não existe → pode usar
      mockRepo.create.mockResolvedValue(expected);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual(expected);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      // Verifica que o repositório recebeu o título (possivelmente normalizado)
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: input.title }),
      );
    });

    it('deve passar um slug gerado para o repositório', async () => {
      // Arrange
      mockRepo.slugExists.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(makeListing());

      // Act
      await useCase.execute(makeInput());

      // Assert: o campo slug deve ter sido enviado para o repositório
      const callArg = mockRepo.create.mock.calls[0][0];
      expect(callArg.slug).toBeTruthy();
      expect(typeof callArg.slug).toBe('string');
    });

    it('deve tentar novo slug quando o primeiro já existe (retry)', async () => {
      // Arrange: primeiro slug colidiu, segundo não
      mockRepo.slugExists
        .mockResolvedValueOnce(true) // 1ª tentativa: já existe
        .mockResolvedValueOnce(false); // 2ª tentativa: livre
      mockRepo.create.mockResolvedValue(makeListing());

      // Act
      await useCase.execute(makeInput());

      // Assert: slugExists foi chamado 2 vezes
      expect(mockRepo.slugExists).toHaveBeenCalledTimes(2);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });

    it('deve fazer trim do título antes de persistir', async () => {
      // Arrange
      const input = makeInput({ title: '  Apartamento com espaços extras  ' });
      mockRepo.slugExists.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(
        makeListing({ title: 'Apartamento com espaços extras' }),
      );

      // Act
      await useCase.execute(input);

      // Assert: título foi trimado antes de ir ao repositório
      const callArg = mockRepo.create.mock.calls[0][0];
      expect(callArg.title).toBe('Apartamento com espaços extras');
    });
  });

  // ─── Validação de negócio ─────────────────────────────────────────────────

  describe('execute() — validações (devem lançar BadRequestException)', () => {
    it('deve lançar BadRequestException quando título for muito curto', async () => {
      const input = makeInput({ title: 'Curto' }); // < 10 chars

      await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
      // Repositório NÃO deve ser chamado
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando título for muito longo', async () => {
      const input = makeInput({ title: 'A'.repeat(151) });

      await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando preço for zero', async () => {
      const input = makeInput({ price: 0 });

      await expect(useCase.execute(input)).rejects.toThrow(
        new BadRequestException('O preço deve ser maior que zero.'),
      );
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando preço for negativo', async () => {
      const input = makeInput({ price: -1000 });

      await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException após 5 tentativas de slug com colisão', async () => {
      // Todos os slugs gerados colidem → não consegue criar
      mockRepo.slugExists.mockResolvedValue(true); // sempre existe

      await expect(useCase.execute(makeInput())).rejects.toThrow(
        BadRequestException,
      );
      // Tentou MAX_ATTEMPTS (5) vezes
      expect(mockRepo.slugExists).toHaveBeenCalledTimes(5);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─── Limite do plano do anunciante ──────────────────────────────────────────

  describe('execute() — limite de imóveis do plano', () => {
    it('deve permitir criar imóvel quando o anunciante ainda está abaixo do limite', async () => {
      // Arrange: plano BASIC (1 imóvel), nenhum ativo ainda
      mockRepo.getAdvertiserPlanLimits.mockResolvedValue({
        maxProperties: 1,
        maxPhotos: 5,
        maxVideos: 0,
      });
      mockRepo.countActiveByAdvertiser.mockResolvedValue(0);
      mockRepo.slugExists.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(makeListing());

      // Act & Assert: não lança ForbiddenException
      await expect(useCase.execute(makeInput())).resolves.toBeDefined();
      expect(mockRepo.countActiveByAdvertiser).toHaveBeenCalledWith(
        'user-uuid',
      );
    });

    it('deve lançar ForbiddenException quando anunciante BASIC já atingiu o limite (1 imóvel)', async () => {
      // Arrange: plano BASIC (1 imóvel), já tem 1 ativo
      mockRepo.getAdvertiserPlanLimits.mockResolvedValue({
        maxProperties: 1,
        maxPhotos: 5,
        maxVideos: 0,
      });
      mockRepo.countActiveByAdvertiser.mockResolvedValue(1);

      // Act & Assert
      await expect(useCase.execute(makeInput())).rejects.toThrow(
        ForbiddenException,
      );
      // Não deve tentar criar nem verificar slug
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.slugExists).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException com mensagem indicando o limite do plano', async () => {
      // Arrange
      mockRepo.getAdvertiserPlanLimits.mockResolvedValue({
        maxProperties: 1,
        maxPhotos: 5,
        maxVideos: 0,
      });
      mockRepo.countActiveByAdvertiser.mockResolvedValue(1);

      // Act & Assert
      await expect(useCase.execute(makeInput())).rejects.toThrow(
        new ForbiddenException(
          'Você atingiu o limite de 1 imóvel(is) do seu plano. ' +
            'Faça upgrade do plano para continuar anunciando.',
        ),
      );
    });

    it('não deve verificar limite quando o plano é PREMIUM (maxProperties = -1)', async () => {
      // Arrange: plano PREMIUM — maxProperties = -1 significa ilimitado
      mockRepo.getAdvertiserPlanLimits.mockResolvedValue({
        maxProperties: -1,
        maxPhotos: 10,
        maxVideos: 1,
      });
      mockRepo.slugExists.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(makeListing());

      // Act
      await useCase.execute(makeInput());

      // Assert: countActiveByAdvertiser NÃO deve ser chamado para planos ilimitados
      expect(mockRepo.countActiveByAdvertiser).not.toHaveBeenCalled();
    });
  });
});
