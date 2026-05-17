import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

const loginLimiter = new RateLimiterMemory({ points: 5, duration: 60 * 15 });
const uploadLimiter = new RateLimiterMemory({ points: 10, duration: 60 * 60 });
const apiLimiter = new RateLimiterMemory({ points: 100, duration: 60 });
const missionLimiter = new RateLimiterMemory({ points: 20, duration: 60 });

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function checkLoginRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    await loginLimiter.consume(ip);
    return { allowed: true };
  } catch (e: any) {
    return { allowed: false, retryAfter: Math.ceil(e.msBeforeNext / 1000) };
  }
}

export async function checkUploadRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    await uploadLimiter.consume(ip);
    return { allowed: true };
  } catch (e: any) {
    return { allowed: false, retryAfter: Math.ceil(e.msBeforeNext / 1000) };
  }
}

export async function checkApiRateLimit(ip: string): Promise<{ allowed: boolean }> {
  try {
    await apiLimiter.consume(ip);
    return { allowed: true };
  } catch {
    return { allowed: false };
  }
}

export async function checkMissionRateLimit(ip: string): Promise<{ allowed: boolean }> {
  try {
    await missionLimiter.consume(ip);
    return { allowed: true };
  } catch {
    return { allowed: false };
  }
}
