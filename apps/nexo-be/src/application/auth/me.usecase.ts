import { AuthUser } from '@/domain/auth/auth-user';
import { UserDTO, UserRepository } from '@/domain/user/user.repository';

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
