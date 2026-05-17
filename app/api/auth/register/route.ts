import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models";
import { hashPassword, signUserToken, setUserCookie } from "@/lib/auth";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateCheck = await checkLoginRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    await connectDB();
    const existing = await UserModel.findOne({
      $or: [{ email: parsed.data.email.toLowerCase() }, { username: parsed.data.username }],
    }).lean();
    if (existing) {
      return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
    }
    const hashed = await hashPassword(parsed.data.password);
    const user = await UserModel.create({
      username: sanitizeInput(parsed.data.username),
      email: parsed.data.email.toLowerCase(),
      password: hashed,
    });
    const token = signUserToken(user._id.toString(), user.role);
    setUserCookie(token);
    return NextResponse.json({ success: true, user: { id: user._id, username: user.username, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
