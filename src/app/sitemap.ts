import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

// Do not cache an incomplete sitemap at build time or after a database outage.
// A failed request can be retried as soon as the database is available again.
export const dynamic = "force-dynamic";

async function getSitemapData() {
  const [industries, products, cities, blogPosts] = await Promise.all([
    prisma.industryPage.findMany({ where: { isIndexable: true }, select: { slug: true, updatedAt: true } }),
    prisma.productKeywordPage.findMany({ where: { isIndexable: true }, select: { slug: true, updatedAt: true } }),
    prisma.cityPage.findMany({ where: { isIndexable: true }, select: { slug: true, city: true, province: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const cityIndustryGroups = cities.length > 0 ? await prisma.supplier.groupBy({
    by: ["province", "city", "industrySlug"],
    where: {
      isPublished: true,
      city: { in: cities.map((city) => city.city) },
      industrySlug: { not: null },
    },
  }) : [];

  return { industries, products, cities, blogPosts, cityIndustryGroups };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/database",
    "/industries",
    "/products",
    "/cities",
    "/blog",
    "/blog/vetting-suppliers-china",
    "/pricing",
    "/sitemap",
    "/data-license",
    "/contact",
    "/custom-shortlist",
    "/methodology",
    "/data-policy",
    "/about",
    "/china-exporter-database",
    "/legal/terms",
    "/legal/privacy",
    "/legal/refund-policy",
    "/legal/acceptable-use",
  ];
  const { industries, products, cities, blogPosts, cityIndustryGroups } = await getSitemapData();

  const cityIndustryRoutes: { url: string }[] = [];
  const citiesByLocation = new Map(cities.map((city) => [JSON.stringify([city.province, city.city]), city]));
  for (const item of cityIndustryGroups) {
    const matchedCity = citiesByLocation.get(JSON.stringify([item.province, item.city]));
    if (matchedCity && item.industrySlug) {
      cityIndustryRoutes.push({
        url: absoluteUrl(`/cities/${matchedCity.slug}/${item.industrySlug}`),
      });
    }
  }

  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route || "/") })),
    ...industries.map((item) => ({ url: absoluteUrl(`/industries/${item.slug}`), lastModified: item.updatedAt })),
    ...products.map((item) => ({ url: absoluteUrl(`/products/${item.slug}`), lastModified: item.updatedAt })),
    ...cities.map((item) => ({ url: absoluteUrl(`/cities/${item.slug}`), lastModified: item.updatedAt })),
    ...cityIndustryRoutes,
    ...blogPosts.filter((item) => item.slug !== "vetting-suppliers-china").map((item) => ({ url: absoluteUrl(`/blog/${item.slug}`), lastModified: item.updatedAt })),
  ];
}
