import { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function checkLoginRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  return { allowed: true };
}

export async function checkUploadRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  return { allowed: true };
}

export async function checkApiRateLimit(ip: string): Promise<{ allowed: boolean }> {
  return { allowed: true };
}

export async function checkMissionRateLimit(ip: string): Promise<{ allowed: boolean }> {
  return { allowed: true };
}
