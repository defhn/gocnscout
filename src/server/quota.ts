import type { PlanCode } from "@/generated/prisma/enums";
import { getPlan } from "@/config/plans";
import { prisma } from "@/lib/db";
import { monthKey } from "@/lib/utils";

export function clampSearchPage(planCode: PlanCode | string | null | undefined, page: number) {
  const plan = getPlan(planCode as PlanCode);
  if (plan.searchPages === "unlimited") return Math.max(1, page);
  return Math.min(Math.max(1, page), plan.searchPages);
}

export function searchPageSize(planCode: PlanCode | string | null | undefined) {
  return getPlan(planCode as PlanCode).resultsPerPage;
}

export async function incrementUsage(userId: string, kind: string, amount = 1) {
  const key = monthKey();
  return prisma.usageCounter.upsert({
    where: { userId_kind_periodKey: { userId, kind, periodKey: key } },
    update: { used: { increment: amount } },
    create: { userId, kind, periodKey: key, used: amount },
  });
}

export async function getUsage(userId: string, kind: string) {
  const counter = await prisma.usageCounter.findUnique({
    where: { userId_kind_periodKey: { userId, kind, periodKey: monthKey() } },
  });
  return counter?.used || 0;
}

export async function canViewSupplierProfile(userId: string, planCode: PlanCode) {
  const limit = getPlan(planCode).profileViewsPerMonth;
  if (limit === "unlimited") return true;
  const used = await getUsage(userId, "profile_view");
  return used < limit;
}

export async function canExportRows(userId: string, planCode: PlanCode, requestedRows: number) {
  const limit = getPlan(planCode).exportRowsPerMonth;
  if (!limit) return false;
  const used = await getUsage(userId, "export_rows");
  return used + requestedRows <= limit;
}
