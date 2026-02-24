/**
 * TESTES: AdvertiserController
 *
 * O que testamos:
 *  1. O controller delega para o use-case correto
 *  2. A resposta é formatada via AdvertiserResponseDto
 *
 * O que NÃO testamos aqui:
 *  - Lógica de negócio (cobertura dos use-cases)
 *  - Validação de JWT/guard
 *  - Parsing dos DTOs (responsabilidade do ValidationPipe)
 */
import { Test, TestingModule } from '@nestjs/testing';

import { AdvertiserController } from './advertiser.controller';
import { CreateAdvertiserUseCase } from '../../application/use-cases/create-advertiser.use-case';
import { ApproveAdvertiserUseCase } from '../../application/use-cases/approve-advertiser.use-case';
import { SuspendAdvertiserUseCase } from '../../application/use-cases/suspend-advertiser.use-case';
import { GetAdvertiserUseCase } from '../../application/use-cases/get-advertiser.use-case';
import { GetAdvertisersUseCase } from '../../application/use-cases/get-advertisers.use-case';
import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';
import { AdvertiserType } from '../../domain/enums/advertiser-type.enum';
import { AdvertiserStatus } from '../../domain/enums/advertiser-status.enum';
import { CreateAdvertiserDto } from './dtos/create-advertiser.dto';
import { SuspendAdvertiserDto } from './dtos/suspend-advertiser.dto';

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

// ─── Mocks dos use-cases ──────────────────────────────────────────────────────

const mockCreate = { execute: jest.fn() };
const mockApprove = { execute: jest.fn() };
const mockSuspend = { execute: jest.fn() };
const mockGet = { execute: jest.fn() };
const mockGetAll = { execute: jest.fn() };

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('AdvertiserController', () => {
  let controller: AdvertiserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvertiserController],
      providers: [
        { provide: CreateAdvertiserUseCase, useValue: mockCreate },
        { provide: ApproveAdvertiserUseCase, useValue: mockApprove },
        { provide: SuspendAdvertiserUseCase, useValue: mockSuspend },
        { provide: GetAdvertiserUseCase, useValue: mockGet },
        { provide: GetAdvertisersUseCase, useValue: mockGetAll },
      ],
    }).compile();

    controller = module.get<AdvertiserController>(AdvertiserController);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // POST /advertisers
  // ---------------------------------------------------------------------------

  describe('create()', () => {
    it('deve criar um anunciante e retornar AdvertiserResponseDto', async () => {
      const advertiser = makeAdvertiser();
      mockCreate.execute.mockResolvedValue(advertiser);

      const dto: CreateAdvertiserDto = {
        type: AdvertiserType.BROKER,
        name: 'João Silva',
        email: 'joao@imob.com',
        phone: '11912345678',
      };

      const result = await controller.create(dto);

      expect(result.id).toBe('adv-uuid-1');
      expect(result.status).toBe(AdvertiserStatus.PENDING);
      expect(result.email).toBe('joao@imob.com');
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /advertisers/:id
  // ---------------------------------------------------------------------------

  describe('findById()', () => {
    it('deve retornar AdvertiserResponseDto para um ID existente', async () => {
      const advertiser = makeAdvertiser({ status: AdvertiserStatus.ACTIVE });
      mockGet.execute.mockResolvedValue(advertiser);

      const result = await controller.findById('adv-uuid-1');

      expect(result.id).toBe('adv-uuid-1');
      expect(result.status).toBe(AdvertiserStatus.ACTIVE);
      expect(mockGet.execute).toHaveBeenCalledWith('adv-uuid-1');
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /advertisers/:id/approve
  // ---------------------------------------------------------------------------

  describe('approve()', () => {
    it('deve aprovar e retornar AdvertiserResponseDto com status ACTIVE', async () => {
      const approved = makeAdvertiser({
        status: AdvertiserStatus.ACTIVE,
        isVerified: true,
        verifiedAt: new Date(),
      });
      mockApprove.execute.mockResolvedValue(approved);

      const result = await controller.approve('adv-uuid-1');

      expect(result.status).toBe(AdvertiserStatus.ACTIVE);
      expect(result.isVerified).toBe(true);
      expect(mockApprove.execute).toHaveBeenCalledWith('adv-uuid-1');
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /advertisers/:id/suspend
  // ---------------------------------------------------------------------------

  describe('suspend()', () => {
    it('deve suspender e retornar AdvertiserResponseDto com status SUSPENDED', async () => {
      const suspended = makeAdvertiser({
        status: AdvertiserStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendReason: 'Anúncios fraudulentos.',
      });
      mockSuspend.execute.mockResolvedValue(suspended);

      const dto: SuspendAdvertiserDto = { reason: 'Anúncios fraudulentos.' };
      const result = await controller.suspend('adv-uuid-1', dto);

      expect(result.status).toBe(AdvertiserStatus.SUSPENDED);
      expect(mockSuspend.execute).toHaveBeenCalledWith(
        'adv-uuid-1',
        'Anúncios fraudulentos.',
      );
    });
  });
});
