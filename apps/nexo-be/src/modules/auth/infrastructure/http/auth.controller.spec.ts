import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserEntity } from '@/modules/identity/domain/entities/user.entity';

const makeUser = (override: Partial<UserEntity> = {}): UserEntity => ({
  id: '1',
  keycloakId: '123e4567-e89b-12d3-a456-426614174000',
  email: 'joao.silva@example.com',
  name: 'João Silva',
  role: 'SUPPORT',
  phone: null,
  avatar: null,
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...override,
});

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('me', () => {
    it('deve retornar o usuário já sincronizado (DB UserEntity)', () => {
      const user = makeUser();
      const result = controller.me(user);
      expect(result).toEqual(user);
    });

    it('deve retornar usuário ADMIN corretamente', () => {
      const user = makeUser({ role: 'ADMIN' });
      const result = controller.me(user);
      expect(result.role).toBe('ADMIN');
    });

    it('deve retornar usuário com id do banco', () => {
      const user = makeUser({ id: 'uuid-from-db' });
      expect(controller.me(user).id).toBe('uuid-from-db');
    });
  });

  describe('controller definition', () => {
    it('deve estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('deve ter método me', () => {
      expect(typeof controller.me).toBe('function');
    });
  });
});
