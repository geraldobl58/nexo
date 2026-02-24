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
import { BadRequestException } from '@nestjs/common';
import { CreateListingUseCase } from './create-listing.use-case';
import { ListingRepository } from '../../domain/repositories/listing.repository';
import { ListingEntity } from '../../domain/entities/listing.entity';
import { ListingStatus } from '../../domain/enums/listing-status.enum';

// ─── Fixture helpers ─────────────────────────────────────────────────────────

/**
 * Cria uma ListingEntity mínima para usar como retorno dos mocks.
 * `override` permite sobrescrever campos individualmente em cada teste.
 */
const makeListing = (override: Partial<ListingEntity> = {}): ListingEntity => ({
  id: 'uuid-1',
  advertiserId: 'adv-uuid',
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
  advertiserId: 'adv-uuid',
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
      update: jest.fn(),
      findMany: jest.fn(),
      slugExists: jest.fn(),
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
});
