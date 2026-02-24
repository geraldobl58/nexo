import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UserEntity } from '@/modules/identity/domain/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';

/**
 * CASO DE USO: BUSCAR USUÁRIO POR ID
 *
 * Retorna os dados de um usuário interno pelo UUID.
 * Lança 404 se não encontrado.
 */
@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuário com id "${id}" não encontrado.`);
    }

    return user;
  }
}
