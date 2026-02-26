import { Module } from '@nestjs/common';

import { PrismaModule } from '@/libs/prisma/prisma.module';
import { ApproveAdvertiserUseCase } from './application/use-cases/approve-advertiser.use-case';
import { CreateAdvertiserUseCase } from './application/use-cases/create-advertiser.use-case';
import { GetAdvertisersUseCase } from './application/use-cases/get-advertisers.use-case';
import { GetAdvertiserUseCase } from './application/use-cases/get-advertiser.use-case';
import { GetMyAdvertiserUseCase } from './application/use-cases/get-my-advertiser.use-case';
import { SuspendAdvertiserUseCase } from './application/use-cases/suspend-advertiser.use-case';
import { ADVERTISER_REPOSITORY } from './domain/repositories/advertiser.repository';
import { AdvertiserController } from './infrastructure/http/advertiser.controller';
import { PrismaAdvertiserRepository } from './infrastructure/prisma/prisma-advertiser.repository';

/**
 * MÓDULO DE ANUNCIANTES
 *
 * Registra todos os componentes do módulo advertiser:
 * - Controller HTTP
 * - Casos de uso (application layer)
 * - Repositório Prisma (infrastructure layer)
 *
 * O token ADVERTISER_REPOSITORY injeta a implementação Prisma nos use-cases,
 * permitindo trocar por um mock nos testes sem alterar o código de negócio.
 */
@Module({
  imports: [PrismaModule],
  controllers: [AdvertiserController],
  providers: [
    // Implementação concreta do repositório (injetada via token)
    {
      provide: ADVERTISER_REPOSITORY,
      useClass: PrismaAdvertiserRepository,
    },

    // Casos de uso
    CreateAdvertiserUseCase,
    ApproveAdvertiserUseCase,
    SuspendAdvertiserUseCase,
    GetAdvertiserUseCase,
    GetMyAdvertiserUseCase,
    GetAdvertisersUseCase,
  ],
})
export class AdvertiserModule {}
