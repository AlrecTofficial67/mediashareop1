"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, Loader2, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatBytes } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"file" | "link">("file");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({ title: "", description: "", missionEnabled: true });
  const [linkForm, setLinkForm] = useState({ targetUrl: "", title: "", missionEnabled: true });

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setForm(p => ({ ...p, title: p.title || f.name.replace(/\.[^.]+$/, "") })); }
  }, []);

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.error("Select a file first"); return; }
    setUploading(true);
    setProgress(10);
    try {
      const fd = new FormData();
      fd.append("file", file);
      setProgress(30);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      setProgress(70);
      if (!upRes.ok) {
        const err = await upRes.json();
        throw new Error(err.error ?? "Upload failed");
      }
      const upData = await upRes.json();
      setProgress(85);
      const res = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title || file.name,
          description: form.description,
          fileKey: upData.key,
          fileUrl: upData.url,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          originalName: file.name,
          missionEnabled: form.missionEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProgress(100);
      toast.success("File uploaded!");
      router.push(`/f/${data.slug}`);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  async function handleLinkCreate(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Link created!");
      router.push(`/d/${data.slug}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create</h1>
          <p className="text-slate-400 text-sm mt-1">Upload a file or shorten a link</p>
        </div>
        <div className="flex gap-2 p-1 bg-surface-card border border-surface-border rounded-xl mb-6">
          {[{ v: "file", icon: Upload, label: "Upload File" }, { v: "link", icon: Link2, label: "Shorten Link" }].map((t) => (
            <button key={t.v} onClick={() => setMode(t.v as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === t.v ? "bg-brand-500 text-white" : "text-slate-400 hover:text-white"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        {mode === "file" ? (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)} onDrop={onDrop}
              onClick={() => !file && document.getElementById("file-input")?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragging ? "border-brand-500 bg-brand-500/5" : "border-surface-border hover:border-brand-500/50"}`}>
              <input id="file-input" type="file" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); setForm(p => ({ ...p, title: p.title || f.name.replace(/\.[^.]+$/, "") })); }
              }} />
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <FileText className="w-8 h-8 text-brand-400" />
                    <div><p className="text-white font-medium text-sm">{file.name}</p><p className="text-slate-500 text-xs">{formatBytes(file.size)}</p></div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0); }} className="text-slate-500 hover:text-red-400 p-1"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">Drop file here or click to browse</p>
                  <p className="text-slate-500 text-sm mt-1">Max 4MB per file</p>
                </>
              )}
            </div>
            {progress > 0 && (
              <div className="w-full bg-surface-border rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
            <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="input resize-none" rows={3} placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setForm({ ...form, missionEnabled: !form.missionEnabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.missionEnabled ? "bg-brand-500" : "bg-surface-border"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.missionEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-slate-300">Enable mission gate</span>
            </label>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={uploading || !file}>
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {progress}%...</> : "Upload File"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLinkCreate} className="space-y-4">
            <input className="input" placeholder="Title" value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} required />
            <input className="input" type="url" placeholder="https://example.com" value={linkForm.targetUrl} onChange={(e) => setLinkForm({ ...linkForm, targetUrl: e.target.value })} required />
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setLinkForm({ ...linkForm, missionEnabled: !linkForm.missionEnabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${linkForm.missionEnabled ? "bg-brand-500" : "bg-surface-border"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${linkForm.missionEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-slate-300">Enable mission gate</span>
            </label>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Link"}
            </button>
          </form>
        )}
      </div>
      <p className="text-center text-xs text-slate-700 mt-10">Created by Alrect & AI Gemini</p>
    </div>
  );
}
