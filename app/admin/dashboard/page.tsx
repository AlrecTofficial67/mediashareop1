"use client";
import { useEffect, useState } from "react";
import { Users, Files, Link2, BarChart3, Shield, LogOut, TrendingUp, Activity, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { setStats(d.data ?? {}); setLoading(false); })
      .catch(() => { setStats({}); setLoading(false); });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    document.cookie = "slx_admin=; Max-Age=0; path=/";
    toast.success("Logged out");
    router.push("/admin/login");
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const cards = [
    { label: "Total Users", value: stats?.users ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Premium Users", value: stats?.premiumUsers ?? 0, icon: Crown, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { label: "Files Hosted", value: stats?.files ?? 0, icon: Files, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { label: "Short Links", value: stats?.links ?? 0, icon: Link2, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Events (30d)", value: stats?.events ?? 0, icon: Activity, color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">MediaShareOP1</span>
              <span className="text-red-400 text-xs font-medium ml-2 px-1.5 py-0.5 rounded bg-red-500/10">ADMIN</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/5">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Platform statistics and management</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`card p-5 border ${c.border}`}>
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{(c.value ?? 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-surface-border flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-white text-sm">Recent Users</h2>
          </div>
          <div className="divide-y divide-surface-border/50">
            {(stats?.recentUsers ?? []).length === 0 ? (
              <p className="p-6 text-slate-500 text-sm text-center">No users yet</p>
            ) : (stats?.recentUsers ?? []).map((u: any) => (
              <div key={u._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {u.username?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{u.username}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span className={`badge text-xs px-2.5 py-1 rounded-full font-semibold ${u.role === "premium" ? "bg-yellow-500/15 text-yellow-400" : "bg-slate-700/50 text-slate-400"}`}>
                  {u.role}
                </span>
                <span className="text-xs text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <p className="text-center text-xs text-slate-700 pb-8">Created by Alrect & AI Gemini</p>
    </div>
  );
}
