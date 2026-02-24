import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';
import { AdvertiserStatus } from '../../domain/enums/advertiser-status.enum';
import {
  ADVERTISER_REPOSITORY,
  IAdvertiserRepository,
} from '../../domain/repositories/advertiser.repository';

/**
 * CASO DE USO: APROVAR ANUNCIANTE
 *
 * Transição de status: PENDING → ACTIVE
 *
 * REGRAS DE NEGÓCIO:
 * - O anunciante deve existir (caso contrário, lança 404).
 * - Apenas anunciantes com status PENDING podem ser aprovados.
 * - Ao aprovar, registra a data de verificação (verifiedAt).
 * - isVerified é marcado como true.
 *
 * AUTORIZAÇÃO: operação exclusiva de administradores (validada no controller).
 */
@Injectable()
export class ApproveAdvertiserUseCase {
  constructor(
    @Inject(ADVERTISER_REPOSITORY)
    private readonly advertiserRepository: IAdvertiserRepository,
  ) {}

  async execute(id: string): Promise<AdvertiserEntity> {
    const advertiser = await this.advertiserRepository.findById(id);

    if (!advertiser) {
      throw new NotFoundException(`Anunciante com id "${id}" não encontrado.`);
    }

    if (advertiser.status !== AdvertiserStatus.PENDING) {
      throw new BadRequestException(
        `Apenas anunciantes com status PENDING podem ser aprovados. ` +
          `Status atual: ${advertiser.status}.`,
      );
    }

    return this.advertiserRepository.update(id, {
      status: AdvertiserStatus.ACTIVE,
      isVerified: true,
      verifiedAt: new Date(),
    });
  }
}
