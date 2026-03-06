import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AuthUser } from '@/modules/auth/domain/entities/auth-user';
import {
  IdentityUserRepository,
  IDENTITY_USER_REPOSITORY,
} from '../../domain/repositories/user.repository';
import { UserEntity, UserRole } from '../../domain/entities/user.entity';

function mapRole(roles: string[]): UserRole {
  const upper = roles.map((r) => r.toUpperCase());
  if (upper.includes('ADMIN')) return 'ADMIN';
  if (upper.includes('MODERATOR')) return 'MODERATOR';
  return 'SUPPORT';
}

@Injectable()
export class SyncUserUseCase {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly users: IdentityUserRepository,
  ) {}

  async execute(auth: AuthUser): Promise<UserEntity> {
    const email =
      auth.email?.trim() || `user-${auth.keycloakId}@keycloak.local`;
    const name = auth.name?.trim() || email.split('@')[0];
    const role = mapRole(auth.roles);

    try {
      return await this.users.upsertUser({
        keycloakId: auth.keycloakId,
        email,
        name,
        role,
      });
    } catch (err: unknown) {
      // Prisma unique constraint violation on email (P2002)
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `Email "${email}" already belongs to a different account. ` +
            `Contact support if you believe this is an error.`,
        );
      }
      throw err;
    }
  }
}
