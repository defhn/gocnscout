import Link from "next/link";
import { FileText, Globe, Image as ImageIcon, Plus, Save, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";
import { BlogPostActions } from "@/components/blog/blog-post-actions";
import { AdminBulkActions } from "@/components/blog/admin-bulk-actions";
import { CopyTextButton } from "@/components/blog/copy-text-button";
import { GscRowAction } from "@/components/blog/gsc-row-action";
import { getBlogImageStats } from "@/lib/blog/seo";

export const dynamic = "force-dynamic";

type SearchParams = {
  search?: string;
  status?: string;
  category?: string;
  timeType?: string;
  year?: string;
  month?: string;
  date?: string;
  sortField?: string;
  sortOrder?: string;
  page?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

const PAGE_SIZE = 15;

const statusLabel = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档",
} as const;

function dateFilter(year?: string, month?: string, date?: string) {
  if (!year) return undefined;
  const y = Number(year);
  if (!Number.isFinite(y)) return undefined;
  const m = month ? Number(month) - 1 : undefined;
  const d = date ? Number(date) : undefined;
  const start = new Date(y, m ?? 0, d ?? 1);
  const end = d ? new Date(y, m ?? 0, d + 1) : m !== undefined ? new Date(y, m + 1, 1) : new Date(y + 1, 0, 1);
  return { gte: start, lt: end };
}

function seoBadge(ok: boolean, label: string, title: string) {
  return <span className={`inline-flex size-5 items-center justify-center rounded text-[10px] font-bold ${ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`} title={title}>{label}</span>;
}

export default async function AdminBlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page ?? 1) || 1);
  const search = params.search?.trim() ?? "";
  const status = ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(params.status ?? "") ? params.status : "";
  const category = params.category?.trim() ?? "";
  const sortField = ["updatedAt", "createdAt", "viewCount"].includes(params.sortField ?? "") ? params.sortField! : "updatedAt";
  const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";
  const timeType = params.timeType === "createdAt" ? "createdAt" : "updatedAt";
  const range = dateFilter(params.year, params.month, params.date);

  const where = {
    ...(status ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(category ? { category } : {}),
    ...(range ? { [timeType]: range } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { excerpt: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [posts, total, stats, publishedCount, draftCount, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.blogPost.count({ where }),
    prisma.blogPost.aggregate({ _count: { id: true }, _sum: { viewCount: true } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.blogPost.findMany({ where: { category: { not: null } }, distinct: ["category"], orderBy: { category: "asc" }, select: { category: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const createQuery = (updates: Record<string, string>) => {
    const query = new URLSearchParams();
    Object.entries({ ...params, ...updates }).forEach(([key, value]) => { if (value) query.set(key, String(value)); });
    return query.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">系统官方博客管理</h1>
          <p className="mt-1 text-sm text-slate-500">创建、编辑和发布 GoCNScout 官方博客文章，作为重要 SEO 流量来源。</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus size={16} />
          撰写新文章
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4"><FileText size={16} className="text-slate-400" /><p className="mt-2 text-xs font-bold text-slate-500">总文章数</p><p className="mt-2 text-2xl font-bold text-slate-950">{stats._count.id}</p></div>
        <div className="rounded-md border border-slate-200 bg-white p-4"><Globe size={16} className="text-slate-400" /><p className="mt-2 text-xs font-bold text-slate-500">已发布</p><p className="mt-2 text-2xl font-bold text-emerald-600">{publishedCount}</p></div>
        <div className="rounded-md border border-slate-200 bg-white p-4"><Save size={16} className="text-slate-400" /><p className="mt-2 text-xs font-bold text-slate-500">草稿箱</p><p className="mt-2 text-2xl font-bold text-amber-600">{draftCount}</p></div>
        <div className="rounded-md border border-slate-200 bg-white p-4"><TrendingUp size={16} className="text-slate-400" /><p className="mt-2 text-xs font-bold text-slate-500">全站总阅读量</p><p className="mt-2 text-2xl font-bold text-teal-600">{stats._sum.viewCount ?? 0}</p></div>
      </div>

      <AdminBulkActions posts={posts.map((post) => ({ title: post.title, slug: post.slug, category: post.category, tags: post.tags, viewCount: post.viewCount }))} />

      <form className="rounded-md border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_180px_170px_auto]">
          <input name="search" defaultValue={search} placeholder="搜索文章标题或 Slug..." className="field-input" />
          <select name="status" defaultValue={status} className="field-input"><option value="">全部状态</option><option value="PUBLISHED">已发布</option><option value="DRAFT">草稿</option><option value="ARCHIVED">已归档</option></select>
          <select name="category" defaultValue={category} className="field-input"><option value="">所有分类</option>{categories.map((item) => item.category && <option key={item.category} value={item.category}>{item.category}</option>)}</select>
          <select name="timeType" defaultValue={timeType} className="field-input"><option value="updatedAt">更新时间</option><option value="createdAt">上传时间</option></select>
          <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">筛选</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input name="year" defaultValue={params.year ?? ""} placeholder="年份" className="field-input h-9 w-24" />
          <input name="month" defaultValue={params.month ?? ""} placeholder="月份" className="field-input h-9 w-24" />
          <input name="date" defaultValue={params.date ?? ""} placeholder="日" className="field-input h-9 w-20" />
          <Link href="/admin/blog" className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">清除过滤</Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">文章信息 & SEO 质检</th>
                <th className="px-4 py-3">分类</th>
                <th className="px-4 py-3"><Link href={`?${createQuery({ sortField: "viewCount", sortOrder: sortOrder === "desc" ? "asc" : "desc" })}`}>阅读统计</Link></th>
                <th className="px-4 py-3">主攻渠道</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3"><Link href={`?${createQuery({ sortField: "updatedAt", sortOrder: sortOrder === "desc" ? "asc" : "desc" })}`}>最后更新</Link></th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => {
                const imageStats = getBlogImageStats(post.content as Record<string, unknown>);
                return (
                  <tr key={post.id}>
                    <td className="max-w-md px-4 py-3">
                      <div className="flex items-start gap-2">
                        <p className="font-bold text-slate-950">{post.title}</p>
                        <CopyTextButton text={post.title} label="" />
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono">{post.slug}</span>
                        <CopyTextButton text={`${process.env.APP_URL ?? "https://gocnscout.com"}/blog/${post.slug}`} label="复制链接" />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {seoBadge(Boolean(post.metaTitle && post.metaTitle.length >= 40), "T", "Meta Title 达标")}
                        {seoBadge(Boolean(post.metaDescription && post.metaDescription.length >= 100), "D", "Meta Description 达标")}
                        {seoBadge(Boolean(post.excerpt), "E", "摘要已填写")}
                        {seoBadge(Boolean(post.coverImage), "C", "封面图已填写")}
                        <span className={`ml-1 inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold ${imageStats.total === imageStats.withAlt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><ImageIcon size={11} />{imageStats.total} (Alt: {imageStats.withAlt}/{imageStats.total})</span>
                        {post.sourceFileName && <span className="rounded bg-slate-100 px-1.5 py-1 text-[10px] text-slate-500">{post.sourceFileName}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{post.category || "未分类"}</td>
                    <td className="px-4 py-3"><p className="font-bold text-slate-900">{post.viewCount}</p><p className="mt-1 text-[11px] text-slate-400">🔍 {post.searchViews} 💬 {post.linkedinViews} X {post.xViews} ▶ {post.youtubeViews}</p></td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600">{post.trafficSource}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : post.status === "ARCHIVED" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700"}`}>{statusLabel[post.status]}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{post.updatedAt.toLocaleDateString("zh-CN")}<br />{post.updatedAt.toISOString().slice(11, 16)}</td>
                    <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><BlogPostActions slug={post.slug} status={post.status} /><GscRowAction slug={post.slug} /></div></td>
                  </tr>
                );
              })}
              {posts.length === 0 && <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-400">未找到符合条件的文章。</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <Link key={page} href={`?${createQuery({ page: String(page) })}`} className={`inline-flex size-9 items-center justify-center rounded-md border text-xs font-bold ${page === currentPage ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{page}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
