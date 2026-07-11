"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";

type MediaItem = {
  id: string;
  publicUrl: string;
  fileName: string;
  contentType: string;
  createdAt: string;
};

export function MediaLibraryModal({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/blog/media")
      .then((response) => response.json())
      .then((payload: { items?: MediaItem[]; error?: string }) => {
        if (!mounted) return;
        if (payload.error) setError(payload.error);
        setItems(payload.items ?? []);
      })
      .catch(() => setError("媒体库加载失败"))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/blog/media", { method: "POST", body: form });
      const payload = (await response.json().catch(() => ({}))) as { item?: MediaItem; error?: string };
      if (!response.ok || !payload.item) {
        throw new Error(payload.error ?? "上传失败，请重试");
      }
      setItems((prev) => [payload.item!, ...prev]);
      onSelect(payload.item.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto mt-16 max-h-[80vh] max-w-4xl overflow-hidden rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950">媒体库</h2>
            <p className="text-xs text-slate-500">选择一张已上传图片或在下方直接上传新图片插入正文。</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="关闭媒体库">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[64vh] overflow-y-auto p-5">
          {error && <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              <Loader2 className="mr-2 animate-spin" size={16} />加载媒体库...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Dash Upload Card */}
              <label className="flex h-[172px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-teal-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    void handleUpload(file);
                    e.target.value = "";
                  }}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="animate-spin text-teal-600" size={24} />
                ) : (
                  <Upload className="text-slate-400" size={24} />
                )}
                <span className="mt-2 text-xs font-semibold text-slate-700">
                  {uploading ? "正在上传..." : "上传新图片"}
                </span>
                <span className="mt-1 text-[10px] text-slate-400">支持 JPG, PNG, WebP 等</span>
              </label>

              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.publicUrl)}
                  className="overflow-hidden rounded-md border border-slate-200 bg-white text-left hover:border-teal-300 hover:shadow-sm h-[172px] flex flex-col"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.publicUrl} alt={item.fileName} className="h-28 w-full object-cover" />
                  <div className="p-2 flex-1 flex flex-col justify-center min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700">{item.fileName}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
