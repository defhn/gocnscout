import { prisma } from "@/lib/db";

export async function listPublishedReports() {
  return prisma.report.findMany({
    where: { status: "PUBLISHED" },
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
