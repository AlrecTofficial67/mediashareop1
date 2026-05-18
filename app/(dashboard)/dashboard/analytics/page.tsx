"use client";
import { useEffect, useState } from "react";
import { BarChart3, Eye, Download, MousePointer } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(d => setStats(d.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Track your files and links performance</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Views", value: stats?.views ?? 0, icon: Eye, color: "text-brand-400" },
          { label: "Downloads", value: stats?.downloads ?? 0, icon: Download, color: "text-green-400" },
          { label: "Link Clicks", value: stats?.clicks ?? 0, icon: MousePointer, color: "text-purple-400" },
          { label: "Missions Done", value: stats?.missions ?? 0, icon: BarChart3, color: "text-orange-400" },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <c.icon className={`w-4 h-4 ${c.color} mb-3`} />
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="card p-8 text-center">
        <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Detailed analytics coming soon</p>
      </div>
    </div>
  );
}
