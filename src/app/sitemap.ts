import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/database",
    "/industries",
    "/products",
    "/cities",
    "/pricing",
    "/sitemap",
    "/reports",
    "/data-license",
    "/contact",
    "/custom-shortlist",
    "/methodology",
    "/data-policy",
    "/about",
    "/china-exporter-database",
    "/exhibitor-intelligence-report",
    "/legal/terms",
    "/legal/privacy",
    "/legal/refund-policy",
    "/legal/acceptable-use",
  ];
  const [industries, products, cities, suppliers, reports] = await Promise.all([
    prisma.industryPage.findMany({ where: { isIndexable: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.productKeywordPage.findMany({ where: { isIndexable: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.cityPage.findMany({ where: { isIndexable: true }, select: { slug: true, city: true, updatedAt: true } }).catch(() => []),
    prisma.supplier.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true }, take: 50000 }).catch(() => []),
    prisma.report.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }).catch(() => []),
  ]);

  // 查询这 56 个可索引城市拥有的二级行业分类，进行 sitemap 关联生成
  const cityIndustryGroups = cities.length > 0 ? await prisma.supplier.groupBy({
    by: ["city", "industrySlug"],
    where: {
      isPublished: true,
      city: { in: cities.map(c => c.city) },
      industrySlug: { not: null }
    }
  }).catch(() => []) : [];

  const cityIndustryRoutes: { url: string; lastModified?: Date }[] = [];
  for (const item of cityIndustryGroups) {
    const matchedCity = cities.find(c => c.city === item.city);
    if (matchedCity && item.industrySlug) {
      cityIndustryRoutes.push({
        url: absoluteUrl(`/cities/${matchedCity.slug}/${item.industrySlug}`),
        lastModified: matchedCity.updatedAt || undefined
      });
    }
  }

  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route || "/"), lastModified: new Date() })),
    ...industries.map((item) => ({ url: absoluteUrl(`/industries/${item.slug}`), lastModified: item.updatedAt })),
    ...products.map((item) => ({ url: absoluteUrl(`/products/${item.slug}`), lastModified: item.updatedAt })),
    ...cities.map((item) => ({ url: absoluteUrl(`/cities/${item.slug}`), lastModified: item.updatedAt })),
    ...cityIndustryRoutes,
    ...suppliers.map((item) => ({ url: absoluteUrl(`/suppliers/${item.slug}`), lastModified: item.updatedAt })),
    ...reports.map((item) => ({ url: absoluteUrl(`/reports/${item.slug}`), lastModified: item.updatedAt })),
  ];
}
