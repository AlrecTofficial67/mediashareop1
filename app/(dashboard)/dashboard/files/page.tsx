"use client";
import { useEffect, useState } from "react";
import { FileText, Download, Trash2, ExternalLink, Upload } from "lucide-react";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/files/upload")
      .then(r => r.json())
      .then(d => { setFiles(d.data?.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Files</h1>
          <p className="text-slate-400 text-sm mt-1">{files.length} files uploaded</p>
        </div>
        <Link href="/upload" className="btn-primary text-sm"><Upload className="w-4 h-4" /> Upload</Link>
      </div>
      <div className="card divide-y divide-surface-border">
        {loading && <p className="p-6 text-slate-500 text-sm">Loading...</p>}
        {!loading && files.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No files yet</p>
            <Link href="/upload" className="btn-primary text-sm mt-4 inline-flex">Upload your first file</Link>
          </div>
        )}
        {files.map((f) => (
          <div key={f._id} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{f.title}</p>
              <p className="text-xs text-slate-500">{formatBytes(f.fileSize)} · {f.downloadCount} downloads</p>
            </div>
            <Link href={`/f/${f.slug}`} className="text-slate-500 hover:text-brand-400 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
