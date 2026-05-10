import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth")) return false;
  if (pathname.startsWith("/api/health")) return false;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/analyze/")) return true;
  if (pathname.startsWith("/configure/")) return true;
  if (pathname.startsWith("/result/")) return true;
  return false;
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }
  if (!req.auth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
