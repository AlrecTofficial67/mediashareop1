"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Upload, Link2, BarChart3, Settings, LogOut, Menu, X, Home, Files } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/dashboard/files", icon: Files, label: "My Files" },
  { href: "/dashboard/links", icon: Link2, label: "My Links" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/upload", icon: Upload, label: "Upload File" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-surface-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">MediaShareOP1</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-surface-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm font-medium w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-14 border-b border-surface-border bg-surface-card/50 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-white"><Menu className="w-5 h-5" /></button>
          <div className="flex-1" />
          <Link href="/upload" className="btn-primary text-sm py-2"><Upload className="w-3.5 h-3.5" /> Upload</Link>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
        <footer className="border-t border-surface-border/50 p-4 text-center text-xs text-slate-600">Created by Alrect & AI Gemini</footer>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
