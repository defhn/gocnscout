import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { BlogPostActions } from "@/components/blog/blog-post-actions";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  status?: string;
  category?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

const statusLabel = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档",
} as const;

export default async function AdminBlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(params.status ?? "") ? params.status : "";
  const category = params.category?.trim() ?? "";

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        ...(status ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
        ...(category ? { category } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { excerpt: { contains: query, mode: "insensitive" as const } },
                { slug: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        slug: true,
        title: true,
        status: true,
        category: true,
        authorName: true,
        publishedAt: true,
        updatedAt: true,
        viewCount: true,
      },
    }),
    prisma.blogPost.findMany({
      where: { category: { not: null } },
      distinct: ["category"],
      orderBy: { category: "asc" },
      select: { category: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">博客管理</h1>
          <p className="mt-1 text-sm text-slate-500">管理文章、Markdown 导入、发布状态和阅读数据。</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus size={16} />
          新建文章
        </Link>
      </div>

      <form className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
        <label>
          <span className="field-label">搜索</span>
          <input name="q" defaultValue={query} placeholder="标题、摘要或 slug" className="field-input" />
        </label>
        <label>
          <span className="field-label">状态</span>
          <select name="status" defaultValue={status} className="field-input">
            <option value="">全部状态</option>
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
            <option value="ARCHIVED">已归档</option>
          </select>
        </label>
        <label>
          <span className="field-label">分类</span>
          <select name="category" defaultValue={category} className="field-input">
            <option value="">全部分类</option>
            {categories.map((item) => item.category && <option key={item.category} value={item.category}>{item.category}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">筛选</button>
          <Link href="/admin/blog" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">重置</Link>
        </div>
      </form>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">文章</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">阅读</th>
              <th className="px-4 py-3">更新时间</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr key={post.slug}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{post.title}</p>
                  <p className="mt-1 text-xs text-slate-400">/blog/{post.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{post.category || "未分类"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : post.status === "ARCHIVED" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700"}`}>
                    {statusLabel[post.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{post.viewCount}</td>
                <td className="px-4 py-3 text-slate-500">{post.updatedAt.toLocaleDateString("zh-CN")}</td>
                <td className="px-4 py-3">
                  <BlogPostActions slug={post.slug} status={post.status} />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-slate-400">还没有匹配的博客文章。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
