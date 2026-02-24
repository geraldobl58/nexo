import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/http/jwt-auth.guard';
import { CreateListingUseCase } from '../../application/use-cases/create-listing.use-case';
import { PublishListingUseCase } from '../../application/use-cases/publish-listing.use-case';
import { UnpublishListingUseCase } from '../../application/use-cases/unpublish-listing.use-case';
import { GetListingsUseCase } from '../../application/use-cases/get-listings.use-case';
import { CreateListingDto } from './dtos/create-listing.dto';
import { GetListingsQueryDto } from './dtos/get-listings-query.dto';
import {
  ListingResponseDto,
  PaginatedListingResponseDto,
} from './dtos/listing-response.dto';

/**
 * CONTROLLER DE MARKETING (ANÚnCIOS)
 *
 * O controller é a "porta de entrada" HTTP do módulo.
 * Suas únicas responsabilidades são:
 *  1. Receber a requisição HTTP
 *  2. Chamar o use-case correto
 *  3. Formatar e retornar a resposta
 *
 * REGRA IMPORTANTÍSSIMA para juniors:
 * O controller NÃO contém lógica de negócio.
 * Se você precisar escrever um `if` relacionado a regras de negócio aqui,
 * provavelmente ele deveria estar no use-case.
 *
 * Rotas expostas:
 *  POST   /listings          → cria anúncio (requer auth)
 *  PATCH  /listings/:id/publish   → publica (requer auth)
 *  PATCH  /listings/:id/unpublish → pausa (requer auth)
 *  GET    /listings          → busca pública (sem auth)
 */
@ApiTags('Listings (Marketing)')
@Controller('listings')
export class MarketingController {
  /**
   * Injeção de dependência via construtor.
   * O NestJS resolve automaticamente as dependências registradas no módulo.
   */
  constructor(
    private readonly createListing: CreateListingUseCase,
    private readonly publishListing: PublishListingUseCase,
    private readonly unpublishListing: UnpublishListingUseCase,
    private readonly getListings: GetListingsUseCase,
  ) {}

  // ---------------------------------------------------------------------------
  // POST /listings — Criar anúncio
  // ---------------------------------------------------------------------------

  @Post()
  @UseGuards(JwtAuthGuard) // exige token JWT válido
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar anúncio imóvel',
    description:
      'Cria um novo anúncio com status DRAFT. ' +
      'Para tornar visível no portal, use o endpoint de publicar.',
  })
  @ApiCreatedResponse({
    description: 'Anúncio criado com sucesso (status: DRAFT)',
    type: ListingResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Dados inválidos (título muito curto/longo, preço zero, slug não gerado)',
    schema: {
      example: {
        statusCode: 400,
        message: 'O preço deve ser maior que zero.',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou inválido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Anunciante (advertiserId) não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Anunciante com id "uuid" não encontrado.',
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
    description: 'Erro interno do servidor (falha no banco, etc)',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
      },
    },
  })
  async create(@Body() dto: CreateListingDto): Promise<ListingResponseDto> {
    const listing = await this.createListing.execute(dto);
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // PATCH /listings/:id/publish — Publicar anúncio
  // ---------------------------------------------------------------------------

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publicar anúncio',
    description:
      'Move o anúncio de DRAFT para ACTIVE. ' +
      'Após isso, o imóvel fica visível nas buscas.',
  })
  @ApiOkResponse({
    description: 'Anúncio publicado com sucesso (status: ACTIVE)',
    type: ListingResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Anúncio não está em DRAFT ou faltam campos obrigatórios (preço, cidade, estado, bairro)',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Apenas anúncios em DRAFT podem ser publicados. Status atual: ACTIVE',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou inválido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
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
    description: 'Erro interno do servidor (falha no banco, etc)',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
      },
    },
  })
  async publish(
    // @Param(): extrai o :id da URL.
    // ParseUUIDPipe: valida que o id tem formato UUID antes de chegar no use-case.
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ListingResponseDto> {
    const listing = await this.publishListing.execute(id);
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // PATCH /listings/:id/unpublish — Despublicar anúncio
  // ---------------------------------------------------------------------------

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Despublicar anúncio',
    description:
      'Move o anúncio de ACTIVE para INACTIVE. ' +
      'O imóvel sai das buscas, mas os dados são mantidos.',
  })
  @ApiOkResponse({
    description: 'Anúncio despublicado (status: INACTIVE)',
    type: ListingResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Anúncio não está em ACTIVE (ex: já está INACTIVE, DRAFT, SOLD ou RENTED)',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Apenas anúncios ACTIVE podem ser despublicados. Status atual: DRAFT',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou inválido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
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
    description: 'Erro interno do servidor (falha no banco, etc)',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
      },
    },
  })
  async unpublish(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ListingResponseDto> {
    const listing = await this.unpublishListing.execute(id);
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // GET /listings — Busca pública de anúncios
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({
    summary: 'Buscar anúncios imóveis',
    description:
      'Rota pública (sem necessidade de login). ' +
      'Aceita filtros opcionais via query string. ' +
      'Retorna apenas anúncios com status ACTIVE.',
  })
  @ApiOkResponse({
    description: 'Lista paginada de anúncios',
    type: PaginatedListingResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Parâmetros de query inválidos (tipo errado, valor fora do range, etc)',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'type must be one of the following values: APARTMENT, HOUSE, ...',
        ],
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
    description: 'Erro interno do servidor (falha no banco, etc)',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
      },
    },
  })
  async list(
    // @Query(): extrai todos os query params e popula o DTO.
    // Com transform: true no ValidationPipe, strings numéricas são convertidas.
    @Query() query: GetListingsQueryDto,
  ): Promise<PaginatedListingResponseDto> {
    const result = await this.getListings.execute(query);
    return {
      items: result.items.map(ListingResponseDto.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
