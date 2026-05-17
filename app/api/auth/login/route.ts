import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models";
import { verifyPassword, signUserToken, setUserCookie } from "@/lib/auth";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
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
    await connectDB();
    const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() }).select("+password").lean();
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const valid = await verifyPassword(parsed.data.password, (user as any).password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (!(user as any).isActive) return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    const token = signUserToken((user as any)._id.toString(), (user as any).role);
    setUserCookie(token);
    return NextResponse.json({ success: true, user: { id: (user as any)._id, username: (user as any).username, role: (user as any).role } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
