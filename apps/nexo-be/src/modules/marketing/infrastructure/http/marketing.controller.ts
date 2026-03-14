/**
 * CONTROLLER: MARKETING PÚBLICO
 *
 * Rotas abertas — não exigem autenticação.
 * O OptionalJwtAuthGuard é usado apenas para leitura do contexto do caller
 * quando disponível (ex: admin visuliazando anúncios em rascunho).
 *
 * Rotas:
 *  GET /marketing       — listar anúncios (filtros opcionais, padrão: ACTIVE)
 *  GET /marketing/:id   — detalhe de um anúncio por ID
 */
import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '@/modules/auth/infrastructure/http/optional-jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/infrastructure/http/current-user.decorator';
import { UserEntity } from '@/modules/identity/domain/entities/user.entity';
import { GetListingUseCase } from '../../application/use-cases/get-marketing-by-id.use-case';
import { GetListingsUseCase } from '../../application/use-cases/get-marketing.use-case';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { GetListingsQueryDto } from './dtos/get-marketing-query.dto';
import {
  ListingResponseDto,
  PaginatedListingResponseDto,
} from './dtos/marketing-response.dto';

@ApiTags('Marketing')
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly getListing: GetListingUseCase,
    private readonly getListings: GetListingsUseCase,
  ) {}

  // ---------------------------------------------------------------------------
  // GET /marketing — Listar anúncios (público)
  // ---------------------------------------------------------------------------

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Listar anúncios',
    description:
      'Rota pública — sem necessidade de login. ' +
      'Por padrão retorna apenas anúncios com status ACTIVE. ' +
      'Para filtrar por outro status, o caller precisa estar autenticado ' +
      'e só pode ver seus próprios anúncios (exceto Admin/Moderador).',
  })
  @ApiOkResponse({
    description: 'Lista paginada de anúncios',
    type: PaginatedListingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de query inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['type must be one of the following values: APARTMENT, ...'],
        error: 'Bad Request',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido (100 req/min)',
    schema: {
      example: {
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    schema: { example: { statusCode: 500, message: 'Internal server error' } },
  })
  async list(
    @Query() query: GetListingsQueryDto,
    @CurrentUser() currentUser: UserEntity | null,
  ): Promise<PaginatedListingResponseDto> {
    // Apenas ACTIVE é público. Qualquer outro status exige autenticação
    // e o caller só pode ver seus próprios anúncios (exceto Admin/Moderador).
    if (query.status && query.status !== 'ACTIVE') {
      if (!currentUser) {
        throw new ForbiddenException(
          'Autentique-se para filtrar por status diferente de ACTIVE.',
        );
      }
    }

    const result = await this.getListings.execute({
      ...query,
      status: query.status as ListingStatus | undefined,
    });
    return {
      items: result.items.map(ListingResponseDto.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ---------------------------------------------------------------------------
  // GET /marketing/slug/:slug — Detalhe do anúncio por slug (público)
  // ---------------------------------------------------------------------------

  @Get('slug/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar anúncio por slug',
    description:
      'Rota pública — sem necessidade de login. ' +
      'Retorna o anúncio correspondente ao slug (URL amigável). ' +
      'Anúncios não-ACTIVE só são retornados para o próprio dono ou Admin/Moderador.',
  })
  @ApiOkResponse({ description: 'Dados do anúncio', type: ListingResponseDto })
  @ApiNotFoundResponse({
    description: 'Anúncio não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Anúncio com slug "slug" não encontrado.',
        error: 'Not Found',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido (100 req/min)',
    schema: {
      example: {
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    schema: { example: { statusCode: 500, message: 'Internal server error' } },
  })
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: UserEntity | null,
  ): Promise<ListingResponseDto> {
    const listing = await this.getListing.executeBySlug(
      slug,
      currentUser?.id,
      currentUser?.role,
    );
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // GET /marketing/:id — Detalhe do anúncio (público)
  // ---------------------------------------------------------------------------

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar anúncio por ID',
    description:
      'Rota pública — sem necessidade de login. ' +
      'Anúncios não-ACTIVE (DRAFT, INACTIVE, etc.) só são retornados ' +
      'para o próprio dono ou Admin/Moderador.',
  })
  @ApiOkResponse({ description: 'Dados do anúncio', type: ListingResponseDto })
  @ApiNotFoundResponse({
    description: 'Anúncio não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Anúncio com id "uuid" não encontrado.',
        error: 'Not Found',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido (100 req/min)',
    schema: {
      example: {
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    schema: { example: { statusCode: 500, message: 'Internal server error' } },
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity | null,
  ): Promise<ListingResponseDto> {
    const listing = await this.getListing.execute(
      id,
      currentUser?.id,
      currentUser?.role,
    );
    return ListingResponseDto.fromEntity(listing);
  }
}
