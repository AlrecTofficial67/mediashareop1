import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel, FileRecord, ShortLink, AnalyticsEvent } from "@/models";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const [users, files, links, events] = await Promise.all([
      UserModel.countDocuments(),
      FileRecord.countDocuments({ isActive: true }),
      ShortLink.countDocuments({ isActive: true }),
      AnalyticsEvent.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
    ]);
    const premiumUsers = await UserModel.countDocuments({ role: "premium" });
    const recentUsers = await UserModel.find().sort({ createdAt: -1 }).limit(5).select("username email role createdAt").lean();
    return NextResponse.json({ success: true, data: { users, files, links, events, premiumUsers, recentUsers } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
