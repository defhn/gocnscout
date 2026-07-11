"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";

type Post = {
  title: string;
  slug: string;
  category: string | null;
  tags: string[];
  viewCount: number;
};

function BulkButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{children}</button>;
}

export function AdminBulkActions({ posts }: { posts: Post[] }) {
  const [message, setMessage] = useState("");
  const [syncing, setSyncing] = useState(false);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setMessage(`${label}已复制`);
    window.setTimeout(() => setMessage(""), 1800);
  };

  const syncGsc = async () => {
    setSyncing(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/blog/gsc-sync", { method: "POST" });
      const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
      setMessage(payload.message ?? payload.error ?? "GSC 同步完成");
    } catch {
      setMessage("GSC 同步失败");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white p-3">
      <BulkButton onClick={() => void copy(posts.map((post) => post.title).join("\n"), "标题")}>
        <Copy size={14} />
        复制所有标题
      </BulkButton>
      <BulkButton onClick={() => void copy(posts.map((post) => `| ${post.title.replace(/\|/g, "\\|")} | ${post.category ?? "-"} | ${post.tags.join(", ") || "-"} | ${post.viewCount} | /blog/${post.slug} |`).join("\n"), "核心参数")}>
        <Copy size={14} />
        复制核心参数
      </BulkButton>
      <BulkButton onClick={syncGsc} disabled={syncing}>
        {syncing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        一键分析 GSC 指标
      </BulkButton>
      {message && <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700"><Check size={13} />{message}</span>}
    </div>
  );
}
