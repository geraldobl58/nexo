import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { GetUserUseCase } from './get-user.use-case';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = {
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
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        { provide: USER_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(useCase).toBeDefined();
  });

  it('deve retornar o usuário quando encontrado', async () => {
    mockRepo.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute('uuid-01');

    expect(result).toEqual(mockUser);
    expect(mockRepo.findById).toHaveBeenCalledWith('uuid-01');
  });

  it('deve lançar NotFoundException quando o usuário não existir', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve propagar erros inesperados do repositório', async () => {
    mockRepo.findById.mockRejectedValue(new Error('Falha de banco'));

    await expect(useCase.execute('uuid-01')).rejects.toThrow('Falha de banco');
  });
});
