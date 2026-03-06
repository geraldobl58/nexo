export type UserRole = 'ADMIN' | 'MODERATOR' | 'SUPPORT';

export interface UserEntity {
  id: string;
  keycloakId: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  timezone: string | null;
  language: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
