import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyUserToken, verifyAdminToken } from "@/lib/auth";

const PROTECTED_USER_ROUTES = ["/dashboard", "/upload", "/analytics"];
const PROTECTED_ADMIN_ROUTES = ["/admin/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    const adminToken = request.cookies.get("slx_admin")?.value;
    if (!adminToken || !verifyAdminToken(adminToken)) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (PROTECTED_USER_ROUTES.some((r) => pathname.startsWith(r))) {
    const userToken = request.cookies.get("slx_token")?.value;
    if (!userToken || !verifyUserToken(userToken)) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (AUTH_ROUTES.some((r) => pathname === r)) {
    const userToken = request.cookies.get("slx_token")?.value;
    if (userToken && verifyUserToken(userToken)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
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
