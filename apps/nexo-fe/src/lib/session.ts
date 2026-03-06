export interface SessionUser {
  name?: string;
  email?: string;
  role?: string;
  keycloakId?: string;
}

export function parseUserCookie(value: string | undefined): SessionUser | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export function applyUserHeaders(headers: Headers, user: SessionUser): void {
  if (user.name) headers.set("x-user-name", user.name);
  if (user.email) headers.set("x-user-email", user.email);
  if (user.role) headers.set("x-user-role", user.role);
  if (user.keycloakId) headers.set("x-user-id", user.keycloakId);
}
