import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FileRecord, UserModel } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { generateSlug, getFileExtension, sanitizeInput, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_FREE, MAX_FILE_SIZE_PREMIUM } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  fileKey: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  originalName: z.string(),
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

    const { title, description, fileKey, fileUrl, fileSize, mimeType, originalName, missionEnabled, missionId } = parsed.data;

    await connectDB();
    const user = await UserModel.findById(session.userId).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const maxSize = (user as any).role === "premium" ? MAX_FILE_SIZE_PREMIUM : MAX_FILE_SIZE_FREE;
    if (fileSize > maxSize) return NextResponse.json({ error: "File too large for your plan" }, { status: 413 });

    const extension = getFileExtension(originalName);
    const slug = generateSlug();

    const file = await FileRecord.create({
      slug,
      title: sanitizeInput(title),
      description: description ? sanitizeInput(description) : undefined,
      fileKey,
      fileUrl,
      fileSize,
      mimeType,
      extension,
      originalName: sanitizeInput(originalName),
      uploaderId: session.userId,
      missionEnabled,
      missionId: missionId || undefined,
    });

    return NextResponse.json({ success: true, slug: file.slug, url: `/f/${file.slug}` });
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
    const skip = (page - 1) * limit;

    await connectDB();
    const [items, total] = await Promise.all([
      FileRecord.find({ uploaderId: session.userId, isActive: true })
        .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FileRecord.countDocuments({ uploaderId: session.userId, isActive: true }),
    ]);

    return NextResponse.json({ success: true, data: { items, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
