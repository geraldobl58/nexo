import {
  Body,
  Controller,
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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { ApproveAdvertiserUseCase } from '../../application/use-cases/approve-advertiser.use-case';
import { CreateAdvertiserUseCase } from '../../application/use-cases/create-advertiser.use-case';
import { GetAdvertiserUseCase } from '../../application/use-cases/get-advertiser.use-case';
import { GetAdvertisersUseCase } from '../../application/use-cases/get-advertisers.use-case';
import { SuspendAdvertiserUseCase } from '../../application/use-cases/suspend-advertiser.use-case';
import { AdvertiserResponseDto } from './dtos/advertiser-response.dto';
import { CreateAdvertiserDto } from './dtos/create-advertiser.dto';
import { GetAdvertisersQueryDto } from './dtos/get-advertisers-query.dto';
import { PaginatedAdvertisersResponseDto } from './dtos/paginated-advertisers-response.dto';
import { SuspendAdvertiserDto } from './dtos/suspend-advertiser.dto';

@ApiTags('Anunciantes')
@Controller('advertisers')
export class AdvertiserController {
  constructor(
    private readonly createAdvertiserUseCase: CreateAdvertiserUseCase,
    private readonly approveAdvertiserUseCase: ApproveAdvertiserUseCase,
    private readonly suspendAdvertiserUseCase: SuspendAdvertiserUseCase,
    private readonly getAdvertiserUseCase: GetAdvertiserUseCase,
    private readonly getAdvertisersUseCase: GetAdvertisersUseCase,
  ) {}

  // ---------------------------------------------------------------------------
  // GET /advertisers — Listar anunciantes com filtros (público)
  // ---------------------------------------------------------------------------

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar anunciantes',
    description:
      'Retorna uma lista paginada de anunciantes. Suporta filtros por tipo, status, cidade, estado, verificação e busca por texto.',
  })
  @ApiOkResponse({
    description: 'Lista retornada com sucesso.',
    type: PaginatedAdvertisersResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Parâmetros de query inválidos.' })
  @ApiTooManyRequestsResponse({ description: 'Muitas requisições.' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' })
  async findAll(
    @Query() query: GetAdvertisersQueryDto,
  ): Promise<PaginatedAdvertisersResponseDto> {
    const result = await this.getAdvertisersUseCase.execute(query);
    return {
      data: result.data.map(AdvertiserResponseDto.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ---------------------------------------------------------------------------
  // POST /advertisers — Cadastrar novo anunciante (público)
  // ---------------------------------------------------------------------------

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastrar anunciante',
    description:
      'Registra um novo anunciante no sistema. O anunciante começa com status PENDING e precisa ser aprovado por um administrador.',
  })
  @ApiCreatedResponse({
    description: 'Anunciante cadastrado com sucesso.',
    type: AdvertiserResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Dados inválidos (campos obrigatórios ausentes ou malformados).',
    schema: {
      example: {
        statusCode: 400,
        message: ['O nome é obrigatório.', 'Informe um e-mail válido.'],
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({
    description: 'E-mail ou documento já cadastrado.',
    schema: {
      example: {
        statusCode: 409,
        message: 'O e-mail "joao@imob.com" já está cadastrado.',
        error: 'Conflict',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas requisições. Tente novamente em alguns segundos.',
  })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' })
  async create(
    @Body() dto: CreateAdvertiserDto,
  ): Promise<AdvertiserResponseDto> {
    const advertiser = await this.createAdvertiserUseCase.execute(dto);
    return AdvertiserResponseDto.fromEntity(advertiser);
  }

  // ---------------------------------------------------------------------------
  // GET /advertisers/:id — Buscar anunciante por ID (público)
  // ---------------------------------------------------------------------------

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar anunciante por ID',
    description: 'Retorna os dados públicos de um anunciante pelo UUID.',
  })
  @ApiOkResponse({
    description: 'Anunciante encontrado.',
    type: AdvertiserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Anunciante não encontrado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Anunciante com id "uuid" não encontrado.',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'ID inválido (não é um UUID válido).',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (uuid is expected)',
        error: 'Bad Request',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas requisições. Tente novamente em alguns segundos.',
  })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdvertiserResponseDto> {
    const advertiser = await this.getAdvertiserUseCase.execute(id);
    return AdvertiserResponseDto.fromEntity(advertiser);
  }

  // ---------------------------------------------------------------------------
  // PATCH /advertisers/:id/approve — Aprovar anunciante (autenticado)
  // ---------------------------------------------------------------------------

  @Patch(':id/approve')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Aprovar anunciante',
    description:
      'Transição PENDING → ACTIVE. O anunciante poderá publicar imóveis após a aprovação. Requer autenticação.',
  })
  @ApiOkResponse({
    description: 'Anunciante aprovado com sucesso.',
    type: AdvertiserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'O anunciante não está em status PENDING.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Apenas anunciantes com status PENDING podem ser aprovados. Status atual: ACTIVE.',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente ou inválido.',
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiNotFoundResponse({
    description: 'Anunciante não encontrado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Anunciante com id "uuid" não encontrado.',
        error: 'Not Found',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas requisições. Tente novamente em alguns segundos.',
  })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdvertiserResponseDto> {
    const advertiser = await this.approveAdvertiserUseCase.execute(id);
    return AdvertiserResponseDto.fromEntity(advertiser);
  }

  // ---------------------------------------------------------------------------
  // PATCH /advertisers/:id/suspend — Suspender anunciante (autenticado)
  // ---------------------------------------------------------------------------

  @Patch(':id/suspend')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Suspender anunciante',
    description:
      'Transição ACTIVE → SUSPENDED com motivo obrigatório. Requer autenticação.',
  })
  @ApiOkResponse({
    description: 'Anunciante suspenso com sucesso.',
    type: AdvertiserResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'O anunciante não está em status ACTIVE, ou o motivo está ausente.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Apenas anunciantes com status ACTIVE podem ser suspensos. Status atual: PENDING.',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente ou inválido.',
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiNotFoundResponse({
    description: 'Anunciante não encontrado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Anunciante com id "uuid" não encontrado.',
        error: 'Not Found',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas requisições. Tente novamente em alguns segundos.',
  })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' })
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendAdvertiserDto,
  ): Promise<AdvertiserResponseDto> {
    const advertiser = await this.suspendAdvertiserUseCase.execute(
      id,
      dto.reason,
    );
    return AdvertiserResponseDto.fromEntity(advertiser);
  }
}
