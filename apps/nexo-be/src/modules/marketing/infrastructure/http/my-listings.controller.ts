/**
 * CONTROLLER: MEUS IMÓVEIS (rotas protegidas — dono autenticado)
 *
 * Todas as rotas deste controller exigem token JWT válido.
 * O guard é aplicado em nível de classe — nenhum endpoint é público aqui.
 *
 * Rotas:
 *  POST   /marketing/me              — criar anúncio (status: DRAFT)
 *  GET    /marketing/me               — listar meus anúncios (todos os status)
 *  GET    /marketing/me/:id           — buscar meu anúncio por ID
 *  PATCH  /marketing/me/:id           — atualizar campos do anúncio
 *  DELETE /marketing/me/:id           — excluir anúncio (soft delete)
 *  PATCH  /marketing/me/:id/publish   — publicar/reativar (DRAFT|INACTIVE → ACTIVE)
 *  PATCH  /marketing/me/:id/unpublish — despublicar (ACTIVE → INACTIVE)
 */
import {
  Body,
  Controller,
  Delete,
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
import { CurrentUser } from '@/modules/auth/infrastructure/http/current-user.decorator';
import { UserEntity } from '@/modules/identity/domain/entities/user.entity';
import { CreateListingUseCase } from '../../application/use-cases/create-marketing.use-case';
import { UpdateListingUseCase } from '../../application/use-cases/update-marketing.use-case';
import { DeleteListingUseCase } from '../../application/use-cases/delete-marketing.use-case';
import { PublishListingUseCase } from '../../application/use-cases/publish-marketing.use-case';
import { UnpublishListingUseCase } from '../../application/use-cases/unpublish-marketing.use-case';
import { GetMyListingsUseCase } from '../../application/use-cases/get-my-marketing.use-case';
import { GetMyListingByIdUseCase } from '../../application/use-cases/get-my-marketing-by-id.use-case';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { CreateListingDto } from './dtos/create-marketing.dto';
import { UpdateListingDto } from './dtos/update-marketing.dto';
import { GetListingsQueryDto } from './dtos/get-marketing-query.dto';
import {
  ListingResponseDto,
  PaginatedListingResponseDto,
} from './dtos/marketing-response.dto';

// Redefinição de respostas de erro comuns para reutilização nos decorators
const unauthorizedResponse = {
  description: 'Token JWT ausente, expirado ou inválido',
  schema: { example: { statusCode: 401, message: 'Unauthorized' } },
};

const forbiddenResponse = {
  description: 'Você não tem permissão para gerenciar este anúncio',
  schema: {
    example: {
      statusCode: 403,
      message: 'Você não tem permissão para gerenciar este anúncio.',
      error: 'Forbidden',
    },
  },
};

const notFoundResponse = {
  description: 'Anúncio não encontrado',
  schema: {
    example: {
      statusCode: 404,
      message: 'Anúncio com id "uuid" não encontrado.',
      error: 'Not Found',
    },
  },
};

const tooManyRequestsResponse = {
  description: 'Limite de requisições excedido (100 req/min)',
  schema: {
    example: {
      statusCode: 429,
      message: 'ThrottlerException: Too Many Requests',
    },
  },
};

const internalErrorResponse = {
  description: 'Erro interno do servidor',
  schema: { example: { statusCode: 500, message: 'Internal server error' } },
};

@ApiTags('Meus Imóveis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketing/me')
export class MyListingsController {
  constructor(
    private readonly createListing: CreateListingUseCase,
    private readonly updateListing: UpdateListingUseCase,
    private readonly deleteListing: DeleteListingUseCase,
    private readonly publishListing: PublishListingUseCase,
    private readonly unpublishListing: UnpublishListingUseCase,
    private readonly getMyListings: GetMyListingsUseCase,
    private readonly getMyListingById: GetMyListingByIdUseCase,
  ) {}

  // ---------------------------------------------------------------------------
  // POST /marketing/me — Criar anúncio
  // ---------------------------------------------------------------------------

  @Post()
  @ApiOperation({
    summary: 'Criar anúncio',
    description:
      'Cria um novo anúncio com status DRAFT. ' +
      'O dono é identificado pelo token JWT — não envie userId no body. ' +
      'Para publicar o anúncio use o endpoint PATCH /marketing/:id/publish.',
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
  @ApiUnauthorizedResponse(unauthorizedResponse)
  @ApiNotFoundResponse({
    description: 'Usuário autenticado não encontrado no banco',
    schema: {
      example: {
        statusCode: 404,
        message: 'Anunciante com id "uuid" não encontrado.',
        error: 'Not Found',
      },
    },
  })
  @ApiTooManyRequestsResponse(tooManyRequestsResponse)
  @ApiInternalServerErrorResponse(internalErrorResponse)
  async create(
    @CurrentUser() currentUser: UserEntity,
    @Body() dto: CreateListingDto,
  ): Promise<ListingResponseDto> {
    const listing = await this.createListing.execute({
      ...dto,
      advertiserId: currentUser.id,
    });
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // GET /marketing/me — Listar meus anúncios
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({
    summary: 'Listar meus anúncios',
    description:
      'Retorna a lista paginada dos anúncios do usuário autenticado. ' +
      'Inclui todos os status (DRAFT, ACTIVE, INACTIVE, SOLD, RENTED). ' +
      'Use o filtro `status` para restringir a um status específico.',
  })
  @ApiOkResponse({
    description: 'Lista paginada dos anúncios do dono',
    type: PaginatedListingResponseDto,
  })
  @ApiUnauthorizedResponse(unauthorizedResponse)
  @ApiTooManyRequestsResponse(tooManyRequestsResponse)
  @ApiInternalServerErrorResponse(internalErrorResponse)
  async listMine(
    @CurrentUser() currentUser: UserEntity,
    @Query() query: GetListingsQueryDto,
  ): Promise<PaginatedListingResponseDto> {
    const result = await this.getMyListings.execute(currentUser.id, {
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
  // GET /marketing/me/:id — Buscar meu anúncio por ID
  // ---------------------------------------------------------------------------

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar meu anúncio por ID',
    description:
      'Retorna os dados completos de um anúncio que pertence ao usuário autenticado. ' +
      'Retorna qualquer status (DRAFT, ACTIVE, INACTIVE, SOLD, RENTED). ' +
      'Retorna 403 se o anúncio existir mas pertencer a outro usuário.',
  })
  @ApiOkResponse({ description: 'Dados do anúncio', type: ListingResponseDto })
  @ApiUnauthorizedResponse(unauthorizedResponse)
  @ApiForbiddenResponse(forbiddenResponse)
  @ApiNotFoundResponse(notFoundResponse)
  @ApiTooManyRequestsResponse(tooManyRequestsResponse)
  @ApiInternalServerErrorResponse(internalErrorResponse)
  async findMine(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ListingResponseDto> {
    const listing = await this.getMyListingById.execute(id, currentUser.id);
    return ListingResponseDto.fromEntity(listing);
  }

  // ---------------------------------------------------------------------------
  // PATCH /marketing/me/:id — Atualizar anúncio
  // ---------------------------------------------------------------------------

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar anúncio',
    description:
      'Atualiza campos editáveis do anúncio (PATCH semântico — apenas os ' +
      'campos enviados no body são alterados). ' +
      'Apenas o dono pode editar. ' +
      'Status é gerenciado exclusivamente pelos endpoints /publish e /unpublish.',
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
  @ApiUnauthorizedResponse(unauthorizedResponse)
  @ApiForbiddenResponse(forbiddenResponse)
  @ApiNotFoundResponse(notFoundResponse)
  @ApiTooManyRequestsResponse(tooManyRequestsResponse)
  @ApiInternalServerErrorResponse(internalErrorResponse)
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
  // DELETE /marketing/me/:id — Excluir anúncio (soft delete)
  // ---------------------------------------------------------------------------

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir anúncio',
    description:
      'Realiza soft delete do anúncio (preenche deletedAt). ' +
      'O registro permanece no banco para auditoria mas desaparece de todas as buscas. ' +
      'Apenas o dono pode excluir. ' +
      'Retorna 204 No Content em caso de sucesso.',
  })
  @ApiNoContentResponse({
    description: 'Anúncio excluído com sucesso (sem corpo na resposta)',
  })
  @ApiUnauthorizedResponse(unauthorizedResponse)
  @ApiForbiddenResponse(forbiddenResponse)
  @ApiNotFoundResponse(notFoundResponse)
  @ApiTooManyRequestsResponse(tooManyRequestsResponse)
  @ApiInternalServerErrorResponse(internalErrorResponse)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.deleteListing.execute(id, currentUser.id, currentUser.role);
  }

  // ---------------------------------------------------------------------------
  // PATCH /marketing/me/:id/publish — Publicar anúncio (DRAFT → ACTIVE)
  // ---------------------------------------------------------------------------

  @Patch(':id/publish')
  @ApiOperation({
    summary: 'Publicar anúncio',
    description:
      'Move o anúncio de DRAFT para ACTIVE, tornando-o visível nas buscas. ' +
      'Apenas o dono pode publicar.',
  })
  @ApiOkResponse({
    description: 'Anúncio publicado com sucesso (status: ACTIVE)',
    type: ListingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Anúncio não está em DRAFT ou faltam campos obrigatórios',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Apenas anúncios em DRAFT podem ser publicados. Status atual: ACTIVE',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse(unauthorizedResponse)
  @ApiForbiddenResponse(forbiddenResponse)
  @ApiNotFoundResponse(notFoundResponse)
  @ApiTooManyRequestsResponse(tooManyRequestsResponse)
  @ApiInternalServerErrorResponse(internalErrorResponse)
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
  // PATCH /marketing/me/:id/unpublish — Despublicar anúncio (ACTIVE → INACTIVE)
  // ---------------------------------------------------------------------------

  @Patch(':id/unpublish')
  @ApiOperation({
    summary: 'Despublicar anúncio',
    description:
      'Move o anúncio de ACTIVE para INACTIVE. ' +
      'O imóvel sai das buscas, mas os dados são mantidos. ' +
      'Apenas o dono pode despublicar.',
  })
  @ApiOkResponse({
    description: 'Anúncio despublicado (status: INACTIVE)',
    type: ListingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Anúncio não está em ACTIVE',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Apenas anúncios ACTIVE podem ser despublicados. Status atual: DRAFT',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse(unauthorizedResponse)
  @ApiForbiddenResponse(forbiddenResponse)
  @ApiNotFoundResponse(notFoundResponse)
  @ApiTooManyRequestsResponse(tooManyRequestsResponse)
  @ApiInternalServerErrorResponse(internalErrorResponse)
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
