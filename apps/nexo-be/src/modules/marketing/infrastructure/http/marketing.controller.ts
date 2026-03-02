import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/http/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@/modules/auth/infrastructure/http/optional-jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/infrastructure/http/current-user.decorator';
import { UserEntity } from '@/modules/identity/domain/entities/user.entity';
import { CreateListingUseCase } from '../../application/use-cases/create-marketing.use-case';
import { GetListingUseCase } from '../../application/use-cases/get-marketing-by-id.use-case';
import { UpdateListingUseCase } from '../../application/use-cases/update-marketing.use-case';
import { DeleteListingUseCase } from '../../application/use-cases/delete-marketing.use-case';
import { PublishListingUseCase } from '../../application/use-cases/publish-marketing.use-case';
import { UnpublishListingUseCase } from '../../application/use-cases/unpublish-marketing.use-case';
import { GetListingsUseCase } from '../../application/use-cases/get-marketing.use-case';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { CreateListingDto } from './dtos/create-marketing.dto';
import { UpdateListingDto } from './dtos/update-marketing.dto';
import { GetListingsQueryDto } from './dtos/get-marketing-query.dto';
import {
  ListingResponseDto,
  PaginatedListingResponseDto,
} from './dtos/marketing-response.dto';

@ApiTags('Marketing')
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly createListing: CreateListingUseCase,
    private readonly getListing: GetListingUseCase,
    private readonly updateListing: UpdateListingUseCase,
    private readonly deleteListing: DeleteListingUseCase,
    private readonly publishListing: PublishListingUseCase,
    private readonly unpublishListing: UnpublishListingUseCase,
    private readonly getListings: GetListingsUseCase,
  ) {}

  // ---------------------------------------------------------------------------
  // POST /marketing — Criar anúncio
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
    description: 'Usuário não encontrado',
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
  async create(
    @CurrentUser() currentUser: UserEntity,
    @Body() dto: CreateListingDto,
  ): Promise<ListingResponseDto> {
    const listing = await this.createListing.execute({
      ...dto,
      createdById: currentUser.id,
    });
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // GET /marketing — Listar anúncios (público)
  // ---------------------------------------------------------------------------

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Listar anúncios',
    description:
      'Rota pública (sem necessidade de login). ' +
      'Aceita filtros opcionais via query string. ' +
      'Por padrão retorna apenas anúncios com status ACTIVE. ' +
      'Use o filtro `status` para buscar DRAFT, PAUSED etc.',
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
    // Restrição de status: apenas ACTIVE é público.
    // Para qualquer outro status o caller precisa estar autenticado
    // e só pode ver seus próprios anúncios (exceto Admin/Moderador).
    if (query.status && query.status !== 'ACTIVE') {
      if (!currentUser) {
        throw new ForbiddenException(
          'Autentique-se para filtrar por status diferente de ACTIVE.',
        );
      }
      const isPrivileged =
        currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR';
      if (!isPrivileged && query.advertiserId !== currentUser.id) {
        throw new ForbiddenException(
          'Você só pode ver seus próprios anúncios com status diferente de ACTIVE.',
        );
      }
    }

    const result = await this.getListings.execute({
      ...query,
      // O DTO usa `advertiserId` como nome público; o domínio usa `createdById`.
      createdById: query.advertiserId,
      // Cast seguro: o valor já foi validado como string de enum válido pelo DTO.
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
  // GET /marketing/:id — Detalhe do anúncio (público)
  // ---------------------------------------------------------------------------

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar anúncio por ID',
    description:
      'Retorna os dados completos de um único anúncio. ' +
      'Anúncios não-ACTIVE (DRAFT, INACTIVE, etc.) só são retornados ' +
      'para o próprio dono ou Admin/Moderador.',
  })
  @ApiOkResponse({
    description: 'Dados do anúncio',
    type: ListingResponseDto,
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

  // ---------------------------------------------------------------------------
  // PATCH /marketing/:id — Atualizar anúncio
  // ---------------------------------------------------------------------------

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar anúncio',
    description:
      'Atualiza campos editáveis de um anúncio existente (PATCH semântico — ' +
      'apenas os campos enviados no body são alterados). ' +
      'Status é gerenciado pelos endpoints /publish e /unpublish.',
  })
  @ApiOkResponse({
    description: 'Anúncio atualizado com sucesso',
    type: ListingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos (preço zero, título fora do range, etc.)',
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
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
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
    description: 'Erro interno do servidor',
    schema: { example: { statusCode: 500, message: 'Internal server error' } },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity,
    @Body() dto: UpdateListingDto,
  ): Promise<ListingResponseDto> {
    const listing = await this.updateListing.execute(
      id,
      dto,
      currentUser.id,
      currentUser.role,
    );
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // DELETE /marketing/:id — Excluir anúncio (soft delete)
  // ---------------------------------------------------------------------------

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir anúncio',
    description:
      'Realiza soft delete do anúncio (preenche deletedAt). ' +
      'O registro permanece no banco para auditoria mas desaparece de todas as buscas. ' +
      'Retorna 204 No Content em caso de sucesso.',
  })
  @ApiNoContentResponse({
    description: 'Anúncio excluído com sucesso (sem corpo na resposta)',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou inválido',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para excluir este anúncio',
    schema: {
      example: {
        statusCode: 403,
        message: 'Você não tem permissão para excluir este anúncio.',
        error: 'Forbidden',
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
    description: 'Erro interno do servidor',
    schema: { example: { statusCode: 500, message: 'Internal server error' } },
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.deleteListing.execute(id, currentUser.id, currentUser.role);
  }

  // ---------------------------------------------------------------------------
  // PATCH /marketing/:id/publish — Publicar anúncio
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
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para publicar este anúncio',
    schema: {
      example: {
        statusCode: 403,
        message: 'Você não tem permissão para publicar este anúncio.',
        error: 'Forbidden',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Anúncio não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário com id "uuid" não encontrado.',
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
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ListingResponseDto> {
    const listing = await this.publishListing.execute(
      id,
      currentUser.id,
      currentUser.role,
    );
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // PATCH /marketing/:id/unpublish — Despublicar anúncio
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
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para despublicar este anúncio',
    schema: {
      example: {
        statusCode: 403,
        message: 'Você não tem permissão para despublicar este anúncio.',
        error: 'Forbidden',
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
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ListingResponseDto> {
    const listing = await this.unpublishListing.execute(
      id,
      currentUser.id,
      currentUser.role,
    );
    return ListingResponseDto.fromEntity(listing);
  }
}
