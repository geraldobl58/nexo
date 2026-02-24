import { AuthUser } from '@/modules/auth/domain/entities/auth-user';
import {
  UserDTO,
  UserRepository,
} from '@/modules/auth/domain/repositories/user.repository';

export class MeUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(auth: AuthUser): Promise<UserDTO> {
    const email = auth.email?.trim() || `user-${auth.keycloakId}@local`;
    const name = auth.name?.trim() || `User ${email.split('@')[0]}`;

    return this.users.upsertFromAuth({
      keycloakId: auth.keycloakId,
      email,
      name,
    });
  }
}
