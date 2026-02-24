/**
 * TESTES: SuspendAdvertiserUseCase
 *
 * Garante que a transição ACTIVE → SUSPENDED está correta.
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SuspendAdvertiserUseCase } from './suspend-advertiser.use-case';
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
  update: jest.fn(),
  findMany: jest.fn(),
  emailExists: jest.fn(),
};

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('SuspendAdvertiserUseCase', () => {
  let useCase: SuspendAdvertiserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuspendAdvertiserUseCase,
        { provide: ADVERTISER_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(SuspendAdvertiserUseCase);
    jest.clearAllMocks();
  });

  it('deve suspender um anunciante ACTIVE com motivo (ACTIVE → SUSPENDED)', async () => {
    const active = makeAdvertiser({ status: AdvertiserStatus.ACTIVE });
    const suspended = makeAdvertiser({
      status: AdvertiserStatus.SUSPENDED,
      suspendedAt: new Date(),
      suspendReason: 'Anúncios fraudulentos.',
    });

    mockRepo.findById.mockResolvedValue(active);
    mockRepo.update.mockResolvedValue(suspended);

    const result = await useCase.execute(
      'adv-uuid-1',
      'Anúncios fraudulentos.',
    );

    expect(result.status).toBe(AdvertiserStatus.SUSPENDED);
    expect(result.suspendReason).toBe('Anúncios fraudulentos.');
    expect(mockRepo.update).toHaveBeenCalledWith(
      'adv-uuid-1',
      expect.objectContaining({
        status: AdvertiserStatus.SUSPENDED,
        suspendReason: 'Anúncios fraudulentos.',
      }),
    );
  });

  it('deve lançar NotFoundException quando o anunciante não existe', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente', 'motivo')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException quando o status for PENDING', async () => {
    mockRepo.findById.mockResolvedValue(
      makeAdvertiser({ status: AdvertiserStatus.PENDING }),
    );

    await expect(useCase.execute('adv-uuid-1', 'motivo')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve lançar BadRequestException quando o status já for SUSPENDED', async () => {
    mockRepo.findById.mockResolvedValue(
      makeAdvertiser({ status: AdvertiserStatus.SUSPENDED }),
    );

    await expect(useCase.execute('adv-uuid-1', 'motivo')).rejects.toThrow(
      BadRequestException,
    );
  });
});
