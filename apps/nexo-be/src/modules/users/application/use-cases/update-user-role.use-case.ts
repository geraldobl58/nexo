import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  UserEntity,
  UserRole,
} from '@/modules/identity/domain/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';

/**
 * CASO DE USO: ATUALIZAR ROLE DO USUÁRIO
 *
 * Altera o papel (role) de um usuário interno.
 *
 * REGRAS DE NEGÓCIO:
 * - O usuário deve existir (404 caso contrário).
 * - Não é permitido rebaixar o único ADMIN do sistema
 *   para evitar ficar sem administrador.
 */
@Injectable()
export class UpdateUserRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, role: UserRole): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuário com id "${id}" não encontrado.`);
    }

    // Protege contra remoção do último ADMIN
    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      const { data: admins } = await this.userRepository.findMany({
        role: 'ADMIN',
        isActive: true,
        limit: 2,
      });

      if (admins.length <= 1) {
        throw new BadRequestException(
          'Não é possível remover o único administrador do sistema.',
        );
      }
    }

    return this.userRepository.update(id, { role });
  }
}
