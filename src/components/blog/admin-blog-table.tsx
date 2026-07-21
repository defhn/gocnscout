"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { BlogPostActions } from "./blog-post-actions";
import { GscRowAction } from "./gsc-row-action";
import { CopyTextButton } from "./copy-text-button";
import { getBlogImageStats } from "@/lib/blog/seo";
import { blogPostUrl } from "@/lib/blog/url";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: any;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  category: string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  sourceFileName: string | null;
  viewCount: number;
  trafficSource: string;
  searchViews: number;
  linkedinViews: number;
  xViews: number;
  youtubeViews: number;
  updatedAt: Date;
};

type Props = {
  posts: Post[];
  createQuery: (updates: Record<string, string>) => string;
  sortOrder: "asc" | "desc";
};

const statusLabel = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档",
} as const;

function seoBadge(ok: boolean, label: string, title: string) {
  return (
    <span
      className={`inline-flex size-5 items-center justify-center rounded text-[10px] font-bold ${
        ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
      title={title}
    >
      {label}
    </span>
  );
}

export function AdminBlogTable({ posts, createQuery, sortOrder }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(posts.map((post) => post.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDraft = async () => {
    const listCount = selectedIds.size;
    if (listCount === 0) return;

    if (!window.confirm(`确定将选中的 ${listCount} 篇文章转为草稿状态吗？`)) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/blog/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status: "DRAFT",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "批量操作失败");
      }

      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "批量修改状态失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk actions banner */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              已选择 <strong className="text-amber-950 font-bold">{selectedIds.size}</strong> 篇文章
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkDraft}
              disabled={busy}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-amber-600 hover:bg-amber-700 px-3 font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {busy ? "处理中..." : "批量设为草稿"}
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex h-8 items-center rounded-md border border-amber-300 bg-white px-3 font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={posts.length > 0 && selectedIds.size === posts.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">文章信息 & SEO 质检</th>
                <th className="px-4 py-3">分类</th>
                <th className="px-4 py-3">
                  <Link href={`?${createQuery({ sortField: "viewCount", sortOrder: sortOrder === "desc" ? "asc" : "desc" })}`}>
                    阅读统计
                  </Link>
                </th>
                <th className="px-4 py-3">主攻渠道</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">
                  <Link href={`?${createQuery({ sortField: "updatedAt", sortOrder: sortOrder === "desc" ? "asc" : "desc" })}`}>
                    最后更新
                  </Link>
                </th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => {
                const imageStats = getBlogImageStats(post.content as Record<string, unknown>);
                return (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(post.id)}
                        onChange={() => handleToggleSelect(post.id)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>
                    <td className="max-w-md px-4 py-3">
                      <div className="flex items-start gap-2">
                        <p className="font-bold text-slate-950">{post.title}</p>
                        <CopyTextButton text={post.title} label="" />
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono">{post.slug}</span>
                        <CopyTextButton text={blogPostUrl(post.slug)} label="复制链接" />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {seoBadge(Boolean(post.metaTitle && post.metaTitle.length >= 40), "T", "Meta Title 达标")}
                        {seoBadge(Boolean(post.metaDescription && post.metaDescription.length >= 100), "D", "Meta Description 达标")}
                        {seoBadge(Boolean(post.excerpt), "E", "摘要已填写")}
                        {seoBadge(Boolean(post.coverImage), "C", "封面图已填写")}
                        <span
                          className={`ml-1 inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold ${
                            imageStats.total === imageStats.withAlt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <ImageIcon size={11} />
                          {imageStats.total} (Alt: {imageStats.withAlt}/{imageStats.total})
                        </span>
                        {post.sourceFileName && (
                          <span className="rounded bg-slate-100 px-1.5 py-1 text-[10px] text-slate-500">
                            {post.sourceFileName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{post.category || "未分类"}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{post.viewCount}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        🔍 {post.searchViews} 💬 {post.linkedinViews} X {post.xViews} ▶ {post.youtubeViews}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600">{post.trafficSource}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700"
                            : post.status === "ARCHIVED"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {statusLabel[post.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
                      <br />
                      {new Date(post.updatedAt).toISOString().slice(11, 16)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <BlogPostActions slug={post.slug} status={post.status} />
                        <GscRowAction slug={post.slug} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                    未找到符合条件的文章。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
