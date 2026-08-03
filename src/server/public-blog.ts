import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const PUBLIC_CONTENT_CACHE_SECONDS = 60 * 60 * 24 * 7;

export const listPublishedBlogPostsCached = unstable_cache(
  async () => prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      tags: true,
      authorName: true,
      publishedAt: true,
    },
  }),
  ["public-blog-list-v1"],
  { revalidate: PUBLIC_CONTENT_CACHE_SECONDS, tags: ["public-blog"] },
);

export const getPublishedBlogPostCached = unstable_cache(
  async (slug: string) => prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  }),
  ["public-blog-post-v1"],
  { revalidate: PUBLIC_CONTENT_CACHE_SECONDS, tags: ["public-blog"] },
);

export const getRelatedBlogPostsCached = unstable_cache(
  async (slug: string, category?: string | null, tags: string[] = []) => {
    const signals = [
      ...(category ? [{ category }] : []),
      ...(tags.length ? [{ tags: { hasSome: tags } }] : []),
    ];

    return prisma.blogPost.findMany({
      where: {
        slug: { not: slug },
        status: "PUBLISHED",
        ...(signals.length ? { OR: signals } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, excerpt: true, category: true },
    });
  },
  ["public-related-blog-posts-v1"],
  { revalidate: PUBLIC_CONTENT_CACHE_SECONDS, tags: ["public-blog"] },
);

export const listVettingSeriesPostsCached = unstable_cache(
  async () => prisma.blogPost.findMany({
    where: { status: "PUBLISHED", tags: { hasSome: ["vetting-series", "supplier-vetting"] } },
    orderBy: { publishedAt: "asc" },
    select: { slug: true, title: true, excerpt: true, publishedAt: true },
  }),
  ["public-vetting-series-v1"],
  { revalidate: PUBLIC_CONTENT_CACHE_SECONDS, tags: ["public-blog"] },
);
