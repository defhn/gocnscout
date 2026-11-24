import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getSitemapData() {
  const [industries, products, cities] = await Promise.all([
    prisma.industryPage.findMany({ where: { isIndexable: true }, select: { slug: true, updatedAt: true } }),
    prisma.productKeywordPage.findMany({ where: { isIndexable: true }, select: { slug: true, updatedAt: true } }),
    prisma.cityPage.findMany({ where: { isIndexable: true }, select: { slug: true, city: true, province: true, updatedAt: true } }),
  ]);

  const cityIndustryGroups = cities.length > 0 ? await prisma.supplier.groupBy({
    by: ["city", "province", "industrySlug"],
    where: {
      isPublished: true,
      city: { in: cities.map((city) => city.city) },
      industrySlug: { not: null },
    },
  }) : [];

  return { industries, products, cities, cityIndustryGroups };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/database",
    "/industries",
    "/products",
    "/cities",
    "/pricing",
    "/sample-report",
    "/sitemap",
    "/data-license",
    "/contact",
    "/methodology",
    "/data-policy",
    "/about",
    "/china-exporter-database",
    "/legal/terms",
    "/legal/privacy",
    "/legal/refund-policy",
    "/legal/acceptable-use",
  ];
  const { industries, products, cities, cityIndustryGroups } = await getSitemapData();

  const cityByKey = new Map(cities.map((city) => [`${city.province}::${city.city}`, city]));
  const cityIndustryRoutes: { url: string; lastModified?: Date }[] = [];
  for (const item of cityIndustryGroups) {
    const matchedCity = item.province ? cityByKey.get(`${item.province}::${item.city}`) : undefined;
    if (matchedCity && item.industrySlug) {
      cityIndustryRoutes.push({
        url: absoluteUrl(`/cities/${matchedCity.slug}/${item.industrySlug}`),
        lastModified: matchedCity.updatedAt || undefined,
      });
    }
  }

  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route || "/") })),
    ...industries.map((item) => ({ url: absoluteUrl(`/industries/${item.slug}`), lastModified: item.updatedAt })),
    ...products.map((item) => ({ url: absoluteUrl(`/products/${item.slug}`), lastModified: item.updatedAt })),
    ...cities.map((item) => ({ url: absoluteUrl(`/cities/${item.slug}`), lastModified: item.updatedAt })),
    ...cityIndustryRoutes,
  ];
}
