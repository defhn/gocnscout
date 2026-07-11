import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { createMetadata } from "@/config/seo";
import { prisma } from "@/lib/db";
import { BLOG_POSTS } from "@/config/blog-data";
import { PublicBlogList } from "@/components/blog/public-blog-list";

export const revalidate = 60;
export const metadata = createMetadata({ title: "China Sourcing Guides and Supplier Research Blog", description: "Practical guides on Chinese supplier verification, manufacturing clusters, compliance, and sourcing risk.", path: "/blog" });

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, select: { slug: true, title: true, excerpt: true, coverImage: true, category: true, tags: true, authorName: true, publishedAt: true } }).catch(() => []);
  const displayPosts = posts.length > 0 ? posts : BLOG_POSTS.map((post) => ({ slug: post.slug, title: post.title, excerpt: post.description, coverImage: post.image, category: null, tags: [], authorName: post.author, publishedAt: post.datePublished }));
  return <><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} /><main className="container-page pb-20"><header className="max-w-3xl border-b border-slate-200 py-8"><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Sourcing Wisdom & Guides</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">China Sourcing Intelligence Blog</h1><p className="mt-4 text-base leading-7 text-slate-600">实用的供应商核验、产业集群、贸易合规和采购风险研究。</p></header><div className="mt-8"><PublicBlogList posts={displayPosts} /></div></main></>;
}
