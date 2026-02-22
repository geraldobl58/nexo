"use server";

import { cookies } from "next/headers";

export interface SessionUserData {
  id?: string;
  keycloakId?: string;
  name: string;
  email: string;
  role?: string;
}

export async function setAuthCookie(userData?: SessionUserData) {
  const cookieStore = cookies();
  const maxAge = 60 * 60 * 24;
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set("nexo-session", "1", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  if (userData) {
    const encoded = Buffer.from(JSON.stringify(userData)).toString("base64");
    cookieStore.set("nexo-user", encoded, {
      httpOnly: false,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
  }
}

export async function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete("nexo-session");
  cookieStore.delete("nexo-user");
}
