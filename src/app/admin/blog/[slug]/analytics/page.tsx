import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogAnalyticsPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, include: { dailyViews: { orderBy: { date: "desc" }, take: 30 }, gscKeywordStats: { orderBy: [{ date: "desc" }, { clicks: "desc" }], take: 20 } } });
  if (!post) notFound();
  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-teal-700"><ArrowLeft size={15} />返回博客管理</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-950">文章数据</h1><p className="mt-1 text-sm text-slate-500">{post.title}</p></div>
        <Link target="_blank" href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">查看前台 <ExternalLink size={14} /></Link>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-md border border-slate-200 bg-white p-5"><Eye size={18} className="text-teal-600" /><p className="mt-3 text-xs text-slate-500">累计阅读</p><p className="mt-1 text-3xl font-bold text-slate-950">{post.viewCount.toLocaleString()}</p></div>
        <div className="rounded-md border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Search</p><p className="mt-3 text-xl font-bold text-slate-950">{post.searchViews}</p></div>
        <div className="rounded-md border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">LinkedIn</p><p className="mt-3 text-xl font-bold text-slate-950">{post.linkedinViews}</p></div>
        <div className="rounded-md border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">X / YouTube</p><p className="mt-3 text-xl font-bold text-slate-950">{post.xViews + post.youtubeViews}</p></div>
        <div className="rounded-md border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">最近更新</p><p className="mt-3 text-xl font-bold text-slate-950">{post.updatedAt.toLocaleDateString("zh-CN")}</p></div>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">日期</th><th className="px-4 py-3">总阅读</th><th className="px-4 py-3">搜索</th><th className="px-4 py-3">LinkedIn</th><th className="px-4 py-3">X</th><th className="px-4 py-3">YouTube</th><th className="px-4 py-3">其他</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{post.dailyViews.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.date.toLocaleDateString("zh-CN")}</td><td className="px-4 py-3">{row.views}</td><td className="px-4 py-3">{row.searchViews}</td><td className="px-4 py-3">{row.linkedinViews}</td><td className="px-4 py-3">{row.xViews}</td><td className="px-4 py-3">{row.youtubeViews}</td><td className="px-4 py-3">{row.otherViews}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">GSC 关键词</th><th className="px-4 py-3">日期</th><th className="px-4 py-3">点击</th><th className="px-4 py-3">展示</th><th className="px-4 py-3">CTR</th><th className="px-4 py-3">排名</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{post.gscKeywordStats.map((row) => <tr key={row.id}><td className="px-4 py-3 font-semibold text-slate-900">{row.keyword}</td><td className="px-4 py-3">{row.date.toLocaleDateString("zh-CN")}</td><td className="px-4 py-3">{row.clicks}</td><td className="px-4 py-3">{row.impressions}</td><td className="px-4 py-3">{(row.ctr * 100).toFixed(2)}%</td><td className="px-4 py-3">{row.position.toFixed(1)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
