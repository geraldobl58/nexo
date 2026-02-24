import { Inject, Injectable } from '@nestjs/common';

import {
  AdvertiserFilters,
  ADVERTISER_REPOSITORY,
  IAdvertiserRepository,
  PaginatedResult,
} from '../../domain/repositories/advertiser.repository';
import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';

/**
 * CASO DE USO: LISTAR ANUNCIANTES
 *
 * Retorna uma lista paginada de anunciantes com filtros opcionais.
 * Útil para o painel administrativo e para busca pública de anunciantes.
 *
 * FILTROS DISPONÍVEIS:
 * - type     → AGENCY | BROKER | OWNER | DEVELOPER
 * - status   → PENDING | ACTIVE | SUSPENDED | BLOCKED
 * - city     → filtro por cidade
 * - state    → filtro por estado (UF)
 * - isVerified → apenas verificados ou não verificados
 * - search   → texto livre (nome, empresa, e-mail)
 * - page / limit → paginação
 */
@Injectable()
export class GetAdvertisersUseCase {
  constructor(
    @Inject(ADVERTISER_REPOSITORY)
    private readonly advertiserRepository: IAdvertiserRepository,
  ) {}

  async execute(
    filters: AdvertiserFilters,
  ): Promise<PaginatedResult<AdvertiserEntity>> {
    return this.advertiserRepository.findMany(filters);
  }
}
