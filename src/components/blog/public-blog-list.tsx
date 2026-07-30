"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calendar, Search } from "lucide-react";

type Post = { slug: string; title: string; excerpt: string | null; coverImage: string | null; category: string | null; tags: string[]; authorName: string | null; publishedAt: string | Date | null };

function sanitizeExcerpt(excerpt: string | null): string {
  if (!excerpt) return "";
  let clean = excerpt;
  // Remove YAML header or frontmatter
  clean = clean.replace(/^(?:yaml\s*)?---[\s\S]*?---/gi, "");
  // Remove author header lines
  clean = clean.replace(/^(?::\s*)?David Chen\s*\|\s*Founder[^\n]*\n?/gi, "");
  // Remove HTML tags
  clean = clean.replace(/<[^>]*>/g, "");
  // Remove markdown symbols
  clean = clean.replace(/[*_#`~]/g, "");
  return clean.trim();
}

function isValidImageUrl(url: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image")
  );
}

export function PublicBlogList({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean) as string[]))];
  
  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const cleanExp = sanitizeExcerpt(post.excerpt);
      const matchesCat = category === "All" || post.category === category;
      const matchesQuery = !query || `${post.title} ${cleanExp}`.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [posts, query, category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 md:flex-row">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search article titles or excerpts..." className="field-input" style={{ paddingLeft: "2.25rem" }} />
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button type="button" key={item} onClick={() => setCategory(item)} className={`rounded px-3 py-2 text-xs font-semibold ${category === item ? "bg-teal-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => {
          const cleanExp = sanitizeExcerpt(post.excerpt);
          const hasImage = isValidImageUrl(post.coverImage) && !imgError[post.slug];

          return (
            <article key={post.slug} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <Link href={`/blog/${post.slug}`} className="flex flex-col flex-1">
                {hasImage ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage!}
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => setImgError((prev) => ({ ...prev, [post.slug]: true }))}
                    />
                  </div>
                ) : (
                  <div className="relative flex aspect-[16/9] w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 p-5 text-white group-hover:from-slate-900 group-hover:to-teal-900 transition-colors">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-teal-300">
                      <span className="uppercase tracking-wider">{post.category || "Supplier Guide"}</span>
                      <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] text-teal-300 border border-teal-500/30">GoCNScout</span>
                    </div>
                    <div className="space-y-1">
                      <p className="line-clamp-2 text-sm font-bold text-slate-100 leading-snug">{post.title}</p>
                      <p className="text-[10px] text-slate-400">Sourcing Intelligence Atlas</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="font-semibold text-teal-700">{post.category || "Sourcing Research"}</span>
                    {post.publishedAt && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="mt-2.5 text-base font-bold leading-snug text-slate-950 group-hover:text-teal-700 transition-colors">
                    {post.title}
                  </h2>
                  
                  {cleanExp && (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                      {cleanExp}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="py-16 text-center text-sm text-slate-500">No matching articles found.</div>}
    </div>
  );
}
