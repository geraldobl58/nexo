import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/libs/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/me (GET)', () => {
    it('deve retornar 401 quando token não for fornecido', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('deve retornar 401 quando token for inválido', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('deve retornar 401 quando Bearer não for especificado', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'invalid-token')
        .expect(401);
    });

    // Nota: Para testar com token válido, seria necessário:
    // 1. Configurar um Keycloak de teste
    // 2. Obter um token válido do Keycloak
    // 3. Usar esse token nas requisições
    // Estes testes são mais apropriados para testes de integração com Keycloak rodando
  });

  describe('Health Check', () => {
    it('/health (GET) deve retornar status ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });
});
