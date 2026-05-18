"use client";
import { useEffect, useState } from "react";
import { Link2, ExternalLink, Plus, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ targetUrl: "", title: "" });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/links").then(r => r.json())
      .then(d => { setLinks(d.data?.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, missionEnabled: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Link created!");
      setLinks(prev => [data, ...prev]);
      setForm({ targetUrl: "", title: "" });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Links</h1>
          <p className="text-slate-400 text-sm mt-1">{links.length} links created</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Link
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4 text-sm">Create Short Link</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input className="input" placeholder="Title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
            <input className="input" type="url" placeholder="https://destination.com" value={form.targetUrl}
              onChange={e => setForm({ ...form, targetUrl: e.target.value })} required />
            <button type="submit" className="btn-primary w-full justify-center" disabled={creating}>
              {creating ? "Creating..." : "Create Link"}
            </button>
          </form>
        </div>
      )}

      <div className="card divide-y divide-surface-border">
        {loading && <p className="p-6 text-slate-500 text-sm">Loading...</p>}
        {!loading && links.length === 0 && (
          <div className="p-12 text-center">
            <Link2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No links yet</p>
          </div>
        )}
        {links.map((l) => (
          <div key={l._id} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{l.title}</p>
              <p className="text-xs text-slate-500">{l.clickCount} clicks</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/d/${l.slug}`); toast.success("Copied!"); }}
              className="text-slate-500 hover:text-brand-400 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <a href={`/d/${l.slug}`} target="_blank" className="text-slate-500 hover:text-brand-400 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
