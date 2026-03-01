import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export type CloudinaryResourceType = 'image' | 'video' | 'auto';

export interface CloudinaryUploadOptions {
  /** Folder no Cloudinary: ex. "nexo/properties/uuid-do-imovel" */
  folder: string;
  /** Tipo do recurso */
  resourceType: CloudinaryResourceType;
}

export interface CloudinaryUploadResult {
  /** URL pública CDN */
  url: string;
  /** ID para deleção futura */
  publicId: string;
  /** Largura em px (apenas imagens) */
  width?: number;
  /** Altura em px (apenas imagens) */
  height?: number;
  /** Formato detectado (jpg, png, mp4, etc.) */
  format: string;
  /** Tamanho em bytes */
  bytes: number;
}

/**
 * SERVIÇO DE UPLOAD NO CLOUDINARY
 *
 * Wrapper sobre o Cloudinary SDK v2.
 * Toda lógica de comunicação com o Cloudinary fica aqui —
 * os use-cases chamam este serviço e não dependem diretamente do SDK.
 *
 * Configuração: lê CLOUDINARY_URL do ambiente.
 * Formato esperado: cloudinary://<api_key>:<api_secret>@<cloud_name>
 */
@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const cloudinaryUrl = this.config.get<string>('CLOUDINARY_URL');

    if (!cloudinaryUrl) {
      throw new Error(
        'CLOUDINARY_URL não encontrada nas variáveis de ambiente. ' +
          'Formato: cloudinary://<api_key>:<api_secret>@<cloud_name>',
      );
    }

    // O SDK do Cloudinary lê a CLOUDINARY_URL automaticamente
    // quando a env var está definida. Confirmar a configuração:
    cloudinary.config(cloudinaryUrl);

    const cfg = cloudinary.config();
    this.logger.log(`Cloudinary configurado: cloud_name="${cfg.cloud_name}"`);
  }

  /**
   * Faz upload de um arquivo a partir de um Buffer ou Stream.
   *
   * Usamos upload via stream para não precisar salvar o arquivo
   * em disco (memória → Cloudinary diretamente).
   *
   * @param file    - Buffer do arquivo (vindo do Multer memory storage)
   * @param options - Pasta de destino e tipo de recurso
   */
  async upload(
    file: Buffer,
    options: CloudinaryUploadOptions,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType,
          // Força HTTPS nas URLs geradas
          secure: true,
          // Transformações automáticas de qualidade para imagens
          ...(options.resourceType === 'image' && {
            quality: 'auto',
            fetch_format: 'auto',
          }),
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error('Erro ao fazer upload no Cloudinary', error);
            reject(error ?? new Error('Resposta vazia do Cloudinary'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      // Converte Buffer em Stream e faz pipe para o uploadStream
      const readable = new Readable();
      readable.push(file);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Deleta um asset do Cloudinary pelo public_id.
   *
   * @param publicId     - ID retornado no upload (ex: "nexo/properties/uuid/img")
   * @param resourceType - "image" ou "video"
   */
  async delete(
    publicId: string,
    resourceType: CloudinaryResourceType = 'image',
  ): Promise<void> {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(
        `Falha ao deletar asset "${publicId}" no Cloudinary: ${result.result}`,
      );
    }

    this.logger.log(
      `Asset deletado do Cloudinary: "${publicId}" (${result.result})`,
    );
  }
}
