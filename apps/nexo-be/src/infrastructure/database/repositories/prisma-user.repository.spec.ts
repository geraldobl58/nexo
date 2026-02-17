import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { UserDTO } from '@/domain/user/user.repository';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let mockPrismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    mockPrismaService = {
      user: {
        upsert: jest.fn(),
      },
    } as any;

    repository = new PrismaUserRepository(mockPrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertFromAuth', () => {
    it('deve criar novo usuário quando não existir', async () => {
      // Arrange
      const data = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
      };

      const mockUser = {
        id: '1',
        keycloakId: data.keycloakId,
        email: data.email,
        name: data.name,
        role: 'SUPPORT' as const,
        isActive: true,
      };

      (mockPrismaService.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await repository.upsertFromAuth(data);

      // Assert
      expect(mockPrismaService.user.upsert).toHaveBeenCalledWith({
        where: { keycloakId: data.keycloakId },
        update: {
          email: data.email,
          name: data.name,
          lastLoginAt: expect.any(Date),
        },
        create: {
          keycloakId: data.keycloakId,
          email: data.email,
          name: data.name,
          isActive: true,
        },
        select: {
          id: true,
          keycloakId: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve atualizar usuário existente', async () => {
      // Arrange
      const data = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva.novo@example.com',
        name: 'João Silva Atualizado',
      };

      const mockUpdatedUser = {
        id: '1',
        keycloakId: data.keycloakId,
        email: data.email,
        name: data.name,
        role: 'SUPPORT',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      (mockPrismaService.user.upsert as jest.Mock).mockResolvedValue(
        mockUpdatedUser,
      );

      // Act
      const result = await repository.upsertFromAuth(data);

      // Assert
      expect(mockPrismaService.user.upsert).toHaveBeenCalledTimes(1);
      expect(result.email).toBe(data.email);
      expect(result.name).toBe(data.name);
    });

    it('deve atualizar lastLoginAt em cada login', async () => {
      // Arrange
      const data = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
      };

      const mockUser = {
        id: '1',
        keycloakId: data.keycloakId,
        email: data.email,
        name: data.name,
        role: 'SUPPORT',
        isActive: true,
      };

      (mockPrismaService.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await repository.upsertFromAuth(data);

      // Assert
      const callArgs = (mockPrismaService.user.upsert as jest.Mock).mock
        .calls[0][0];
      expect(callArgs.update.lastLoginAt).toBeInstanceOf(Date);
      expect(callArgs.update.lastLoginAt.getTime()).toBeCloseTo(Date.now(), -2); // Within ~100ms
    });

    it('deve usar select corretamente para retornar apenas campos necessários', async () => {
      // Arrange
      const data = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
      };

      const mockUser = {
        id: '1',
        keycloakId: data.keycloakId,
        email: data.email,
        name: data.name,
        role: 'SUPPORT',
        isActive: true,
      };

      (mockPrismaService.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await repository.upsertFromAuth(data);

      // Assert
      const callArgs = (mockPrismaService.user.upsert as jest.Mock).mock
        .calls[0][0];
      expect(callArgs.select).toEqual({
        id: true,
        keycloakId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      });
    });

    it('deve propagar erro quando Prisma falhar', async () => {
      // Arrange
      const data = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
      };

      const error = new Error('Database connection failed');
      (mockPrismaService.user.upsert as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.upsertFromAuth(data)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('deve retornar UserDTO com todos os campos necessários', async () => {
      // Arrange
      const data = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
      };

      const mockUser = {
        id: '1',
        keycloakId: data.keycloakId,
        email: data.email,
        name: data.name,
        role: 'ADMIN',
        isActive: false,
      };

      (mockPrismaService.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result: UserDTO = await repository.upsertFromAuth(data);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('keycloakId');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('isActive');
      expect(result.role).toBe('ADMIN');
      expect(result.isActive).toBe(false);
    });
  });
});
