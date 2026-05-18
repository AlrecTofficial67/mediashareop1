import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FileRecord } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { generateSlug, getFileExtension, sanitizeInput } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  fileKey: z.string().min(1),
  fileUrl: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  originalName: z.string(),
  missionEnabled: z.boolean().optional().default(true),
  missionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    await connectDB();
    const slug = generateSlug();
    const extension = getFileExtension(parsed.data.originalName);
    const file = await FileRecord.create({
      slug,
      title: sanitizeInput(parsed.data.title),
      description: parsed.data.description ? sanitizeInput(parsed.data.description) : undefined,
      fileKey: parsed.data.fileKey,
      fileUrl: parsed.data.fileUrl,
      fileSize: parsed.data.fileSize,
      mimeType: parsed.data.mimeType,
      extension,
      originalName: sanitizeInput(parsed.data.originalName),
      uploaderId: session.userId,
      missionEnabled: parsed.data.missionEnabled,
      missionId: parsed.data.missionId || undefined,
    });
    return NextResponse.json({ success: true, slug: file.slug, url: `/f/${file.slug}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    await connectDB();
    const [items, total] = await Promise.all([
      FileRecord.find({ uploaderId: session.userId, isActive: true })
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      FileRecord.countDocuments({ uploaderId: session.userId, isActive: true }),
    ]);
    return NextResponse.json({ success: true, data: { items, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
