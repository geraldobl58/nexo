"use server";

import { User } from "../types";

export async function syncMeAction(token: string): Promise<User> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error("API_URL não configurada no servidor");
  }

  const res = await fetch(`${apiUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Falha ao sincronizar usuário: ${res.status}`);
  }

  return res.json();
}
