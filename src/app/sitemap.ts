import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/industries",
    "/products",
    "/cities",
    "/pricing",
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
    prisma.cityPage.findMany({ where: { isIndexable: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.supplier.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true }, take: 50000 }).catch(() => []),
    prisma.report.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }).catch(() => []),
  ]);

  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route || "/"), lastModified: new Date() })),
    ...industries.map((item) => ({ url: absoluteUrl(`/industries/${item.slug}`), lastModified: item.updatedAt })),
    ...products.map((item) => ({ url: absoluteUrl(`/products/${item.slug}`), lastModified: item.updatedAt })),
    ...cities.map((item) => ({ url: absoluteUrl(`/cities/${item.slug}`), lastModified: item.updatedAt })),
    ...suppliers.map((item) => ({ url: absoluteUrl(`/suppliers/${item.slug}`), lastModified: item.updatedAt })),
    ...reports.map((item) => ({ url: absoluteUrl(`/reports/${item.slug}`), lastModified: item.updatedAt })),
  ];
}
