import { UserEntity, UserRole } from '../entities/user.entity';

export const IDENTITY_USER_REPOSITORY = 'IDENTITY_USER_REPOSITORY';

export interface UpsertUserData {
  keycloakId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface IdentityUserRepository {
  upsertUser(data: UpsertUserData): Promise<UserEntity>;
}
