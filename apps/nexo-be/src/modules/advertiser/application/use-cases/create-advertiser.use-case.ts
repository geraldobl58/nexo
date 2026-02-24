import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';
import {
  ADVERTISER_REPOSITORY,
  CreateAdvertiserData,
  IAdvertiserRepository,
} from '../../domain/repositories/advertiser.repository';

/**
 * CASO DE USO: CRIAR ANUNCIANTE
 *
 * Registra um novo anunciante no sistema.
 *
 * REGRAS DE NEGÓCIO:
 * - O e-mail deve ser único no sistema.
 * - O anunciante começa sempre com status PENDING (aguardando aprovação).
 * - A aprovação é feita em outro use-case (ApproveAdvertiserUseCase).
 */
@Injectable()
export class CreateAdvertiserUseCase {
  constructor(
    @Inject(ADVERTISER_REPOSITORY)
    private readonly advertiserRepository: IAdvertiserRepository,
  ) {}

  async execute(data: CreateAdvertiserData): Promise<AdvertiserEntity> {
    // Valida unicidade do e-mail antes de tentar persistir
    const emailJaExiste = await this.advertiserRepository.emailExists(
      data.email,
    );

    if (emailJaExiste) {
      throw new ConflictException(
        `O e-mail "${data.email}" já está cadastrado.`,
      );
    }

    return this.advertiserRepository.create(data);
  }
}
