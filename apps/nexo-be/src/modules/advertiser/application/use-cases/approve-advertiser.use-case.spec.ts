/**
 * TESTES: ApproveAdvertiserUseCase
 *
 * Garante que a transição PENDING → ACTIVE está correta.
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ApproveAdvertiserUseCase } from './approve-advertiser.use-case';
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
  findByKeycloakId: jest.fn(),
  update: jest.fn(),
  findMany: jest.fn(),
  emailExists: jest.fn(),
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('ApproveAdvertiserUseCase', () => {
  let useCase: ApproveAdvertiserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveAdvertiserUseCase,
        { provide: ADVERTISER_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(ApproveAdvertiserUseCase);
    jest.clearAllMocks();
  });

  it('deve aprovar um anunciante PENDING (PENDING → ACTIVE)', async () => {
    const pending = makeAdvertiser({ status: AdvertiserStatus.PENDING });
    const active = makeAdvertiser({
      status: AdvertiserStatus.ACTIVE,
      isVerified: true,
      verifiedAt: new Date(),
    });

    mockRepo.findById.mockResolvedValue(pending);
    mockRepo.update.mockResolvedValue(active);

    const result = await useCase.execute('adv-uuid-1');

    expect(result.status).toBe(AdvertiserStatus.ACTIVE);
    expect(result.isVerified).toBe(true);
    expect(mockRepo.update).toHaveBeenCalledWith(
      'adv-uuid-1',
      expect.objectContaining({
        status: AdvertiserStatus.ACTIVE,
        isVerified: true,
      }),
    );
  });

  it('deve lançar NotFoundException quando o anunciante não existe', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se o status for ACTIVE', async () => {
    mockRepo.findById.mockResolvedValue(
      makeAdvertiser({ status: AdvertiserStatus.ACTIVE }),
    );

    await expect(useCase.execute('adv-uuid-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve lançar BadRequestException se o status for SUSPENDED', async () => {
    mockRepo.findById.mockResolvedValue(
      makeAdvertiser({ status: AdvertiserStatus.SUSPENDED }),
    );

    await expect(useCase.execute('adv-uuid-1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
