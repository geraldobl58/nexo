import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KeycloakStrategy } from './keycloak.strategy';
import { AuthUser } from '@/domain/auth/auth-user';

describe('KeycloakStrategy', () => {
  let strategy: KeycloakStrategy;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      getOrThrow: jest.fn(),
    } as any;

    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        KEYCLOAK_URL: 'http://localhost:8080',
        KEYCLOAK_REALM: 'nexo',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<KeycloakStrategy>(KeycloakStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('deve extrair AuthUser do payload JWT válido', () => {
      // Arrange
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
        realm_access: {
          roles: ['user', 'admin'],
        },
      };

      // Act
      const result: AuthUser = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
        roles: ['user', 'admin'],
      });
    });

    it('deve lidar com payload sem email', () => {
      // Arrange
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        name: 'João Silva',
        realm_access: {
          roles: ['user'],
        },
      };

      // Act
      const result: AuthUser = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: undefined,
        name: 'João Silva',
        roles: ['user'],
      });
    });

    it('deve lidar com payload sem name', () => {
      // Arrange
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        realm_access: {
          roles: ['user'],
        },
      };

      // Act
      const result: AuthUser = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: undefined,
        roles: ['user'],
      });
    });

    it('deve retornar array vazio de roles quando realm_access não existir', () => {
      // Arrange
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
      };

      // Act
      const result: AuthUser = strategy.validate(payload);

      // Assert
      expect(result.roles).toEqual([]);
    });

    it('deve retornar array vazio de roles quando roles não existir em realm_access', () => {
      // Arrange
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
        realm_access: {},
      };

      // Act
      const result: AuthUser = strategy.validate(payload);

      // Assert
      expect(result.roles).toEqual([]);
    });

    it('deve extrair múltiplas roles corretamente', () => {
      // Arrange
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@example.com',
        name: 'Admin User',
        realm_access: {
          roles: ['user', 'admin', 'superuser', 'moderator'],
        },
      };

      // Act
      const result: AuthUser = strategy.validate(payload);

      // Assert
      expect(result.roles).toEqual(['user', 'admin', 'superuser', 'moderator']);
      expect(result.roles).toHaveLength(4);
    });

    it('deve lidar com payload mínimo (apenas sub)', () => {
      // Arrange
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
      };

      // Act
      const result: AuthUser = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        keycloakId: '123e4567-e89b-12d3-a456-426614174000',
        email: undefined,
        name: undefined,
        roles: [],
      });
    });

    it('deve lidar com realm_access contendo outros campos além de roles', () => {
      // Arrange
      const payload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'joao.silva@example.com',
        name: 'João Silva',
        realm_access: {
          roles: ['user'],
          other_field: 'test',
        },
      };

      // Act
      const result: AuthUser = strategy.validate(payload);

      // Assert
      expect(result.roles).toEqual(['user']);
    });
  });

  describe('constructor', () => {
    it('deve configurar strategy com variáveis de ambiente corretas', () => {
      // Assert
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('KEYCLOAK_URL');
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(
        'KEYCLOAK_REALM',
      );
    });

    it('deve estar definido', () => {
      expect(strategy).toBeDefined();
    });

    it('deve ter método validate', () => {
      expect(strategy.validate).toBeDefined();
      expect(typeof strategy.validate).toBe('function');
    });
  });
});
