import { Module } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';

// Domain
import { LISTING_REPOSITORY } from '../../domain/repositories/marketing.repository';
import { MEDIA_REPOSITORY } from '../../domain/repositories/marketing-media.repository';

// Application — Use Cases (listings)
import { CreateListingUseCase } from '../../application/use-cases/create-marketing.use-case';
import { GetListingUseCase } from '../../application/use-cases/get-marketing-by-id.use-case';
import { UpdateListingUseCase } from '../../application/use-cases/update-marketing.use-case';
import { DeleteListingUseCase } from '../../application/use-cases/delete-marketing.use-case';
import { PublishListingUseCase } from '../../application/use-cases/publish-marketing.use-case';
import { UnpublishListingUseCase } from '../../application/use-cases/unpublish-marketing.use-case';
import { GetListingsUseCase } from '../../application/use-cases/get-marketing.use-case';
import { GetMyListingsUseCase } from '../../application/use-cases/get-my-marketing.use-case';
import { GetMyListingByIdUseCase } from '../../application/use-cases/get-my-marketing-by-id.use-case';

// Application — Use Cases (media)
import { UploadMediaUseCase } from '../../application/use-cases/upload-marketing-media.use-case';
import {
  GetMediaUseCase,
  DeleteMediaUseCase,
} from '../../application/use-cases/get-delete-marketing-media.use-case';
import { ReorderMediaUseCase } from '../../application/use-cases/reorder-marketing-media.use-case';

// Infrastructure — Repositórios
import { PrismaListingRepository } from '../../infrastructure/prisma/prisma-marketing.repository';
import { PrismaMediaRepository } from '../../infrastructure/prisma/prisma-media.repository';

// Infrastructure — Cloudinary
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';

// Infrastructure — HTTP
import { MarketingController } from '../../infrastructure/http/marketing.controller';
import { MyListingsController } from '../../infrastructure/http/my-listings.controller';
import { MediaController } from '../../infrastructure/http/media.controller';

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
  controllers: [MyListingsController, MediaController, MarketingController],
  providers: [
    // -------------------------------------------------------------------------
    // REPOSITÓRIOS
    // -------------------------------------------------------------------------
    {
      provide: LISTING_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaListingRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: MEDIA_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaMediaRepository(prisma),
      inject: [PrismaService],
    },

    // -------------------------------------------------------------------------
    // SERVIÇOS DE INFRAESTRUTURA
    // -------------------------------------------------------------------------
    CloudinaryService,

    // -------------------------------------------------------------------------
    // USE CASES — ANÚNCIOS
    // -------------------------------------------------------------------------
    CreateListingUseCase,
    GetListingUseCase,
    UpdateListingUseCase,
    DeleteListingUseCase,
    PublishListingUseCase,
    UnpublishListingUseCase,
    GetListingsUseCase,
    GetMyListingsUseCase,
    GetMyListingByIdUseCase,

    // -------------------------------------------------------------------------
    // USE CASES — MÍDIA
    // -------------------------------------------------------------------------
    UploadMediaUseCase,
    GetMediaUseCase,
    DeleteMediaUseCase,
    ReorderMediaUseCase,
  ],
})
export class MarketingModule {}
