import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/panel"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    const session = request.cookies.get("nexo-session");

    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
