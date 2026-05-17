"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap, Upload, Link2, BarChart3, Users, ArrowRight, CheckCircle2, Lock, Globe } from "lucide-react";

const features = [
  { icon: Upload, title: "File Sharing", desc: "Upload and share files up to 2GB with instant download pages and automatic link generation." },
  { icon: Shield, title: "Mission Gate", desc: "Protect your links behind custom missions — tasks, verifications, and social follows." },
  { icon: Link2, title: "Smart Shortlinks", desc: "Generate branded short URLs with click tracking and redirect analytics." },
  { icon: BarChart3, title: "Analytics", desc: "Real-time insights on clicks, downloads, devices, browsers, and referrers." },
  { icon: Lock, title: "Anti-Bot System", desc: "Custom human verification, countdown timers, and interaction challenges." },
  { icon: Globe, title: "Premium System", desc: "Unlock unlimited uploads, analytics dashboard, and custom branding." },
];

const stats = [
  { label: "Files Hosted", value: "50K+" },
  { label: "Links Created", value: "200K+" },
  { label: "Downloads", value: "2M+" },
  { label: "Active Users", value: "15K+" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface overflow-hidden">
      <nav className="border-b border-surface-border/50 backdrop-blur-sm sticky top-0 z-50 bg-surface/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">SafelinkluX</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-24 pb-20 px-4">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6">
              <Zap className="w-3 h-3" /> Secure Modern File Sharing & Mission Link Platform
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
              Share Files.{" "}
              <span className="gradient-text">Gate Links.</span>
              <br />
              Grow Faster.
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Upload files, create shortlinks, and lock them behind missions. Earn follows, clicks, and completions — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-base px-8 py-3.5 glow">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/upload" className="btn-secondary text-base px-8 py-3.5">
                <Upload className="w-4 h-4" /> Quick Upload
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="card p-5 text-center">
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
            <p className="text-slate-400">Powerful tools for creators, marketers, and developers.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="card p-6 hover:border-brand-500/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <f.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 border-t border-surface-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Simple Pricing</h2>
            <p className="text-slate-400">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { name: "Free", price: "$0", period: "/mo", features: ["100MB storage", "10 shortlinks", "Basic analytics", "Mission system", "Ads shown"], highlight: false },
              { name: "Premium", price: "$9", period: "/mo", features: ["2GB storage", "Unlimited links", "Advanced analytics", "No ads", "Custom branding"], highlight: true },
            ].map((plan) => (
              <div key={plan.name} className={`card p-8 ${plan.highlight ? "border-brand-500/50 glow" : ""}`}>
                {plan.highlight && <span className="badge bg-brand-500/20 text-brand-400 mb-4">Most Popular</span>}
                <div className="text-2xl font-bold text-white">{plan.name}</div>
                <div className="mt-2 mb-6">
                  <span className="text-4xl font-extrabold gradient-text">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={plan.highlight ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center"}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-border/50 py-10 px-4 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-slate-300">SafelinkluX</span>
        </div>
        <p>© {new Date().getFullYear()} SafelinkluX. All rights reserved.</p>
        <p className="mt-1 text-xs text-slate-600">Created by Alrect & AI Gemini</p>
      </footer>
    </main>
  );
}
