/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { MeUseCase } from '@/application/auth/me.usecase';
import { AuthUser } from '@/domain/auth/auth-user';
import { UserDTO } from '@/domain/user/user.repository';

describe('AuthController', () => {
  let controller: AuthController;
  let mockMeUseCase: jest.Mocked<MeUseCase>;

  beforeEach(async () => {
    mockMeUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: MeUseCase,
          useValue: mockMeUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('me', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
        roles: ['user'],
      };

      const expectedUserDTO: UserDTO = {
        id: '1',
        keycloakId: authUser.keycloakId,
        email: authUser.email!,
        name: authUser.name!,
        role: 'SUPPORT',
        isActive: true,
      };

      mockMeUseCase.execute.mockResolvedValue(expectedUserDTO);

      // Act
      const result = await controller.me(authUser);

      // Assert
      expect(mockMeUseCase.execute).toHaveBeenCalledWith(authUser);
      expect(mockMeUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUserDTO);
    });

    it('deve propagar erro quando useCase falhar', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
        roles: ['user'],
      };

      const error = new Error('Database connection failed');
      mockMeUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.me(authUser)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockMeUseCase.execute).toHaveBeenCalledWith(authUser);
    });

    it('deve lidar com usuário sem email', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'João Silva',
        roles: ['user'],
      };

      const expectedUserDTO: UserDTO = {
        id: '1',
        keycloakId: authUser.keycloakId,
        email: `user-${authUser.keycloakId}@local`,
        name: authUser.name!,
        role: 'SUPPORT',
        isActive: true,
      };

      mockMeUseCase.execute.mockResolvedValue(expectedUserDTO);

      // Act
      const result = await controller.me(authUser);

      // Assert
      expect(result).toEqual(expectedUserDTO);
    });

    it('deve lidar com usuário sem name', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        roles: ['user'],
      };

      const expectedUserDTO: UserDTO = {
        id: '1',
        keycloakId: authUser.keycloakId,
        email: authUser.email!,
        name: 'User joao.silva',
        role: 'SUPPORT',
        isActive: true,
      };

      mockMeUseCase.execute.mockResolvedValue(expectedUserDTO);

      // Act
      const result = await controller.me(authUser);

      // Assert
      expect(result).toEqual(expectedUserDTO);
    });

    it('deve lidar com diferentes roles do usuário', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: ['admin', 'user'],
      };

      const expectedUserDTO: UserDTO = {
        id: '1',
        keycloakId: authUser.keycloakId,
        email: authUser.email!,
        name: authUser.name!,
        role: 'ADMIN',
        isActive: true,
      };

      mockMeUseCase.execute.mockResolvedValue(expectedUserDTO);

      // Act
      const result = await controller.me(authUser);

      // Accept
      expect(result).toEqual(expectedUserDTO);
      expect(mockMeUseCase.execute).toHaveBeenCalledWith(authUser);
    });
  });

  describe('controller definition', () => {
    it('deve estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('deve ter método me', () => {
      expect(controller.me).toBeDefined();
      expect(typeof controller.me).toBe('function');
    });
  });
});
