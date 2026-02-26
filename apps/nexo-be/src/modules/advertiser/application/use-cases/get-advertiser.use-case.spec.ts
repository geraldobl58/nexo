/**
 * TESTES: GetAdvertiserUseCase
 *
 * Garante que a busca por ID retorna o anunciante correto
 * e lança 404 quando não encontrado.
 */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GetAdvertiserUseCase } from './get-advertiser.use-case';
import {
  ADVERTISER_REPOSITORY,
  IAdvertiserRepository,
} from '../../domain/repositories/advertiser.repository';
import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';
import { AdvertiserType } from '../../domain/enums/advertiser-type.enum';
import { AdvertiserStatus } from '../../domain/enums/advertiser-status.enum';

// ─── Fixture ─────────────────────────────────────────────────────────────────

const makeAdvertiser = (
  override: Partial<AdvertiserEntity> = {},
): AdvertiserEntity => ({
  id: 'adv-uuid-1',
  keycloakId: null,
  type: AdvertiserType.BROKER,
  status: AdvertiserStatus.ACTIVE,
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
  isVerified: true,
  verifiedAt: new Date('2024-01-10'),
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
  findByKeycloakId: jest.fn(),
  update: jest.fn(),
  findMany: jest.fn(),
  emailExists: jest.fn(),
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('GetAdvertiserUseCase', () => {
  let useCase: GetAdvertiserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdvertiserUseCase,
        { provide: ADVERTISER_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(GetAdvertiserUseCase);
    jest.clearAllMocks();
  });

  it('deve retornar o anunciante quando o ID existir', async () => {
    const advertiser = makeAdvertiser();
    mockRepo.findById.mockResolvedValue(advertiser);

    const result = await useCase.execute('adv-uuid-1');

    expect(result).toEqual(advertiser);
    expect(mockRepo.findById).toHaveBeenCalledWith('adv-uuid-1');
  });

  it('deve lançar NotFoundException quando o ID não existir', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('a mensagem da NotFoundException deve conter o ID informado', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-que-nao-existe')).rejects.toThrow(
      'id-que-nao-existe',
    );
  });
});
