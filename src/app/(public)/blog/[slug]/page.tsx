import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Check, MapPin, ShieldAlert, Tag, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { BlogContent } from "@/components/blog/blog-content";
import { BlogInteractions } from "@/components/blog/blog-interactions";
import { createMetadata, blogPostingJsonLd } from "@/config/seo";
import { prisma } from "@/lib/db";
import { isBlogDocument, readingMinutes } from "@/lib/blog/content";
import { listCityPages, listIndustryPages } from "@/server/suppliers";

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
  const [related, cities, industries] = await Promise.all([
    getRelatedPosts(slug, category, tags),
    listCityPages(8).catch(() => []),
    listIndustryPages(8).catch(() => []),
  ]);

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

            {/* 1. Sourcing Cities Directory */}
            {cities.length > 0 && (
              <div className="mt-12 border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-950">Browse Manufacturers by Sourcing City</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-normal">
                  Explore verified suppliers located in China&apos;s major manufacturing and sourcing hubs:
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {cities.map((city) => (
                    <Link
                      key={city.id}
                      href={`/cities/${city.slug}`}
                      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-800 hover:border-teal-500 hover:shadow-sm transition-all duration-200"
                      title={`${city.city} Suppliers`}
                    >
                      <MapPin size={15} className="text-teal-600 shrink-0 group-hover:text-teal-700 transition-colors" />
                      <span className="leading-tight">{city.city} Suppliers</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Sourcing Industries Directory */}
            {industries.length > 0 && (
              <div className="mt-10 border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-950">Browse Manufacturers by Industry</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-normal">
                  Map factories and exporters classified across core B2B export categories:
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {industries.map((ind) => (
                    <Link
                      key={ind.id}
                      href={`/industries/${ind.slug}`}
                      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-800 hover:border-blue-500 hover:shadow-sm transition-all duration-200"
                      title={`${ind.industryName} Suppliers`}
                    >
                      <Tag size={15} className="text-blue-600 shrink-0 group-hover:text-blue-700 transition-colors" />
                      <span className="leading-tight">{ind.industryName}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Pricing Packages Grid */}
            <div className="mt-12 border-t border-slate-200 pt-8">
              <h3 className="text-lg font-bold text-slate-950">Choose Your Sourcing Plan</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-normal">
                Unlock full access to the China Exporter Database and trade intelligence data feeds:
              </p>
              
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {/* Starter Plan */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950">Starter</h4>
                    <p className="mt-1 text-[10px] text-slate-500 leading-normal">Vet individual exporter entities.</p>
                    <div className="mt-3.5 flex items-baseline text-slate-950">
                      <span className="text-2xl font-extrabold tracking-tight">$49</span>
                      <span className="ml-1 text-[10px] text-slate-500">/ mo</span>
                    </div>
                    <ul className="mt-4 space-y-2.5 text-[10px] text-slate-600">
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Daily supplier search limits</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Verify official registry status</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Basic risk factor flags</li>
                    </ul>
                  </div>
                  <Link href="/pricing" className="mt-5 inline-flex w-full justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold !text-slate-700 hover:bg-slate-50 transition-colors">
                    Subscribe
                  </Link>
                </div>

                {/* Pro Plan */}
                <div className="flex flex-col justify-between rounded-xl border-2 border-teal-600 bg-white p-5 shadow-sm relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-2.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">Most Popular</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950">Pro</h4>
                    <p className="mt-1 text-[10px] text-slate-500 leading-normal">Best for professional B2B importers.</p>
                    <div className="mt-3.5 flex items-baseline text-slate-950">
                      <span className="text-2xl font-extrabold tracking-tight">$199</span>
                      <span className="ml-1 text-[10px] text-slate-500">/ mo</span>
                    </div>
                    <ul className="mt-4 space-y-2.5 text-[10px] text-slate-600">
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Unlimited supplier searches</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Complete customs export records</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Detailed legal dispute records</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Advanced sourcing signals</li>
                    </ul>
                  </div>
                  <Link href="/pricing" className="mt-5 inline-flex w-full justify-center rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold !text-white hover:bg-teal-700 transition-colors shadow-2xs">
                    Start Pro
                  </Link>
                </div>

                {/* Team Plan */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950">Team</h4>
                    <p className="mt-1 text-[10px] text-slate-500 leading-normal">For sourcing teams and organizations.</p>
                    <div className="mt-3.5 flex items-baseline text-slate-950">
                      <span className="text-2xl font-extrabold tracking-tight">$499</span>
                      <span className="ml-1 text-[10px] text-slate-500">/ mo</span>
                    </div>
                    <ul className="mt-4 space-y-2.5 text-[10px] text-slate-600">
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Includes 5 team seats</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />Bulk customs data export (CSV)</li>
                      <li className="flex items-center gap-1.5"><Check size={12} className="text-teal-600 shrink-0" />API raw data access integrations</li>
                    </ul>
                  </div>
                  <Link href="/pricing" className="mt-5 inline-flex w-full justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold !text-slate-700 hover:bg-slate-50 transition-colors">
                    Upgrade
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. Related Articles */}
            {related.length > 0 && (
              <section className="mt-12 border-t border-slate-200 pt-8">
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
            {/* 1. Deep Supplier Database */}
            <div className="rounded-xl bg-slate-950 p-5 text-white shadow-sm border border-slate-800">
              <h2 className="font-bold text-sm">Deep Supplier Database</h2>
              <p className="mt-2 text-xs leading-5 text-slate-300">Filter verified manufacturers by regional clusters, trade mode, company scale, and official website domain availability.</p>
              <Link href="/database" className="mt-4 inline-flex w-full justify-center rounded-lg bg-teal-500 px-3 py-2 text-xs font-bold !text-slate-950 hover:bg-teal-400 transition-colors">
                Search Database
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
