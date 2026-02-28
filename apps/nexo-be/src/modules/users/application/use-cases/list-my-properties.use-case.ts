import { Inject, Injectable } from '@nestjs/common';

import {
  IUserRepository,
  MyPropertiesFilters,
  PaginatedResult,
  PropertySummaryEntity,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';

/**
 * CASO DE USO: LISTAR MEUS IMÓVEIS (ADMIN)
 *
 * Retorna a lista paginada de imóveis cadastrados pelo usuário admin logado.
 * Útil para que cada membro da equipe veja apenas o que ele mesmo cadastrou.
 */
@Injectable()
export class ListMyPropertiesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    filters: MyPropertiesFilters,
  ): Promise<PaginatedResult<PropertySummaryEntity>> {
    return this.userRepository.findMyProperties(userId, filters);
  }
}
