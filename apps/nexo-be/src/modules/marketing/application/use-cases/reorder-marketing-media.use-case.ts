import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  MEDIA_REPOSITORY,
  MediaOrderItem,
  MediaRepository,
} from '../../domain/repositories/marketing-media.repository';

export interface ReorderMediaInput {
  propertyId: string;
  /** Lista com o novo order de cada mídia */
  items: MediaOrderItem[];
}

/**
 * USE CASE: REORDENAR MÍDIAS
 *
 * Recebe um array de { id, order } e persiste a nova ordenação
 * em uma única transação.
 *
 * Regras:
 *  - Os IDs devem pertencer ao imóvel informado
 *  - Os valores de `order` devem ser únicos (sem duplicatas)
 *  - `order` deve ser inteiro >= 0
 */
@Injectable()
export class ReorderMediaUseCase {
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepo: MediaRepository,
  ) {}

  async execute(input: ReorderMediaInput): Promise<void> {
    const { propertyId, items } = input;

    if (!items.length) return;

    // Valida valores de order
    const orders = items.map((i) => i.order);
    const hasNegative = orders.some((o) => o < 0 || !Number.isInteger(o));
    if (hasNegative) {
      throw new BadRequestException(
        'Os valores de "order" devem ser inteiros maiores ou iguais a zero.',
      );
    }

    const hasDuplicates = new Set(orders).size !== orders.length;
    if (hasDuplicates) {
      throw new BadRequestException(
        'Valores de "order" duplicados. Cada mídia deve ter uma posição única.',
      );
    }

    // Verifica se todos os IDs pertencem ao imóvel
    const existingMedia = await this.mediaRepo.findByPropertyId(propertyId);
    const existingIds = new Set(existingMedia.map((m) => m.id));

    const foreignId = items.find((i) => !existingIds.has(i.id));
    if (foreignId) {
      throw new BadRequestException(
        `Mídia "${foreignId.id}" não pertence ao imóvel "${propertyId}".`,
      );
    }

    await this.mediaRepo.reorder(items);
  }
}
