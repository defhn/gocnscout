"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto mt-16 max-h-[80vh] max-w-4xl overflow-hidden rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950">媒体库</h2>
            <p className="text-xs text-slate-500">选择一张已上传图片插入正文。</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="关闭媒体库">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[64vh] overflow-y-auto p-5">
          {loading && <div className="flex items-center justify-center py-16 text-sm text-slate-500"><Loader2 className="mr-2 animate-spin" size={16} />加载媒体库...</div>}
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 py-16 text-slate-400">
              <ImageIcon size={28} />
              <p className="mt-2 text-sm">还没有上传过图片。</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.publicUrl)}
                className="overflow-hidden rounded-md border border-slate-200 bg-white text-left hover:border-teal-300 hover:shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.publicUrl} alt={item.fileName} className="h-36 w-full object-cover" />
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-slate-700">{item.fileName}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleDateString("zh-CN")}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
