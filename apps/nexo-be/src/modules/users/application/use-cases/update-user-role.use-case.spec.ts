import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { UpdateUserRoleUseCase } from './update-user-role.use-case';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeUser = (overrides = {}) => ({
  id: 'uuid-01',
  keycloakId: 'kc-01',
  email: 'admin@nexo.com.br',
  name: 'Admin',
  role: 'ADMIN' as const,
  phone: null,
  avatar: null,
  timezone: null,
  language: null,
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('UpdateUserRoleUseCase', () => {
  let useCase: UpdateUserRoleUseCase;

  const mockRepo = {
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserRoleUseCase,
        { provide: USER_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateUserRoleUseCase>(UpdateUserRoleUseCase);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(useCase).toBeDefined();
  });

  it('deve lançar NotFoundException quando o usuário não existir', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('uuid-inexistente', 'MODERATOR'),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar a role com sucesso', async () => {
    const admin = makeUser({ role: 'ADMIN' });
    const updated = makeUser({ role: 'MODERATOR' });

    mockRepo.findById.mockResolvedValue(admin);
    // Retorna 2 admins → seguro rebaixar
    mockRepo.findMany.mockResolvedValue({
      data: [admin, makeUser({ id: 'uuid-02' })],
      total: 2,
    });
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('uuid-01', 'MODERATOR');

    expect(result.role).toBe('MODERATOR');
    expect(mockRepo.update).toHaveBeenCalledWith('uuid-01', {
      role: 'MODERATOR',
    });
  });

  it('deve proibir rebaixar o único admin ativo', async () => {
    const admin = makeUser({ role: 'ADMIN' });

    mockRepo.findById.mockResolvedValue(admin);
    // Apenas 1 admin → proibido rebaixar
    mockRepo.findMany.mockResolvedValue({ data: [admin], total: 1 });

    await expect(useCase.execute('uuid-01', 'SUPPORT')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('deve permitir trocar role de MODERATOR para SUPPORT sem verificar contagem de admins', async () => {
    const mod = makeUser({ role: 'MODERATOR' });
    const updated = makeUser({ role: 'SUPPORT' });

    mockRepo.findById.mockResolvedValue(mod);
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('uuid-01', 'SUPPORT');

    expect(result.role).toBe('SUPPORT');
    // Não precisa consultar admins — não era ADMIN
    expect(mockRepo.findMany).not.toHaveBeenCalled();
  });

  it('deve permitir manter ADMIN como ADMIN', async () => {
    const admin = makeUser({ role: 'ADMIN' });

    mockRepo.findById.mockResolvedValue(admin);
    mockRepo.update.mockResolvedValue(admin);

    const result = await useCase.execute('uuid-01', 'ADMIN');

    expect(result.role).toBe('ADMIN');
    // Não precisa verificar contagem — mantém ADMIN
    expect(mockRepo.findMany).not.toHaveBeenCalled();
  });
});
