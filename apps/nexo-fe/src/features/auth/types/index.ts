export interface User {
  id: string;
  keycloakId: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  timezone: string | null;
  language: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
