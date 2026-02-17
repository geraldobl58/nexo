export interface UserRepository {
  upsertFromAuth(data: {
    keycloakId: string;
    email: string;
    name: string;
  }): Promise<UserDTO>;
}

export type UserDTO = {
  id: string;
  keycloakId: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
};
