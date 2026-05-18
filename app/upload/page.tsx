"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, Loader2, Link2 } from "lucide-react";
import toast from "react-hot-toast";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"file" | "link">("file");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [missionEnabled, setMissionEnabled] = useState(true);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const CLOUD_NAME = "doku42ufq";
  const UPLOAD_PRESET = "mediashareop1";

  function pickFile(f: File) {
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setProgress(5);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET);
      const xhr = new XMLHttpRequest();
      const cloudRes = await new Promise<any>((resolve, reject) => {
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(5 + Math.round((ev.loaded / ev.total) * 80));
        };
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch { reject(new Error(xhr.responseText)); }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);
        xhr.send(fd);
      });
      if (cloudRes.error) throw new Error(cloudRes.error.message);
      setProgress(90);
      const res = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || file.name,
          description,
          fileKey: cloudRes.public_id,
          fileUrl: cloudRes.secure_url,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          originalName: file.name,
          missionEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setProgress(100);
      toast.success("Uploaded!");
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
        body: JSON.stringify({ targetUrl: linkUrl, title: linkTitle, missionEnabled }),
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
          <button onClick={() => setMode("file")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "file" ? "bg-brand-500 text-white" : "text-slate-400"}`}>
            <Upload className="w-4 h-4" /> Upload File
          </button>
          <button onClick={() => setMode("link")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "link" ? "bg-brand-500 text-white" : "text-slate-400"}`}>
            <Link2 className="w-4 h-4" /> Shorten Link
          </button>
        </div>

        {mode === "file" ? (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f); }}
              onClick={() => !file && document.getElementById("fi")?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? "border-brand-500 bg-brand-500/5" : "border-surface-border hover:border-brand-500/50"}`}>
              <input id="fi" type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <FileText className="w-8 h-8 text-brand-400" />
                    <div>
                      <p className="text-white font-medium text-sm">{file.name}</p>
                      <p className="text-slate-500 text-xs">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0); }}
                    className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">Drop file here or click to browse</p>
                  <p className="text-slate-500 text-sm mt-1">Up to 2GB supported</p>
                </>
              )}
            </div>
            {progress > 0 && (
              <div className="w-full bg-surface-border rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea className="input resize-none" rows={3} placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setMissionEnabled(!missionEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${missionEnabled ? "bg-brand-500" : "bg-surface-border"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${missionEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-slate-300">Enable mission gate</span>
            </label>
            <button type="submit" disabled={uploading || !file} className="btn-primary w-full justify-center py-3">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {progress}%...</> : "Upload File"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLinkCreate} className="space-y-4">
            <input className="input" placeholder="Title" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} required />
            <input className="input" type="url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required />
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setMissionEnabled(!missionEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${missionEnabled ? "bg-brand-500" : "bg-surface-border"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${missionEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-slate-300">Enable mission gate</span>
            </label>
            <button type="submit" disabled={uploading} className="btn-primary w-full justify-center py-3">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Link"}
            </button>
          </form>
        )}
      </div>
      <p className="text-center text-xs text-slate-700 mt-10">Created by Alrect & AI Gemini</p>
    </div>
  );
}
