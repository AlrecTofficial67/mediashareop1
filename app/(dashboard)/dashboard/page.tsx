"use client";
import { useEffect, useState } from "react";
import { Upload, Link2, Download, BarChart3, ArrowUpRight, Plus, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [stats, setStats] = useState({ files: 0, links: 0, downloads: 0, clicks: 0 });

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
        downloads: f.reduce((a: number, x: any) => a + (x.downloadCount ?? 0), 0),
        clicks: l.reduce((a: number, x: any) => a + (x.clickCount ?? 0), 0),
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Files", value: stats.files, icon: Upload, color: "from-brand-500 to-blue-500", bg: "bg-brand-500/10" },
    { label: "Short Links", value: stats.links, icon: Link2, color: "from-purple-500 to-pink-500", bg: "bg-purple-500/10" },
    { label: "Downloads", value: stats.downloads, icon: Download, color: "from-green-500 to-emerald-500", bg: "bg-green-500/10" },
    { label: "Link Clicks", value: stats.clicks, icon: BarChart3, color: "from-orange-500 to-amber-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-slate-500 text-sm">Welcome back 👋</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Dashboard</h1>
        </div>
        <Link href="/upload" className="btn-primary text-sm gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Create
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card p-5 relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{c.value.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-brand-400" />
              <h2 className="font-semibold text-white text-sm">Recent Files</h2>
            </div>
            <Link href="/upload" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Upload
            </Link>
          </div>
          <div className="divide-y divide-surface-border/50">
            {files.length === 0 ? (
              <div className="p-8 text-center">
                <Upload className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No files yet</p>
                <Link href="/upload" className="text-brand-400 text-xs hover:text-brand-300 mt-1 inline-block">Upload your first file →</Link>
              </div>
            ) : files.map((f) => (
              <div key={f._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                  <Upload className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{f.title}</p>
                  <p className="text-xs text-slate-600">{f.downloadCount ?? 0} downloads</p>
                </div>
                <Link href={`/f/${f.slug}`} className="text-slate-600 hover:text-brand-400 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-purple-400" />
              <h2 className="font-semibold text-white text-sm">Recent Links</h2>
            </div>
            <Link href="/dashboard/links" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <Plus className="w-3 h-3" /> New
            </Link>
          </div>
          <div className="divide-y divide-surface-border/50">
            {links.length === 0 ? (
              <div className="p-8 text-center">
                <Link2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No links yet</p>
                <Link href="/dashboard/links" className="text-brand-400 text-xs hover:text-brand-300 mt-1 inline-block">Create your first link →</Link>
              </div>
            ) : links.map((l) => (
              <div key={l._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Link2 className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{l.title}</p>
                  <p className="text-xs text-slate-600">{l.clickCount ?? 0} clicks</p>
                </div>
                <Link href={`/d/${l.slug}`} className="text-slate-600 hover:text-brand-400 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-r from-brand-500/10 to-cyan-500/5 border-brand-500/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Upgrade to Premium</p>
            <p className="text-slate-400 text-xs mt-0.5">Unlock unlimited uploads, 2GB storage, and advanced analytics</p>
          </div>
          <button className="btn-primary text-xs py-2 px-4 shrink-0">Upgrade</button>
        </div>
      </div>
    </div>
  );
}
