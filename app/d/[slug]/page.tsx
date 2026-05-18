import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { ShortLink, Mission } from "@/models";
import MissionGate from "@/components/mission/MissionGate";
import { trackEvent } from "@/lib/analytics";
import { headers } from "next/headers";
import { Link2 } from "lucide-react";

export default async function RedirectPage({ params }: { params: { slug: string } }) {
  await connectDB();
  const link = await ShortLink.findOne({ slug: params.slug, isActive: true }).lean();
  if (!link) notFound();

  const h = headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ua = h.get("user-agent") ?? "";

  await trackEvent({ resourceType: "link", resourceId: (link as any)._id.toString(), eventType: "view", ip, userAgent: ua });

  const mission = (link as any).missionId
    ? await Mission.findById((link as any).missionId).lean()
    : null;

  return (
    <main className="min-h-screen bg-surface px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="card p-8 text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white">{(link as any).title}</h1>
          <p className="text-slate-500 text-sm mt-1">{(link as any).clickCount} clicks</p>
        </div>
        <MissionGate
          resourceType="link"
          resourceId={(link as any)._id.toString()}
          slug={params.slug}
          mission={mission ? JSON.parse(JSON.stringify(mission)) : null}
          missionEnabled={(link as any).missionEnabled}
        />
      </div>
      <p className="text-center text-xs text-slate-700 mt-10">Created by Alrect & AI Gemini</p>
    </main>
  );
}
