import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminBulkActions } from "@/components/blog/admin-bulk-actions";
import { AdminBlogTable } from "@/components/blog/admin-blog-table";

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-slate-200 bg-white p-3">
        {/* Left: Title and compact inline stats */}
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-lg font-bold text-slate-900">系统官方博客管理</h1>
          <div className="hidden h-6 w-px bg-slate-200 sm:block" />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
              总文章数: <strong className="text-slate-900">{stats._count.id}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
              已发布: <strong className="text-emerald-900">{publishedCount}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 font-semibold text-amber-700">
              草稿箱: <strong className="text-amber-900">{draftCount}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-1 font-semibold text-teal-700">
              总阅读量: <strong className="text-teal-900">{stats._sum.viewCount ?? 0}</strong>
            </span>
          </div>
        </div>

        {/* Right: Bulk copy controls and new article button */}
        <div className="flex flex-wrap items-center gap-2">
          <AdminBulkActions posts={posts.map((post) => ({ title: post.title, slug: post.slug, category: post.category, tags: post.tags, viewCount: post.viewCount }))} />
          <Link href="/admin/blog/new" className="inline-flex h-8 items-center gap-1 rounded-md bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700">
            <Plus size={14} />
            撰写新文章
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white p-2 text-xs">
        <input name="search" defaultValue={search} placeholder="搜索标题或 Slug..." className="h-9 px-3 text-xs border border-slate-300 rounded-md bg-white w-44 focus:border-teal-600 outline-none" />
        
        <select name="status" defaultValue={status} className="h-9 px-2 text-xs border border-slate-300 rounded-md bg-white w-28 focus:border-teal-600 outline-none cursor-pointer">
          <option value="">全部状态</option>
          <option value="PUBLISHED">已发布</option>
          <option value="DRAFT">草稿</option>
          <option value="ARCHIVED">已归档</option>
        </select>
        
        <select name="category" defaultValue={category} className="h-9 px-2 text-xs border border-slate-300 rounded-md bg-white w-36 focus:border-teal-600 outline-none cursor-pointer">
          <option value="">所有分类</option>
          {categories.map((item) => item.category && <option key={item.category} value={item.category}>{item.category}</option>)}
        </select>
        
        <select name="timeType" defaultValue={timeType} className="h-9 px-2 text-xs border border-slate-300 rounded-md bg-white w-28 focus:border-teal-600 outline-none cursor-pointer">
          <option value="updatedAt">更新时间</option>
          <option value="createdAt">上传时间</option>
        </select>
        
        <div className="flex items-center gap-1 border-l pl-2 border-slate-200">
          <input name="year" defaultValue={params.year ?? ""} placeholder="年" className="h-9 px-1 text-xs border border-slate-300 rounded-md bg-white w-14 text-center focus:border-teal-600 outline-none" />
          <input name="month" defaultValue={params.month ?? ""} placeholder="月" className="h-9 px-1 text-xs border border-slate-300 rounded-md bg-white w-10 text-center focus:border-teal-600 outline-none" />
          <input name="date" defaultValue={params.date ?? ""} placeholder="日" className="h-9 px-1 text-xs border border-slate-300 rounded-md bg-white w-10 text-center focus:border-teal-600 outline-none" />
        </div>
        
        <button className="rounded-md bg-slate-950 px-4 py-2 h-9 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">筛选</button>
        <Link href="/admin/blog" className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">清除</Link>
      </form>

      <AdminBlogTable
        posts={posts}
        viewCountSortHref={`?${createQuery({ sortField: "viewCount", sortOrder: sortOrder === "desc" ? "asc" : "desc" })}`}
        updatedAtSortHref={`?${createQuery({ sortField: "updatedAt", sortOrder: sortOrder === "desc" ? "asc" : "desc" })}`}
      />

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
