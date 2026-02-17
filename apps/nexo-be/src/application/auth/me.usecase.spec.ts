import { MeUseCase } from './me.usecase';
import { UserRepository, UserDTO } from '@/domain/user/user.repository';
import { AuthUser } from '@/domain/auth/auth-user';

describe('MeUseCase', () => {
  let useCase: MeUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      upsertFromAuth: jest.fn(),
    };
    useCase = new MeUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve fazer upsert do usuário com dados do Keycloak', async () => {
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

      mockUserRepository.upsertFromAuth.mockResolvedValue(expectedUserDTO);

      // Act
      const result = await useCase.execute(authUser);

      // Assert
      expect(mockUserRepository.upsertFromAuth).toHaveBeenCalledWith({
        keycloakId: authUser.keycloakId,
        email: authUser.email,
        name: authUser.name,
      });
      expect(mockUserRepository.upsertFromAuth).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUserDTO);
    });

    it('deve usar email padrão quando email não for fornecido', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'João Silva',
        roles: ['user'],
      };

      const expectedEmail = `user-${authUser.keycloakId}@local`;
      const expectedUserDTO: UserDTO = {
        id: '1',
        keycloakId: authUser.keycloakId,
        email: expectedEmail,
        name: authUser.name!,
        role: 'SUPPORT',
        isActive: true,
      };

      mockUserRepository.upsertFromAuth.mockResolvedValue(expectedUserDTO);

      // Act
      await useCase.execute(authUser);

      // Assert
      expect(mockUserRepository.upsertFromAuth).toHaveBeenCalledWith({
        keycloakId: authUser.keycloakId,
        email: expectedEmail,
        name: authUser.name!,
      });
    });

    it('deve usar nome padrão quando name não for fornecido', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        roles: ['user'],
      };

      const expectedName = 'User joao.silva';
      const expectedUserDTO: UserDTO = {
        id: '1',
        keycloakId: authUser.keycloakId,
        email: authUser.email!,
        name: expectedName,
        role: 'SUPPORT',
        isActive: true,
      };

      mockUserRepository.upsertFromAuth.mockResolvedValue(expectedUserDTO);

      // Act
      await useCase.execute(authUser);

      // Assert
      expect(mockUserRepository.upsertFromAuth).toHaveBeenCalledWith({
        keycloakId: authUser.keycloakId,
        email: authUser.email!,
        name: expectedName,
      });
    });

    it('deve trimar espaços em branco do email e name', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: '  joao.silva@example.com  ',
        name: '  João Silva  ',
        roles: ['user'],
      };

      const expectedUserDTO: UserDTO = {
        id: '1',
        keycloakId: authUser.keycloakId,
        email: 'joao.silva@example.com',
        name: 'João Silva',
        role: 'SUPPORT',
        isActive: true,
      };

      mockUserRepository.upsertFromAuth.mockResolvedValue(expectedUserDTO);

      // Act
      await useCase.execute(authUser);

      // Assert
      expect(mockUserRepository.upsertFromAuth).toHaveBeenCalledWith({
        keycloakId: authUser.keycloakId,
        email: 'joao.silva@example.com',
        name: 'João Silva',
      });
    });

    it('deve usar valores padrão quando email e name não forem fornecidos', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        roles: ['user'],
      };

      const expectedEmail = `user-${authUser.keycloakId}@local`;
      const expectedName = `User user-${authUser.keycloakId}`;
      const expectedUserDTO: UserDTO = {
        id: '1',
        keycloakId: authUser.keycloakId,
        email: expectedEmail,
        name: expectedName,
        role: 'SUPPORT',
        isActive: true,
      };

      mockUserRepository.upsertFromAuth.mockResolvedValue(expectedUserDTO);

      // Act
      await useCase.execute(authUser);

      // Assert
      expect(mockUserRepository.upsertFromAuth).toHaveBeenCalledWith({
        keycloakId: authUser.keycloakId,
        email: expectedEmail,
        name: expectedName,
      });
    });

    it('deve propagar erro quando repository falhar', async () => {
      // Arrange
      const authUser: AuthUser = {
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
        roles: ['user'],
      };

      const error = new Error('Database connection failed');
      mockUserRepository.upsertFromAuth.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(authUser)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
