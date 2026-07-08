import Link from "next/link";
import { Calendar, User, ArrowLeft, Database, Search } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { createMetadata, blogPostingJsonLd } from "@/config/seo";
import { BLOG_POSTS } from "@/config/blog-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  return createMetadata({
    title: `${post.title} | gocnscout Guide`,
    description: post.description,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const blogSchema = blogPostingJsonLd({
    title: post.title,
    description: post.description,
    slug: post.slug,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    authorName: post.author,
    imageName: "/favicon.ico",
  });

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <Breadcrumbs 
        items={[
          { label: "Home", href: "/" }, 
          { label: "Blog", href: "/blog" }, 
          { label: "Article Details" }
        ]} 
      />

      <article className="container-page pb-20">
        {/* Back Link */}
        <div className="py-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to blog list
          </Link>
        </div>

        {/* Hero Section */}
        <header className="max-w-3xl py-6 mb-8 border-b border-slate-100">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center space-x-6 text-xs text-slate-500 mt-4">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-slate-400" />
              {new Date(post.datePublished).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1 text-slate-400" />
              {post.author}
            </span>
            <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wide">
              Verified Guide
            </span>
          </div>
        </header>

        {/* Two Column Article Body */}
        <div className="grid gap-10 lg:grid-cols-[1fr_300px] items-start">
          {/* Article Text Content */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-6">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {/* Regulatory Exclusions notice at the bottom */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 mt-8 text-xs text-slate-500 leading-normal">
              <strong>E-E-A-T Safety & Disclaimer</strong>: This article is built around public B2B trade structures and factory directories. gocnscout does not sell lists of personal contact persons, mobile phone indices, or direct private emails. Sourcing companies must perform standard credit checks and product sampling.
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Database Promo Widget */}
            <Card className="border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <Database className="h-6 w-6 text-teal-400" />
              <h3 className="text-base font-bold mt-4">Launch Supplier Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Vet 120,000+ China export manufacturers. Use filters for locations, product tags, capital size, and domain records.
              </p>
              <ButtonLink href="/database" className="mt-5 w-full justify-center bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs">
                Launch Search Engine <Search className="ml-1 h-3.5 w-3.5" />
              </ButtonLink>
            </Card>

            {/* Read next */}
            <Card className="border border-slate-200 bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Read Next</h3>
              <div className="mt-3.5 space-y-3.5">
                {BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2).map((p) => (
                  <div key={p.slug} className="text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <Link href={`/blog/${p.slug}`} className="font-bold text-slate-900 hover:text-teal-600 transition-colors line-clamp-2">
                      {p.title}
                    </Link>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(p.datePublished).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </article>
    </>
  );
}
