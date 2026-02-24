import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MeUseCase } from '@/modules/auth/application/use-cases/me.use-case';
import { KeycloakStrategy } from '@/modules/auth/infrastructure/auth/keycloak.strategy';
import { PrismaUserRepository } from '@/modules/auth/infrastructure/prisma/prisma-user.repository';
import { AuthController } from '@/modules/auth/infrastructure/http/auth.controller';
import { PrismaService } from '@/libs/prisma/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'keycloak' })],
  controllers: [AuthController],
  providers: [
    KeycloakStrategy,
    {
      provide: 'UserRepository',
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: MeUseCase,
      useFactory: (users: PrismaUserRepository) => new MeUseCase(users),
      inject: ['UserRepository'],
    },
  ],
})
export class AuthModule {}
