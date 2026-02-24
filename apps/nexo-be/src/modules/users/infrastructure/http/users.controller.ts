import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { UserResponseDto } from './dtos/user-response.dto';
import {
  ListUsersQueryDto,
  PaginatedUsersResponseDto,
  UpdateUserRoleDto,
} from './dtos/users.dto';

/**
 * CONTROLLER DE USUÁRIOS INTERNOS
 *
 * Gerencia a equipe interna do portal (admins, moderadores, suporte).
 * Todos os endpoints exigem autenticação JWT.
 */
@ApiTags('Usuários Internos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
  ) {}

  // ---------------------------------------------------------------------------
  // GET /users — Listar usuários internos
  // ---------------------------------------------------------------------------

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar usuários internos',
    description:
      'Retorna a lista paginada da equipe interna com filtros opcionais.',
  })
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  @ApiBadRequestResponse({ description: 'Parâmetros inválidos.' })
  @ApiTooManyRequestsResponse({ description: 'Muitas requisições.' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' })
  async findAll(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    const result = await this.listUsersUseCase.execute(query);
    return {
      data: result.data.map(UserResponseDto.fromEntity),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ---------------------------------------------------------------------------
  // GET /users/:id — Buscar usuário por ID
  // ---------------------------------------------------------------------------

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário com id "uuid" não encontrado.',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  @ApiBadRequestResponse({ description: 'ID inválido (não é um UUID).' })
  @ApiTooManyRequestsResponse({ description: 'Muitas requisições.' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute(id);
    return UserResponseDto.fromEntity(user);
  }

  // ---------------------------------------------------------------------------
  // PATCH /users/:id/role — Atualizar role do usuário
  // ---------------------------------------------------------------------------

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar role do usuário',
    description:
      'Altera o papel de um usuário interno. Protege contra remoção do último ADMIN.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  @ApiBadRequestResponse({
    description: 'Role inválida ou tentativa de remover o único ADMIN.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Não é possível remover o único administrador do sistema.',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  @ApiTooManyRequestsResponse({ description: 'Muitas requisições.' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserRoleUseCase.execute(id, dto.role);
    return UserResponseDto.fromEntity(user);
  }
}
