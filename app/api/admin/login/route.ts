import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, setAdminCookie } from "@/lib/auth";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateCheck = await checkLoginRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: `Too many attempts. Retry in ${rateCheck.retryAfter}s` }, { status: 429 });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!adminUser || !adminPass) return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    if (parsed.data.username !== adminUser || parsed.data.password !== adminPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = signAdminToken("admin");
    setAdminCookie(token);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
