import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { JwtPayload, AdminJwtPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signUserToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function signAdminToken(adminId: string): string {
  return jwt.sign({ adminId, role: "admin" }, ADMIN_JWT_SECRET, { expiresIn: "4h" });
}

export function verifyUserToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function setUserCookie(token: string) {
  cookies().set("slx_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export function setAdminCookie(token: string) {
  cookies().set("slx_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 4,
    path: "/",
  });
}

export function clearUserCookie() {
  cookies().set("slx_token", "", { maxAge: 0, path: "/" });
}

export function clearAdminCookie() {
  cookies().set("slx_admin", "", { maxAge: 0, path: "/" });
}

export function getCurrentUser(): JwtPayload | null {
  const token = cookies().get("slx_token")?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export function getCurrentAdmin(): AdminJwtPayload | null {
  const token = cookies().get("slx_admin")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
