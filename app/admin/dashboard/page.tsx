"use client";
import { useEffect, useState } from "react";
import { Users, Files, Link2, BarChart3, Shield, LogOut, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => {
      if (!d.success) { router.push("/admin/login"); return; }
      setStats(d.data);
    });
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    document.cookie = "slx_admin=; Max-Age=0; path=/";
    router.push("/admin/login");
    toast.success("Logged out");
  }

  if (!stats) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Premium Users", value: stats.premiumUsers, icon: Shield, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Files Hosted", value: stats.files, icon: Files, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Short Links", value: stats.links, icon: Link2, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Events (30d)", value: stats.events, icon: BarChart3, color: "text-brand-400", bg: "bg-brand-500/10" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-surface-border bg-surface-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <span className="font-bold text-white">MediaShareOP1 Admin</span>
        </div>
        <button onClick={handleLogout} className="btn-ghost text-sm text-red-400 hover:text-red-300">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 text-sm">Platform statistics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="card p-5">
              <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{(c.value ?? 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="p-5 border-b border-surface-border">
            <h2 className="font-semibold text-white text-sm">Recent Users</h2>
          </div>
          <div className="divide-y divide-surface-border">
            {(stats.recentUsers ?? []).map((u: any) => (
              <div key={u._id} className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">
                  {u.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{u.username}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <span className={`badge text-xs ${u.role === "premium" ? "bg-yellow-500/10 text-yellow-400" : "bg-slate-700 text-slate-400"}`}>
                  {u.role}
                </span>
                <span className="text-xs text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <p className="text-center text-xs text-slate-700 pb-6">Created by Alrect & AI Gemini</p>
    </div>
  );
}
