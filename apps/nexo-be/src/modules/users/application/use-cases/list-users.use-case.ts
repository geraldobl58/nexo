import { Inject, Injectable } from '@nestjs/common';

import { UserEntity } from '@/modules/identity/domain/entities/user.entity';
import {
  IUserRepository,
  PaginatedResult,
  UserFilters,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';

/**
 * CASO DE USO: LISTAR USUÁRIOS INTERNOS
 *
 * Retorna a lista paginada de administradores, moderadores e suporte.
 * Útil para o painel de gestão de equipe.
 */
@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(filters: UserFilters): Promise<PaginatedResult<UserEntity>> {
    return this.userRepository.findMany(filters);
  }
}
