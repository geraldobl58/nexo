import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/panel"];

function parseUserCookie(
  value: string | undefined,
): Record<string, string> | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected) {
    const session = request.cookies.get("nexo-session");

    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  const userData = parseUserCookie(request.cookies.get("nexo-user")?.value);

  if (userData) {
    if (userData.name) requestHeaders.set("x-user-name", userData.name);
    if (userData.email) requestHeaders.set("x-user-email", userData.email);
    if (userData.role) requestHeaders.set("x-user-role", userData.role);
    if (userData.keycloakId)
      requestHeaders.set("x-user-id", userData.keycloakId);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/panel/:path*"],
};
