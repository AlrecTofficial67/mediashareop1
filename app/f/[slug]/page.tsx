import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { FileRecord, Mission, Ad } from "@/models";
import MissionGate from "@/components/mission/MissionGate";
import { formatBytes, getFileIcon } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { headers } from "next/headers";
import { FileText, Download, Calendar, User, Eye } from "lucide-react";

const iconMap: Record<string, string> = {
  image: "🖼️", video: "🎬", audio: "🎵", pdf: "📄", word: "📝",
  excel: "📊", powerpoint: "📑", archive: "🗜️", code: "💻", file: "📁",
};

export default async function FilePage({ params }: { params: { slug: string } }) {
  await connectDB();
  const file = await FileRecord.findOne({ slug: params.slug, isActive: true })
    .populate("uploaderId", "username").lean();
  if (!file) notFound();

  const headersList = headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ua = headersList.get("user-agent") ?? "";

  await trackEvent({ resourceType: "file", resourceId: (file as any)._id.toString(), eventType: "view", ip, userAgent: ua });

  const mission = (file as any).missionId
    ? await Mission.findById((file as any).missionId).lean()
    : null;

  const ads = await Ad.find({ isActive: true, placement: { $in: ["top", "bottom"] } }).limit(2).lean();

  const icon = iconMap[getFileIcon((file as any).extension)] ?? "📁";
  const uploader = (file as any).uploaderId as any;

  return (
    <main className="min-h-screen bg-surface px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {ads.filter((a: any) => a.placement === "top").map((ad: any) => (
          <a key={ad._id} href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
            className="block mb-6 rounded-xl overflow-hidden border border-surface-border">
            {ad.imageUrl && <img src={ad.imageUrl} alt={ad.name} className="w-full h-16 object-cover" />}
          </a>
        ))}

        <div className="card p-8 text-center mb-6">
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="text-2xl font-bold text-white mb-1">{(file as any).title}</h1>
          {(file as any).description && <p className="text-slate-400 text-sm mb-4">{(file as any).description}</p>}

          <div className="grid grid-cols-2 gap-3 my-6 text-sm">
            {[
              { icon: FileText, label: "Size", value: formatBytes((file as any).fileSize) },
              { icon: FileText, label: "Type", value: (file as any).extension.toUpperCase() },
              { icon: User, label: "Uploader", value: uploader?.username ?? "Unknown" },
              { icon: Download, label: "Downloads", value: (file as any).downloadCount.toLocaleString() },
              { icon: Calendar, label: "Uploaded", value: new Date((file as any).createdAt).toLocaleDateString() },
              { icon: Eye, label: "Extension", value: `.${(file as any).extension}` },
            ].map((item) => (
              <div key={item.label} className="bg-surface rounded-xl p-3 text-left flex items-center gap-3">
                <item.icon className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <div className="text-slate-500 text-xs">{item.label}</div>
                  <div className="text-white font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <MissionGate
          resourceType="file"
          resourceId={(file as any)._id.toString()}
          slug={params.slug}
          mission={mission ? JSON.parse(JSON.stringify(mission)) : null}
          missionEnabled={(file as any).missionEnabled}
        />

        {ads.filter((a: any) => a.placement === "bottom").map((ad: any) => (
          <a key={ad._id} href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
            className="block mt-6 rounded-xl overflow-hidden border border-surface-border">
            {ad.imageUrl && <img src={ad.imageUrl} alt={ad.name} className="w-full h-16 object-cover" />}
          </a>
        ))}
      </div>
      <p className="text-center text-xs text-slate-700 mt-10">Created by Alrect & AI Gemini</p>
    </main>
  );
}
