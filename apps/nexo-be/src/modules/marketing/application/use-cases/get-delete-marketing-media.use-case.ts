import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEDIA_REPOSITORY,
  MediaRepository,
} from '../../domain/repositories/marketing-media.repository';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { MediaEntity } from '../../domain/entities/marketing-media.entity';

/**
 * USE CASE: LISTAR MÍDIAS DE UM IMÓVEL
 *
 * Retorna todas as mídias de um anúncio ordenadas por `order` ASC.
 * A primeira (order: 0) é a foto de capa.
 */
@Injectable()
export class GetMediaUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepo: MediaRepository,
  ) {}

  async execute(propertyId: string): Promise<MediaEntity[]> {
    return this.mediaRepo.findByPropertyId(propertyId);
  }
}

/**
 * USE CASE: DELETAR MÍDIA
 *
 * Remove o asset do Cloudinary e o registro do banco.
 * Ordem garantida: Cloudinary primeiro (evita registro órfão,
 * prefere arquivo órfão no Cloudinary a registro sem arquivo).
 */
@Injectable()
export class DeleteMediaUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepo: MediaRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(mediaId: string): Promise<void> {
    // 1. Busca o registro para obter o publicId
    const media = await this.mediaRepo.findById(mediaId);
    if (!media) {
      throw new NotFoundException(`Mídia com id "${mediaId}" não encontrada.`);
    }

    // 2. Deleta do Cloudinary
    await this.cloudinary.delete(
      media.publicId,
      media.type === 'IMAGE' ? 'image' : 'video',
    );

    // 3. Remove do banco
    await this.mediaRepo.delete(mediaId);
  }
}
