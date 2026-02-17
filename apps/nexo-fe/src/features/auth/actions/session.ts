"use server";

import { cookies } from "next/headers";

export async function setAuthCookie() {
  cookies().set("nexo-session", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearAuthCookie() {
  cookies().delete("nexo-session");
}
