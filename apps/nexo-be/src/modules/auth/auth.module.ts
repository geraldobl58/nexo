import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MeUseCase } from '@/application/auth/me.usecase';
import { KeycloakStrategy } from '@/infrastructure/auth/keycloak.strategy';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/prisma-user.repository';
import { AuthController } from '@/presentation/auth/auth.controller';
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
