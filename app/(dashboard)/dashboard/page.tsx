"use client";
import { useEffect, useState } from "react";
import { Upload, Link2, Download, BarChart3, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

interface Stats { files: number; links: number; totalDownloads: number; totalClicks: number; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/files/upload?limit=5").then(r => r.json()),
      fetch("/api/links?limit=5").then(r => r.json()),
    ]).then(([fd, ld]) => {
      const f = fd.data?.items ?? [];
      const l = ld.data?.items ?? [];
      setFiles(f);
      setLinks(l);
      setStats({
        files: fd.data?.total ?? 0,
        links: ld.data?.total ?? 0,
        totalDownloads: f.reduce((a: number, x: any) => a + x.downloadCount, 0),
        totalClicks: l.reduce((a: number, x: any) => a + x.clickCount, 0),
      });
    });
  }, []);

  const cards = [
    { label: "Total Files", value: stats?.files ?? 0, icon: Upload, color: "text-brand-400", bg: "bg-brand-500/10" },
    { label: "Short Links", value: stats?.links ?? 0, icon: Link2, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Downloads", value: stats?.totalDownloads ?? 0, icon: Download, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Link Clicks", value: stats?.totalClicks ?? 0, icon: BarChart3, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{c.value.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-5 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">Recent Files</h2>
            <Link href="/upload" className="btn-primary text-xs py-1.5 px-3"><Plus className="w-3 h-3" /> Upload</Link>
          </div>
          <div className="divide-y divide-surface-border">
            {files.length === 0 && <p className="p-5 text-slate-500 text-sm">No files yet.</p>}
            {files.map((f) => (
              <div key={f._id} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{f.title}</p>
                  <p className="text-xs text-slate-500">{f.downloadCount} downloads</p>
                </div>
                <Link href={`/f/${f.slug}`} className="text-slate-500 hover:text-brand-400 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="p-5 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">Recent Links</h2>
            <Link href="/dashboard/links" className="btn-secondary text-xs py-1.5 px-3"><Plus className="w-3 h-3" /> New</Link>
          </div>
          <div className="divide-y divide-surface-border">
            {links.length === 0 && <p className="p-5 text-slate-500 text-sm">No links yet.</p>}
            {links.map((l) => (
              <div key={l._id} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{l.title}</p>
                  <p className="text-xs text-slate-500">{l.clickCount} clicks</p>
                </div>
                <Link href={`/d/${l.slug}`} className="text-slate-500 hover:text-brand-400 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
