import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { IDENTITY_USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { PrismaIdentityUserRepository } from '../../infrastructure/prisma/prisma-identity-user.repository';
import { SyncUserUseCase } from '../../application/use-cases/sync-user.use-case';
import { SyncUserInterceptor } from '../../infrastructure/http/sync-user.interceptor';

@Module({
  providers: [
    // Repository
    {
      provide: IDENTITY_USER_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaIdentityUserRepository(prisma),
      inject: [PrismaService],
    },
    // Use Case
    SyncUserUseCase,
    // Global Interceptor — runs after any Passport guard, skips public routes
    {
      provide: APP_INTERCEPTOR,
      useClass: SyncUserInterceptor,
    },
  ],
})
export class IdentityModule {}
