import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ShieldAlert, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { BlogContent } from "@/components/blog/blog-content";
import { BlogInteractions } from "@/components/blog/blog-interactions";
import { createMetadata, blogPostingJsonLd } from "@/config/seo";
import { prisma } from "@/lib/db";
import { isBlogDocument, readingMinutes } from "@/lib/blog/content";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } }).catch(() => null);
}

async function getRelatedPosts(slug: string, category?: string | null, tags: string[] = []) {
  const signals = [
    ...(category ? [{ category }] : []),
    ...(tags.length ? [{ tags: { hasSome: tags } }] : []),
  ];

  return prisma.blogPost
    .findMany({
      where: {
        slug: { not: slug },
        status: "PUBLISHED",
        ...(signals.length ? { OR: signals } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, excerpt: true, category: true },
    })
    .catch(() => []);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return createMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "GoCNScout sourcing research",
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const description = post.excerpt ?? "GoCNScout sourcing research";
  const published = post.publishedAt?.toISOString() ?? new Date().toISOString();
  const modified = post.updatedAt?.toISOString() ?? published;
  const author = post.authorName ?? "GoCNScout Editorial Team";
  const image = post.coverImage ?? "/favicon.ico";
  const category = post.category;
  const tags = post.tags;
  const jsonLd = blogPostingJsonLd({ title: post.title, description, slug, datePublished: published, dateModified: modified, authorName: author, imageName: image });
  const dbDocument = isBlogDocument(post.content) ? post.content : null;
  const related = await getRelatedPosts(slug, category, tags);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]} />
      <article className="container-page pb-20">
        <div className="py-5">
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-teal-700">
            <ArrowLeft size={15} />
            Back to Blog
          </Link>
        </div>

        <header className="max-w-4xl border-b border-slate-200 py-6">
          {category && <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">{category}</p>}
          <h1 className="text-3xl font-extrabold leading-tight text-slate-950 md:text-5xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1"><Calendar size={15} />{new Date(published).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="inline-flex items-center gap-1"><User size={15} />{author}</span>
            <span>{dbDocument ? `${readingMinutes(dbDocument)} min read` : "Research Guide"}</span>
          </div>
        </header>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 max-w-3xl">
            <BlogInteractions slug={slug} title={post.title} />
            <div className="mt-8">
              {dbDocument ? <BlogContent document={dbDocument} /> : null}
            </div>

            <aside className="mt-12 rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-sm shadow-sm transition-all hover:shadow-md hover:border-teal-200">
              <div className="flex gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100/80 text-teal-700">
                  <ShieldAlert size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900">Compliance & Trust Statement</h4>
                  <p className="leading-relaxed text-slate-600">
                    This article is compiled using verified, public corporate and trade information. GoCNScout is committed to data privacy and strictly adheres to compliance regulations—we never disclose private contact details, personal mobile numbers, or non-public email directories.
                  </p>
                </div>
              </div>
            </aside>

            {related.length > 0 && (
              <section className="mt-10 border-t border-slate-200 pt-8">
                <h2 className="text-xl font-bold text-slate-950">Related Articles</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {related.map((item) => (
                    <Link key={item.slug} href={`/blog/${item.slug}`} className="rounded-md border border-slate-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm">
                      <p className="text-xs font-semibold text-teal-700">{item.category || "Sourcing Research"}</p>
                      <h3 className="mt-2 text-sm font-bold leading-5 text-slate-950">{item.title}</h3>
                      {item.excerpt && <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{item.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-md bg-slate-950 p-5 text-white">
              <h2 className="font-bold">Search Real Exporters</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Filter public supplier records by industry, city, product, and company signals.</p>
              <Link href="/database" className="mt-4 inline-flex w-full justify-center rounded bg-teal-500 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-teal-400">
                Open Supplier Database
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
