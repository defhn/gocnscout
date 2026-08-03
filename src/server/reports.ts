import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const PUBLIC_CONTENT_CACHE_SECONDS = 60 * 60 * 24 * 7;

export async function listPublishedReports() {
  return prisma.report.findMany({
    where: { status: "PUBLISHED", type: "FULL" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPublishedReport(slug: string) {
  return prisma.report.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
}

export async function userOwnsReport(userId: string, reportId: string) {
  const purchase = await prisma.reportPurchase.findFirst({
    where: { userId, reportId, status: { in: ["PAID", "FULFILLED"] } },
  });
  return Boolean(purchase);
}

export const listPublishedReportsCached = unstable_cache(
  listPublishedReports,
  ["public-report-list-v1"],
  { revalidate: PUBLIC_CONTENT_CACHE_SECONDS, tags: ["public-reports"] },
);

export const getPublishedReportCached = unstable_cache(
  getPublishedReport,
  ["public-report-by-slug-v1"],
  { revalidate: PUBLIC_CONTENT_CACHE_SECONDS, tags: ["public-reports"] },
);
