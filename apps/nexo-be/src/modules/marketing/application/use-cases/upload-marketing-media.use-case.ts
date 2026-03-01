import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MEDIA_REPOSITORY,
  MediaRepository,
} from '../../domain/repositories/marketing-media.repository';
import {
  LISTING_REPOSITORY,
  ListingRepository,
} from '../../domain/repositories/marketing.repository';
import {
  MediaEntity,
  MediaType,
} from '../../domain/entities/marketing-media.entity';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';

/** Limites por tipo de mídia */
const MAX_IMAGES = 20;
const MAX_VIDEOS = 2;

/** Tipos MIME aceitos */
const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const ALLOWED_VIDEO_MIME = new Set([
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
]);

/** Tamanho máximo em bytes */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export interface UploadMediaInput {
  /** UUID do imóvel que recebe a mídia */
  propertyId: string;
  /** Arquivo vindo do Multer (memória) */
  file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
}

/**
 * USE CASE: UPLOAD DE MÍDIA (IMAGEM OU VÍDEO)
 *
 * Fluxo:
 *  1. Verifica se o imóvel existe
 *  2. Detecta o tipo (IMAGE/VIDEO) pelo MIME type
 *  3. Valida extensão, tamanho e limite de mídias por imóvel
 *  4. Envia para o Cloudinary (pasta: nexo/properties/{propertyId})
 *  5. Persiste URL + publicId no banco
 *  6. Retorna a entidade criada
 */
@Injectable()
export class UploadMediaUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepo: MediaRepository,
    @Inject(LISTING_REPOSITORY)
    private readonly listingRepo: ListingRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(input: UploadMediaInput): Promise<MediaEntity> {
    // 1. Verifica se o imóvel existe
    const listing = await this.listingRepo.findById(input.propertyId);
    if (!listing || listing.deletedAt !== null) {
      throw new NotFoundException(
        `Anúncio com id "${input.propertyId}" não encontrado.`,
      );
    }

    const { file } = input;

    // 2. Detecta tipo pelo MIME
    const isImage = ALLOWED_IMAGE_MIME.has(file.mimetype);
    const isVideo = ALLOWED_VIDEO_MIME.has(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        `Tipo de arquivo não suportado: "${file.mimetype}". ` +
          'Envie imagens (JPEG, PNG, WebP) ou vídeos (MP4, MOV).',
      );
    }

    const mediaType: MediaType = isImage ? 'IMAGE' : 'VIDEO';

    // 3. Valida tamanho do arquivo
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException(
        `Imagem muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
          `Tamanho máximo: ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
      );
    }

    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      throw new BadRequestException(
        `Vídeo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
          `Tamanho máximo: ${MAX_VIDEO_BYTES / 1024 / 1024} MB.`,
      );
    }

    // 4. Verifica limite de mídias
    const currentCount = await this.mediaRepo.countByPropertyAndType(
      input.propertyId,
      mediaType,
    );

    const maxAllowed = isImage ? MAX_IMAGES : MAX_VIDEOS;
    if (currentCount >= maxAllowed) {
      throw new BadRequestException(
        `Limite de ${isImage ? 'imagens' : 'vídeos'} atingido ` +
          `(máximo: ${maxAllowed} por imóvel).`,
      );
    }

    // 5. Upload no Cloudinary
    const uploaded = await this.cloudinary.upload(file.buffer, {
      folder: `nexo/properties/${input.propertyId}`,
      resourceType: isImage ? 'image' : 'video',
    });

    // 6. Persiste no banco
    const media = await this.mediaRepo.create({
      propertyId: input.propertyId,
      type: mediaType,
      url: uploaded.url,
      publicId: uploaded.publicId,
      order: currentCount, // Novas mídias vão para o final da galeria
    });

    return media;
  }
}
