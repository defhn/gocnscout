"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, BarChart3, Eye, FilePenLine, Pencil, Send, Trash2 } from "lucide-react";

type Props = {
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

async function updatePost(slug: string, status: Props["status"]) {
  const response = await fetch(`/api/blog/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? "操作失败");
  }
}

async function deletePost(slug: string) {
  const response = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? "删除失败");
  }
}

function IconButton({ title, onClick, children, disabled }: { title: string; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-teal-700 disabled:cursor-wait disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function BlogPostActions({ slug, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "操作失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Link title="编辑" aria-label="编辑" href={`/admin/blog/${slug}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-teal-700">
          <Pencil size={16} />
        </Link>
        <Link title="预览" aria-label="预览" target="_blank" href={`/blog/${slug}`} className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-teal-700">
          <Eye size={16} />
        </Link>
        <Link title="数据" aria-label="数据" href={`/admin/blog/${slug}/analytics`} className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-teal-700">
          <BarChart3 size={16} />
        </Link>
        {status !== "PUBLISHED" && <IconButton title="发布" onClick={() => void run(() => updatePost(slug, "PUBLISHED"))} disabled={busy}><Send size={16} /></IconButton>}
        {status !== "DRAFT" && <IconButton title="转为草稿" onClick={() => void run(() => updatePost(slug, "DRAFT"))} disabled={busy}><FilePenLine size={16} /></IconButton>}
        {status !== "ARCHIVED" && <IconButton title="归档" onClick={() => void run(() => updatePost(slug, "ARCHIVED"))} disabled={busy}><Archive size={16} /></IconButton>}
        <IconButton
          title="删除"
          onClick={() => {
            if (window.confirm("确定删除这篇文章吗？")) void run(() => deletePost(slug));
          }}
          disabled={busy}
        >
          <Trash2 size={16} />
        </IconButton>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
