import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Mission, FileRecord, ShortLink } from "@/models";
import { trackEvent } from "@/lib/analytics";
import { checkMissionRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateMissionToken } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  resourceType: z.enum(["file", "link"]),
  slug: z.string().min(1),
  token: z.string().min(1),
  completedTasks: z.array(z.string()),
  humanVerified: z.boolean(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateCheck = await checkMissionRateLimit(ip);
  if (!rateCheck.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { resourceType, slug, token, completedTasks, humanVerified } = parsed.data;
    if (!humanVerified) return NextResponse.json({ error: "Human verification required" }, { status: 400 });

    await connectDB();

    let resource: any;
    if (resourceType === "file") {
      resource = await FileRecord.findOne({ slug, isActive: true }).lean();
    } else {
      resource = await ShortLink.findOne({ slug, isActive: true }).lean();
    }
    if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

    const resourceId = resource._id.toString();
    if (!validateMissionToken(token, resourceId)) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 403 });
    }

    if (resource.missionEnabled && resource.missionId) {
      const mission = await Mission.findById(resource.missionId).lean();
      if (mission) {
        const requiredTasks = (mission as any).tasks.filter((t: any) => t.required).map((t: any) => t._id.toString());
        const allCompleted = requiredTasks.every((id: string) => completedTasks.includes(id));
        if (!allCompleted) return NextResponse.json({ error: "Complete all required tasks first" }, { status: 400 });
      }
    }

    await trackEvent({ resourceType, resourceId, eventType: "mission_complete", ip, userAgent: req.headers.get("user-agent") ?? undefined });

    const accessToken = Buffer.from(`${resourceId}:${ip}:${Date.now()}:verified`).toString("base64url");

    if (resourceType === "file") {
      await FileRecord.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } });
      return NextResponse.json({ success: true, redirectUrl: (resource as any).fileUrl, accessToken });
    } else {
      await ShortLink.findByIdAndUpdate(resourceId, { $inc: { clickCount: 1 } });
      return NextResponse.json({ success: true, redirectUrl: (resource as any).targetUrl, accessToken });
    }
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
