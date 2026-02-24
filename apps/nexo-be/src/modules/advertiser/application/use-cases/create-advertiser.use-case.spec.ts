/**
 * TESTES: CreateAdvertiserUseCase
 *
 * Objetivo: garantir que a lógica de registro de anunciantes
 * está correta ANTES de qualquer banco de dados ou HTTP entrar em cena.
 *
 * Estratégia: mock do repositório via ADVERTISER_REPOSITORY token.
 */
import { ConflictException } from '@nestjs/common';
import { CreateAdvertiserUseCase } from './create-advertiser.use-case';
import {
  ADVERTISER_REPOSITORY,
  IAdvertiserRepository,
} from '../../domain/repositories/advertiser.repository';
import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';
import { AdvertiserType } from '../../domain/enums/advertiser-type.enum';
import { AdvertiserStatus } from '../../domain/enums/advertiser-status.enum';
import { Test, TestingModule } from '@nestjs/testing';

// ─── Fixture ─────────────────────────────────────────────────────────────────

const makeAdvertiser = (
  override: Partial<AdvertiserEntity> = {},
): AdvertiserEntity => ({
  id: 'adv-uuid-1',
  keycloakId: null,
  type: AdvertiserType.BROKER,
  status: AdvertiserStatus.PENDING,
  name: 'João Silva',
  email: 'joao@imob.com',
  phone: '11912345678',
  whatsapp: null,
  avatar: null,
  coverImage: null,
  companyName: null,
  tradeName: null,
  document: null,
  creci: null,
  creciState: null,
  street: null,
  streetNumber: null,
  complement: null,
  district: null,
  city: null,
  state: null,
  zipcode: null,
  bio: null,
  website: null,
  facebook: null,
  instagram: null,
  linkedin: null,
  isVerified: false,
  verifiedAt: null,
  suspendedAt: null,
  suspendReason: null,
  deletedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...override,
});

// ─── Mock ─────────────────────────────────────────────────────────────────────

const mockRepo: jest.Mocked<IAdvertiserRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  findMany: jest.fn(),
  emailExists: jest.fn(),
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('CreateAdvertiserUseCase', () => {
  let useCase: CreateAdvertiserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAdvertiserUseCase,
        { provide: ADVERTISER_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(CreateAdvertiserUseCase);
    jest.clearAllMocks();
  });

  it('deve criar um anunciante quando o e-mail não existe', async () => {
    const advertiser = makeAdvertiser();
    mockRepo.emailExists.mockResolvedValue(false);
    mockRepo.create.mockResolvedValue(advertiser);

    const result = await useCase.execute({
      type: AdvertiserType.BROKER,
      name: 'João Silva',
      email: 'joao@imob.com',
      phone: '11912345678',
    });

    expect(result.status).toBe(AdvertiserStatus.PENDING);
    expect(mockRepo.emailExists).toHaveBeenCalledWith('joao@imob.com');
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar ConflictException quando o e-mail já existe', async () => {
    mockRepo.emailExists.mockResolvedValue(true);

    await expect(
      useCase.execute({
        type: AdvertiserType.BROKER,
        name: 'João Silva',
        email: 'joao@imob.com',
        phone: '11912345678',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('a mensagem da ConflictException deve conter o e-mail informado', async () => {
    mockRepo.emailExists.mockResolvedValue(true);

    await expect(
      useCase.execute({
        type: AdvertiserType.BROKER,
        name: 'Maria',
        email: 'maria@imob.com',
        phone: '11999999999',
      }),
    ).rejects.toThrow('maria@imob.com');
  });
});
