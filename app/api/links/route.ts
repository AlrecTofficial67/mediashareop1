import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ShortLink, UserModel } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { generateSlug, sanitizeInput } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  targetUrl: z.string().url().max(2000),
  title: z.string().min(1).max(200),
  missionEnabled: z.boolean().optional().default(true),
  missionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    await connectDB();
    const user = await UserModel.findById(session.userId).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if ((user as any).role === "user" && (user as any).linksCreated >= (user as any).linkLimit) {
      return NextResponse.json({ error: "Link limit reached. Upgrade to premium." }, { status: 403 });
    }
    const slug = generateSlug();
    const link = await ShortLink.create({
      slug,
      targetUrl: parsed.data.targetUrl,
      title: sanitizeInput(parsed.data.title),
      creatorId: session.userId,
      missionEnabled: parsed.data.missionEnabled,
      missionId: parsed.data.missionId || undefined,
    });
    await UserModel.findByIdAndUpdate(session.userId, { $inc: { linksCreated: 1 } });
    return NextResponse.json({ success: true, slug: link.slug, url: `/d/${link.slug}` });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = getCurrentUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    await connectDB();
    const [items, total] = await Promise.all([
      ShortLink.find({ creatorId: session.userId, isActive: true })
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ShortLink.countDocuments({ creatorId: session.userId, isActive: true }),
    ]);
    return NextResponse.json({ success: true, data: { items, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
