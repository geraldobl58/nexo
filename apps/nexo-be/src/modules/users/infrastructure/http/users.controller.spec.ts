import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { ListUsersQueryDto, UpdateUserRoleDto } from './dtos/users.dto';
import { UsersController } from './users.controller';

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

describe('UsersController', () => {
  let controller: UsersController;

  const mockGetUser = { execute: jest.fn() };
  const mockListUsers = { execute: jest.fn() };
  const mockUpdateRole = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: GetUserUseCase, useValue: mockGetUser },
        { provide: ListUsersUseCase, useValue: mockListUsers },
        { provide: UpdateUserRoleUseCase, useValue: mockUpdateRole },
      ],
    })
      .overrideGuard(require('@nestjs/passport').AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  // -------------------------------------------------------------------
  // GET /users
  // -------------------------------------------------------------------

  describe('findAll()', () => {
    it('deve retornar lista paginada de usuários', async () => {
      mockListUsers.execute.mockResolvedValue(paginatedResult);

      const query: ListUsersQueryDto = { page: 1, limit: 20 };
      const result = await controller.findAll(query);

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('uuid-01');
    });
  });

  // -------------------------------------------------------------------
  // GET /users/:id
  // -------------------------------------------------------------------

  describe('findById()', () => {
    it('deve retornar o usuário pelo ID', async () => {
      mockGetUser.execute.mockResolvedValue(makeUser());

      const result = await controller.findById('uuid-01');

      expect(result.id).toBe('uuid-01');
      expect(mockGetUser.execute).toHaveBeenCalledWith('uuid-01');
    });

    it('deve propagar NotFoundException', async () => {
      mockGetUser.execute.mockRejectedValue(
        new NotFoundException('Usuário não encontrado.'),
      );

      await expect(controller.findById('uuid-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------------------------------------------------------
  // PATCH /users/:id/role
  // -------------------------------------------------------------------

  describe('updateRole()', () => {
    it('deve atualizar a role com sucesso', async () => {
      mockUpdateRole.execute.mockResolvedValue(makeUser({ role: 'MODERATOR' }));

      const dto: UpdateUserRoleDto = { role: 'MODERATOR' };
      const result = await controller.updateRole('uuid-01', dto);

      expect(result.role).toBe('MODERATOR');
      expect(mockUpdateRole.execute).toHaveBeenCalledWith(
        'uuid-01',
        'MODERATOR',
      );
    });

    it('deve propagar BadRequestException do último admin', async () => {
      mockUpdateRole.execute.mockRejectedValue(
        new BadRequestException(
          'Não é possível remover o único administrador do sistema.',
        ),
      );

      const dto: UpdateUserRoleDto = { role: 'SUPPORT' };
      await expect(controller.updateRole('uuid-01', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
