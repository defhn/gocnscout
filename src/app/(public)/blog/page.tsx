import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { createMetadata } from "@/config/seo";
import { PublicBlogList } from "@/components/blog/public-blog-list";
import { listPublishedBlogPostsCached } from "@/server/public-blog";

export const revalidate = 604800;
export const metadata = createMetadata({ title: "China Sourcing Guides and Supplier Research Blog", description: "Practical guides on Chinese supplier verification, manufacturing clusters, compliance, and sourcing risk.", path: "/blog" });

export default async function BlogListPage() {
  const posts = await listPublishedBlogPostsCached().catch(() => []);
  return <><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} /><main className="container-page pb-20"><header className="max-w-3xl border-b border-slate-200 py-8"><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Sourcing Wisdom & Guides</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">China Sourcing Intelligence Blog</h1><p className="mt-4 text-base leading-7 text-slate-600">Practical guides and insights on Chinese supplier verification, industrial clusters, trade compliance, and sourcing risks.</p></header><div className="mt-8"><PublicBlogList posts={posts} /></div></main></>;
}
