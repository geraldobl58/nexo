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
 * CASO DE USO: SUSPENDER ANUNCIANTE
 *
 * Transição de status: ACTIVE → SUSPENDED
 *
 * REGRAS DE NEGÓCIO:
 * - O anunciante deve existir (caso contrário, lança 404).
 * - Apenas anunciantes com status ACTIVE podem ser suspensos.
 * - É obrigatório informar o motivo da suspensão.
 * - Registra a data da suspensão (suspendedAt).
 *
 * AUTORIZAÇÃO: operação exclusiva de administradores (validada no controller).
 */
@Injectable()
export class SuspendAdvertiserUseCase {
  constructor(
    @Inject(ADVERTISER_REPOSITORY)
    private readonly advertiserRepository: IAdvertiserRepository,
  ) {}

  async execute(id: string, reason: string): Promise<AdvertiserEntity> {
    const advertiser = await this.advertiserRepository.findById(id);

    if (!advertiser) {
      throw new NotFoundException(`Anunciante com id "${id}" não encontrado.`);
    }

    if (advertiser.status !== AdvertiserStatus.ACTIVE) {
      throw new BadRequestException(
        `Apenas anunciantes com status ACTIVE podem ser suspensos. ` +
          `Status atual: ${advertiser.status}.`,
      );
    }

    return this.advertiserRepository.update(id, {
      status: AdvertiserStatus.SUSPENDED,
      suspendedAt: new Date(),
      suspendReason: reason,
    });
  }
}
