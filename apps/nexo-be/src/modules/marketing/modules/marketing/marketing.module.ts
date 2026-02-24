import { Module } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';

// Domain
import { LISTING_REPOSITORY } from '../../domain/repositories/listing.repository';

// Application — Use Cases
import { CreateListingUseCase } from '../../application/use-cases/create-listing.use-case';
import { PublishListingUseCase } from '../../application/use-cases/publish-listing.use-case';
import { UnpublishListingUseCase } from '../../application/use-cases/unpublish-listing.use-case';
import { GetListingsUseCase } from '../../application/use-cases/get-listings.use-case';

// Infrastructure — Repositório
import { PrismaListingRepository } from '../../infrastructure/prisma/prisma-listing.repository';

// Infrastructure — HTTP
import { MarketingController } from '../../infrastructure/http/marketing.controller';

/**
 * MÓDULO DE MARKETING
 *
 * O que é um Module no NestJS?
 * É o "organizador" de uma fatia vertical do sistema.
 * Ele declara:
 *  - controllers: quem recebe as requisições HTTP
 *  - providers: quem fornece serviços (use-cases, repositórios, etc.)
 *
 * Analogia: pense num module como um "departamento" da empresa.
 * O MarketingModule cuida de tudo relacionado a anúncios de imóveis.
 *
 * Fluxo de injeção de dependência neste módulo:
 *
 *   MarketingController
 *     → CreateListingUseCase
 *         → LISTING_REPOSITORY (token)
 *             → PrismaListingRepository (implementação real)
 *                 → PrismaService (conexão com o banco)
 */
@Module({
  controllers: [
    /*
     * NestJS vai instanciar o controller e injetar automaticamente
     * os use-cases declarados nos providers abaixo.
     */
    MarketingController,
  ],
  providers: [
    // -------------------------------------------------------------------------
    // REPOSITÓRIO
    // Bind: quando alguém pedir LISTING_REPOSITORY, entregue PrismaListingRepository
    // -------------------------------------------------------------------------
    {
      provide: LISTING_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaListingRepository(prisma),
      inject: [PrismaService],
    },

    // -------------------------------------------------------------------------
    // USE CASES
    // Declarados como @Injectable(), o NestJS resolve as dependências (@Inject)
    // automaticamente com base nos providers acima.
    // -------------------------------------------------------------------------
    CreateListingUseCase,
    PublishListingUseCase,
    UnpublishListingUseCase,
    GetListingsUseCase,
  ],
})
export class MarketingModule {}
