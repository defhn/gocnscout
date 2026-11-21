import type { PlanCode } from "@/generated/prisma/enums";
import { getPlan } from "@/config/plans";
import { prisma } from "@/lib/db";
import { monthKey } from "@/lib/utils";

export const SEARCH_PAGE_SIZES = [20, 50, 100] as const;
export const DEFAULT_SEARCH_PAGE_SIZE = 20;
export const MAX_SEARCH_PAGE = 1000;

/** 企业搜索对所有访客免费开放,这里只做上限保护,不再按套餐限制翻页数量。 */
export function clampSearchPage(page: number) {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.floor(page)), MAX_SEARCH_PAGE);
}

/** 每页条数只允许 20 / 50 / 100,其余值回落到默认值。 */
export function resolveSearchPageSize(requested: number) {
  return (SEARCH_PAGE_SIZES as readonly number[]).includes(requested) ? requested : DEFAULT_SEARCH_PAGE_SIZE;
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

export async function canExportRows(userId: string, planCode: PlanCode, requestedRows: number) {
  const limit = getPlan(planCode).exportRowsPerMonth;
  if (!limit) return false;
  const used = await getUsage(userId, "export_rows");
  return used + requestedRows <= limit;
}
