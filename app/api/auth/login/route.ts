import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models";
import { verifyPassword, signUserToken, setUserCookie } from "@/lib/auth";
import { getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    
    const uri = process.env.MONGODB_URI;
    if (!uri) return NextResponse.json({ error: "No MONGODB_URI" }, { status: 500 });
    
    await connectDB();
    const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() }).select("+password").lean();
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const valid = await verifyPassword(parsed.data.password, (user as any).password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const token = signUserToken((user as any)._id.toString(), (user as any).role);
    setUserCookie(token);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
