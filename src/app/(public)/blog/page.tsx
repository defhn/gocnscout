import { BookOpen, Calendar, ArrowRight, User } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { createMetadata } from "@/config/seo";
import { BLOG_POSTS } from "@/config/blog-data";

export const metadata = createMetadata({
  title: "Sourcing & Procurement Guides Blog | China Manufacturing Insights",
  description: "Read expert guides on verifying Chinese manufacturers, mapping export clusters, and avoiding import scams.",
  path: "/blog",
});

export default function BlogListPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      
      <div className="container-page pb-20">
        {/* Header section */}
        <div className="max-w-4xl py-6 mb-8 border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Sourcing Wisdom & Guides</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            China Sourcing Intelligence Blog
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            Articles, guides, and compliance notes curated by B2B sourcing agents to streamline your manufacturing vetting process.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Article List */}
          <div className="space-y-6">
            {BLOG_POSTS.map((post) => (
              <Card 
                key={post.slug} 
                className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                  {/* Thumbnail Mockup */}
                  <div className="w-full md:w-48 h-32 shrink-0 rounded-xl bg-slate-950/90 flex flex-col justify-between p-4 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
                    <BookOpen className="h-6 w-6 text-teal-400" />
                    <div className="text-[10px] font-mono text-slate-400">gocnscout.com/blog</div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta */}
                      <div className="flex items-center space-x-4 text-xs text-slate-500 mb-2">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(post.datePublished).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {post.author}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-950 group-hover:text-teal-600 transition-colors">
                        <a href={`/blog/${post.slug}`}>{post.title}</a>
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {post.description}
                      </p>
                    </div>

                    <a 
                      href={`/blog/${post.slug}`} 
                      className="inline-flex items-center text-xs font-bold text-teal-600 mt-4 group-hover:text-teal-700"
                    >
                      Read full guide <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Database Promo Widget */}
            <Card className="border border-slate-200 bg-slate-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-lg font-bold">Search Real Exporters</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Stop relying on static PDFs or outdated lists. Filter 120,000+ export manufacturers directly in our real-time database dashboard.
              </p>
              <ButtonLink href="/database" className="mt-5 w-full justify-center bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2">
                Launch Search Engine
              </ButtonLink>
            </Card>

            {/* Sourcing Best Practices */}
            <Card className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-950">Vetting Rules of Thumb</h3>
              <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
                <div>
                  <h4 className="font-semibold text-slate-900">Never Skip Samples</h4>
                  <p className="mt-0.5">Order golden samples before executing main PO agreements or wiring advance payments.</p>
                </div>
                <div className="h-px bg-slate-100" />
                <div>
                  <h4 className="font-semibold text-slate-900">Check Business Scope</h4>
                  <p className="mt-0.5">Ensure local business licenses align with target materials to avoid broker markups.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
