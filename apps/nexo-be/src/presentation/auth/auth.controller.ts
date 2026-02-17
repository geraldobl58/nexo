import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MeUseCase } from '@/application/auth/me.usecase';
import { AuthUser } from '@/domain/auth/auth-user';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { MeResponseDto } from './me-response.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly meUseCase: MeUseCase) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Retorna o usuario autenticado',
    description:
      'Valida o token JWT do Keycloak e retorna os dados do usuario. ' +
      'Na primeira chamada, cria o usuario no banco. Nas seguintes, atualiza o lastLoginAt.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuario autenticado',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou invalido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Token valido mas sem permissao para acessar o recurso',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisicoes excedido (100 req/min)',
    schema: {
      example: {
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      'Erro interno do servidor (falha no banco, Keycloak indisponivel, etc)',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
      },
    },
  })
  async me(@CurrentUser() user: AuthUser) {
    return this.meUseCase.execute(user);
  }
}
