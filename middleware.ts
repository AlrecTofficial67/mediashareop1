import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ADMIN_ROUTES = ["/admin/dashboard"];
const PROTECTED_USER_ROUTES = ["/dashboard", "/upload", "/analytics"];
const AUTH_ROUTES = ["/login", "/register"];

function verifyTokenSimple(token: string, secret: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    const adminToken = request.cookies.get("slx_admin")?.value;
    if (!adminToken || !verifyTokenSimple(adminToken, "")) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (PROTECTED_USER_ROUTES.some((r) => pathname.startsWith(r))) {
    const userToken = request.cookies.get("slx_token")?.value;
    if (!userToken || !verifyTokenSimple(userToken, "")) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (AUTH_ROUTES.some((r) => pathname === r)) {
    const userToken = request.cookies.get("slx_token")?.value;
    if (userToken && verifyTokenSimple(userToken, "")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/analytics/:path*",
    "/admin/dashboard/:path*",
    "/login",
    "/register",
  ],
};
