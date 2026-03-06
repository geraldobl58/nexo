import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applyUserHeaders, parseUserCookie } from "@/lib/session";

const protectedRoutes = ["/panel"];

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
  const user = parseUserCookie(request.cookies.get("nexo-user")?.value);

  if (user) {
    applyUserHeaders(requestHeaders, user);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/panel/:path*"],
};
