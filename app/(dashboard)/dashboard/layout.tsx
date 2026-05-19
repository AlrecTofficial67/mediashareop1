"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Upload, Link2, BarChart3, Menu, X, Home, Files, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const nav = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/dashboard/files", icon: Files, label: "My Files" },
  { href: "/dashboard/links", icon: Link2, label: "My Links" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/upload", icon: Upload, label: "Upload File" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={()=>setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-surface-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${open?"translate-x-0":"-translate-x-full"}`}>
        <div className="p-5 border-b border-surface-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">MediaShareOP1</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-1">Menu</p>
          {nav.map(item => (
            <Link key={item.href} href={item.href} onClick={()=>setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-surface-border">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col">
        <header className="sticky top-0 z-40 h-14 border-b border-surface-border bg-surface/80 backdrop-blur-sm flex items-center px-4 lg:px-6 gap-4">
          <button onClick={()=>setOpen(true)} className="lg:hidden text-slate-500 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link href="/upload" className="btn-primary text-sm py-2 px-4">
            <Upload className="w-3.5 h-3.5" /> Upload
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
        <footer className="border-t border-surface-border/50 py-4 text-center text-xs text-slate-700">Created by Alrect & AI Gemini</footer>
      </div>
    </div>
  );
}
