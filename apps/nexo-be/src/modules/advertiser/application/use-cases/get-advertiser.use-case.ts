import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';
import {
  ADVERTISER_REPOSITORY,
  IAdvertiserRepository,
} from '../../domain/repositories/advertiser.repository';

/**
 * CASO DE USO: BUSCAR ANUNCIANTE POR ID
 *
 * Retorna os dados públicos de um anunciante específico.
 *
 * REGRAS DE NEGÓCIO:
 * - O anunciante deve existir (caso contrário, lança 404).
 */
@Injectable()
export class GetAdvertiserUseCase {
  constructor(
    @Inject(ADVERTISER_REPOSITORY)
    private readonly advertiserRepository: IAdvertiserRepository,
  ) {}

  async execute(id: string): Promise<AdvertiserEntity> {
    const advertiser = await this.advertiserRepository.findById(id);

    if (!advertiser) {
      throw new NotFoundException(`Anunciante com id "${id}" não encontrado.`);
    }

    return advertiser;
  }
}
