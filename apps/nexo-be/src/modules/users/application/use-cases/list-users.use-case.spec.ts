import { Test, TestingModule } from '@nestjs/testing';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { ListUsersUseCase } from './list-users.use-case';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeUser = (overrides = {}) => ({
  id: 'uuid-01',
  keycloakId: 'kc-01',
  email: 'user@nexo.com.br',
  name: 'User',
  role: 'SUPPORT' as const,
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

const paginatedResult = {
  data: [makeUser()],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;

  const mockRepo = {
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersUseCase,
        { provide: USER_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(useCase).toBeDefined();
  });

  it('deve retornar resultado paginado', async () => {
    mockRepo.findMany.mockResolvedValue(paginatedResult);

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result).toEqual(paginatedResult);
    expect(mockRepo.findMany).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('deve passar os filtros corretamente ao repositório', async () => {
    mockRepo.findMany.mockResolvedValue(paginatedResult);

    await useCase.execute({ role: 'ADMIN', isActive: true, search: 'nexo' });

    expect(mockRepo.findMany).toHaveBeenCalledWith({
      role: 'ADMIN',
      isActive: true,
      search: 'nexo',
    });
  });

  it('deve retornar lista vazia quando não há usuários', async () => {
    mockRepo.findMany.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const result = await useCase.execute({});

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('deve propagar erros inesperados do repositório', async () => {
    mockRepo.findMany.mockRejectedValue(new Error('Falha de banco'));

    await expect(useCase.execute({})).rejects.toThrow('Falha de banco');
  });
});
