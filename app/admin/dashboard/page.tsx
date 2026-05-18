"use client";
import { useEffect, useState } from "react";
import { Users, Files, Link2, BarChart3, Shield, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => {
        setStats(d.data ?? {});
        setLoading(false);
      })
      .catch(() => {
        setStats({});
        setLoading(false);
      });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    document.cookie = "slx_admin=; Max-Age=0; path=/";
    router.push("/admin/login");
    toast.success("Logged out");
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: "Total Users", value: stats?.users ?? 0, icon: Users },
    { label: "Premium Users", value: stats?.premiumUsers ?? 0, icon: Shield },
    { label: "Files Hosted", value: stats?.files ?? 0, icon: Files },
    { label: "Short Links", value: stats?.links ?? 0, icon: Link2 },
    { label: "Events (30d)", value: stats?.events ?? 0, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-surface-border bg-surface-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          <span className="font-bold text-white">MediaShareOP1 Admin</span>
        </div>
        <button onClick={handleLogout} className="btn-ghost text-sm text-red-400">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="card p-5">
              <c.icon className="w-4 h-4 text-brand-400 mb-3" />
              <div className="text-2xl font-bold text-white">{c.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      </main>
      <p className="text-center text-xs text-slate-700 pb-6">Created by Alrect & AI Gemini</p>
    </div>
  );
}
