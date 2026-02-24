export type AuthUser = {
  keycloakId: string;
  email?: string;
  name?: string;
  roles: string[];
};
