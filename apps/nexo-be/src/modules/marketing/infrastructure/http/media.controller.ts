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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/http/jwt-auth.guard';
import { UploadMediaUseCase } from '../../application/use-cases/upload-marketing-media.use-case';
import {
  DeleteMediaUseCase,
  GetMediaUseCase,
} from '../../application/use-cases/get-delete-marketing-media.use-case';
import { ReorderMediaUseCase } from '../../application/use-cases/reorder-marketing-media.use-case';
import { MediaResponseDto } from './dtos/media-response.dto';
import { ReorderMediaDto } from './dtos/reorder-media.dto';

/**
 * CONTROLLER DE MÍDIA DO ANÚNCIO
 *
 * Gerencia o ciclo de vida das fotos e vídeos de um imóvel.
 * Todas as rotas exigem autenticação JWT.
 *
 * Rotas:
 *  POST   /marketing/:id/media           → upload (auth)
 *  GET    /marketing/:id/media           → listar mídias (auth)
 *  DELETE /marketing/:id/media/:mediaId  → deletar (auth)
 *  PATCH  /marketing/:id/media/reorder   → reordenar (auth)
 */
@ApiTags('Meus Imóveis')
@Controller('marketing/:id/media')
export class MediaController {
  constructor(
    private readonly uploadMedia: UploadMediaUseCase,
    private readonly getMedia: GetMediaUseCase,
    private readonly deleteMedia: DeleteMediaUseCase,
    private readonly reorderMedia: ReorderMediaUseCase,
  ) {}

  // ---------------------------------------------------------------------------
  // POST /marketing/:id/media — Upload de imagem ou vídeo
  // ---------------------------------------------------------------------------

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Mantém em memória → sem disco temporário
      limits: {
        fileSize: 100 * 1024 * 1024, // Guarda até 100 MB (validação de tipo no use-case)
        files: 1,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de imagem ou vídeo',
    description:
      'Envia um arquivo para o Cloudinary e salva a referência no banco.\n\n' +
      '**Imagens**: JPEG, PNG, WebP — máx. 10 MB — até 20 por imóvel.\n\n' +
      '**Vídeos**: MP4, MOV — máx. 100 MB — até 2 por imóvel.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPEG/PNG/WebP) ou vídeo (MP4/MOV)',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Mídia enviada e cadastrada com sucesso',
    type: MediaResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Tipo de arquivo inválido, tamanho excedido ou limite de mídias atingido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Limite de imagens atingido (máximo: 20 por imóvel).',
        error: 'Bad Request',
      },
    },
  })
  @ApiPayloadTooLargeResponse({
    description: 'Arquivo maior que 100 MB',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou inválido',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiNotFoundResponse({
    description: 'Imóvel não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Anúncio com id "uuid" não encontrado.',
        error: 'Not Found',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido',
    schema: {
      example: {
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno (falha no Cloudinary ou banco)',
    schema: { example: { statusCode: 500, message: 'Internal server error' } },
  })
  async upload(
    @Param('id', ParseUUIDPipe) propertyId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaResponseDto> {
    const media = await this.uploadMedia.execute({
      propertyId,
      file: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
    });
    return MediaResponseDto.fromEntity(media);
  }

  // ---------------------------------------------------------------------------
  // GET /marketing/:id/media — Listar mídias (auth)
  // ---------------------------------------------------------------------------

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar mídias do imóvel',
    description:
      'Retorna todas as fotos e vídeos ordenados por posição (order ASC). ' +
      'A primeira mídia (order 0) é a foto de capa. Requer autenticação.',
  })
  @ApiOkResponse({
    description: 'Lista de mídias ordenada',
    type: [MediaResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou inválido',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido',
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
    @Param('id', ParseUUIDPipe) propertyId: string,
  ): Promise<MediaResponseDto[]> {
    const medias = await this.getMedia.execute(propertyId);
    return medias.map(MediaResponseDto.fromEntity);
  }

  // ---------------------------------------------------------------------------
  // PATCH /marketing/:id/media/reorder — Reordenar galeria
  // ---------------------------------------------------------------------------

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reordenar galeria de imagens',
    description:
      'Atualiza a posição de uma ou mais mídias na galeria. ' +
      'A mídia com order=0 será a foto de capa exibida na listagem.',
  })
  @ApiOkResponse({ description: 'Galeria reordenada com sucesso' })
  @ApiBadRequestResponse({
    description:
      'IDs inválidos, orders duplicados ou mídia não pertence ao imóvel',
    schema: {
      example: {
        statusCode: 400,
        message: 'Valores de "order" duplicados.',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou inválido',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido',
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
  async reorder(
    @Param('id', ParseUUIDPipe) propertyId: string,
    @Body() dto: ReorderMediaDto,
  ): Promise<void> {
    await this.reorderMedia.execute({ propertyId, items: dto.items });
  }

  // ---------------------------------------------------------------------------
  // DELETE /marketing/:id/media/:mediaId — Deletar mídia
  // ---------------------------------------------------------------------------

  @Delete(':mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar mídia',
    description:
      'Remove o arquivo do Cloudinary e o registro do banco. ' +
      'Retorna 204 No Content em caso de sucesso.',
  })
  @ApiNoContentResponse({ description: 'Mídia removida com sucesso' })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, expirado ou inválido',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiNotFoundResponse({
    description: 'Mídia não encontrada',
    schema: {
      example: {
        statusCode: 404,
        message: 'Mídia com id "uuid" não encontrada.',
        error: 'Not Found',
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido',
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
    @Param('id', ParseUUIDPipe) _propertyId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ): Promise<void> {
    await this.deleteMedia.execute(mediaId);
  }
}
