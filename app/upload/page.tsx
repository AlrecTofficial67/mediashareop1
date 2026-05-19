"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, Loader2, Link2, Shield } from "lucide-react";
import toast from "react-hot-toast";

function fmt(b: number) {
  if (!b) return "0 B";
  const k = 1024, s = ["B","KB","MB","GB"], i = Math.floor(Math.log(b)/Math.log(k));
  return (b/Math.pow(k,i)).toFixed(1)+" "+s[i];
}

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"file"|"link">("file");
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File|null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [gate, setGate] = useState(true);
  const [lUrl, setLUrl] = useState("");
  const [lTitle, setLTitle] = useState("");

  function pick(f: File) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," ")); }

  async function uploadFile(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setPct(5);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "mediashareop1");
      const xhr = new XMLHttpRequest();
      const r = await new Promise<any>((res,rej) => {
        xhr.upload.onprogress = ev => { if (ev.lengthComputable) setPct(5+Math.round(ev.loaded/ev.total*80)); };
        xhr.onload = () => { try { res(JSON.parse(xhr.responseText)); } catch { rej(new Error(xhr.responseText)); } };
        xhr.onerror = () => rej(new Error("Network error"));
        xhr.open("POST","https://api.cloudinary.com/v1_1/doku42ufq/auto/upload");
        xhr.send(fd);
      });
      if (r.error) throw new Error(r.error.message);
      setPct(92);
      const res = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title||file.name, description: desc, fileKey: r.public_id, fileUrl: r.secure_url, fileSize: file.size, mimeType: file.type||"application/octet-stream", originalName: file.name, missionEnabled: gate }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error??"Save failed");
      setPct(100);
      toast.success("Uploaded!");
      setTimeout(() => router.push(`/f/${d.slug}`), 400);
    } catch (err: any) {
      toast.error(err.message??"Upload failed");
      setPct(0);
    } finally { setBusy(false); }
  }

  async function createLink(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const res = await fetch("/api/links", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ targetUrl: lUrl, title: lTitle, missionEnabled: gate }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success("Link created!");
      router.push(`/d/${d.slug}`);
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-4">
            <Shield className="w-3 h-3" /> Secure Upload & Link Platform
          </div>
          <h1 className="text-3xl font-bold text-white">Create Content</h1>
          <p className="text-slate-500 text-sm mt-2">Upload files up to 2GB or create mission-gated shortlinks</p>
        </div>

        <div className="relative flex gap-1 p-1 bg-surface-card border border-surface-border rounded-2xl mb-6">
          <div className={`absolute inset-y-1 rounded-xl bg-brand-500 transition-all duration-300 ${mode==="file"?"left-1 right-[50%]":"left-[50%] right-1"}`} />
          {[{v:"file",I:Upload,l:"Upload File"},{v:"link",I:Link2,l:"Shorten Link"}].map(t=>(
            <button key={t.v} onClick={()=>setMode(t.v as any)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors z-10 ${mode===t.v?"text-white":"text-slate-500 hover:text-slate-300"}`}>
              <t.I className="w-4 h-4" />{t.l}
            </button>
          ))}
        </div>

        {mode==="file" ? (
          <form onSubmit={uploadFile} className="space-y-4">
            <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)pick(f);}}
              onClick={()=>!file&&document.getElementById("fi")?.click()}
              className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden ${drag?"border-brand-500 bg-brand-500/5":file?"border-brand-500/40 bg-brand-500/5":"border-surface-border hover:border-brand-500/40"}`}>
              <input id="fi" type="file" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)pick(f);}} />
              <div className="p-8">
                {file ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{file.name}</p>
                      <p className="text-slate-500 text-sm">{fmt(file.size)}</p>
                    </div>
                    <button type="button" onClick={e=>{e.stopPropagation();setFile(null);setPct(0);setTitle("");}}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-slate-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-7 h-7 text-brand-400" />
                    </div>
                    <p className="text-white font-semibold mb-1">Drop your file here</p>
                    <p className="text-slate-500 text-sm">or click to browse — up to <span className="text-brand-400 font-medium">2GB</span></p>
                  </div>
                )}
              </div>
              {busy && <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-border"><div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-300" style={{width:`${pct}%`}} /></div>}
            </div>

            {busy && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-500/5 border border-brand-500/20">
                <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Uploading to cloud...</span>
                    <span className="text-brand-400 font-medium">{pct}%</span>
                  </div>
                  <div className="w-full bg-surface-border rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-brand-500 to-cyan-400 h-1.5 rounded-full transition-all" style={{width:`${pct}%`}} />
                  </div>
                </div>
              </div>
            )}

            <input className="input" placeholder="File title" value={title} onChange={e=>setTitle(e.target.value)} required />
            <textarea className="input resize-none" rows={2} placeholder="Description (optional)" value={desc} onChange={e=>setDesc(e.target.value)} />

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-card border border-surface-border">
              <div><p className="text-white text-sm font-medium">Mission Gate</p><p className="text-slate-500 text-xs">Require tasks before download</p></div>
              <button type="button" onClick={()=>setGate(!gate)} className={`w-11 h-6 rounded-full relative transition-colors ${gate?"bg-brand-500":"bg-surface-border"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${gate?"translate-x-5":"translate-x-0.5"}`} />
              </button>
            </div>

            <button type="submit" disabled={busy||!file} className="btn-primary w-full justify-center py-3.5 text-base rounded-xl disabled:opacity-40">
              {busy?<><Loader2 className="w-4 h-4 animate-spin"/>Uploading {pct}%...</>:<><Upload className="w-4 h-4"/>Upload File</>}
            </button>
          </form>
        ) : (
          <form onSubmit={createLink} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Link Title</label>
              <input className="input" placeholder="My awesome link" value={lTitle} onChange={e=>setLTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Destination URL</label>
              <input className="input" type="url" placeholder="https://example.com" value={lUrl} onChange={e=>setLUrl(e.target.value)} required />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-card border border-surface-border">
              <div><p className="text-white text-sm font-medium">Mission Gate</p><p className="text-slate-500 text-xs">Require tasks before redirect</p></div>
              <button type="button" onClick={()=>setGate(!gate)} className={`w-11 h-6 rounded-full relative transition-colors ${gate?"bg-brand-500":"bg-surface-border"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${gate?"translate-x-5":"translate-x-0.5"}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[["Click Tracking","📊"],["Mission Gate","🎯"],["Instant Link","⚡"]].map(([l,i])=>(
                <div key={l} className="p-3 rounded-xl bg-surface-card border border-surface-border">
                  <div className="text-xl mb-1">{i}</div>
                  <p className="text-xs text-slate-400">{l}</p>
                </div>
              ))}
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3.5 text-base rounded-xl">
              {busy?<Loader2 className="w-4 h-4 animate-spin"/>:<><Link2 className="w-4 h-4"/>Create Link</>}
            </button>
          </form>
        )}
        <p className="text-center text-xs text-slate-700 mt-8">Created by Alrect & AI Gemini</p>
      </div>
    </div>
  );
}
