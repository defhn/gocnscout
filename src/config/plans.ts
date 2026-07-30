import type { PlanCode } from "@/generated/prisma/enums";

export type AppPlanCode = "FREE" | "STARTER" | "GROWTH" | "PRO" | "TEAM" | "DATA_LICENSE";

export type PlanDefinition = {
  code: AppPlanCode;
  name: string;
  monthlyUsdCents: number;
  yearlyUsdCents: number | null;
  searchPages: number | "unlimited";
  resultsPerPage: number;
  profileViewsPerMonth: number | "unlimited";
  exportRowsPerMonth: number;
  savedLists: number | "unlimited";
  savedSuppliers: number | "unlimited";
  compareSuppliers: number;
  includedReportsPerMonth: number | 0;
  teamSeats: number;
};

export const PLAN_DEFINITIONS: Record<AppPlanCode, PlanDefinition> = {
  FREE: {
    code: "FREE",
    name: "Free",
    monthlyUsdCents: 0,
    yearlyUsdCents: null,
    searchPages: 2,
    resultsPerPage: 10,
    profileViewsPerMonth: 10,
    exportRowsPerMonth: 0,
    savedLists: 0,
    savedSuppliers: 0,
    compareSuppliers: 0,
    includedReportsPerMonth: 0,
    teamSeats: 1,
  },
  STARTER: {
    code: "STARTER",
    name: "Starter",
    monthlyUsdCents: 3900,
    yearlyUsdCents: 37000,
    searchPages: "unlimited",
    resultsPerPage: 25,
    profileViewsPerMonth: "unlimited",
    exportRowsPerMonth: 500,
    savedLists: 5,
    savedSuppliers: 500,
    compareSuppliers: 5,
    includedReportsPerMonth: 1,
    teamSeats: 1,
  },
  GROWTH: {
    code: "GROWTH",
    name: "Growth",
    monthlyUsdCents: 8900,
    yearlyUsdCents: 85000,
    searchPages: "unlimited",
    resultsPerPage: 50,
    profileViewsPerMonth: "unlimited",
    exportRowsPerMonth: 1500,
    savedLists: 20,
    savedSuppliers: 1500,
    compareSuppliers: 10,
    includedReportsPerMonth: 1,
    teamSeats: 2,
  },
  PRO: {
    code: "PRO",
    name: "Pro",
    monthlyUsdCents: 19900,
    yearlyUsdCents: 189000,
    searchPages: "unlimited",
    resultsPerPage: 100,
    profileViewsPerMonth: "unlimited",
    exportRowsPerMonth: 4000,
    savedLists: "unlimited",
    savedSuppliers: 5000,
    compareSuppliers: 20,
    includedReportsPerMonth: 3,
    teamSeats: 3,
  },
  TEAM: {
    code: "TEAM",
    name: "Team",
    monthlyUsdCents: 49900,
    yearlyUsdCents: 479000,
    searchPages: "unlimited",
    resultsPerPage: 100,
    profileViewsPerMonth: "unlimited",
    exportRowsPerMonth: 15000,
    savedLists: "unlimited",
    savedSuppliers: "unlimited",
    compareSuppliers: 20,
    includedReportsPerMonth: 10,
    teamSeats: 5,
  },
  DATA_LICENSE: {
    code: "DATA_LICENSE",
    name: "Data License",
    monthlyUsdCents: 0,
    yearlyUsdCents: 600000,
    searchPages: "unlimited",
    resultsPerPage: 100,
    profileViewsPerMonth: "unlimited",
    exportRowsPerMonth: 0,
    savedLists: "unlimited",
    savedSuppliers: "unlimited",
    compareSuppliers: 20,
    includedReportsPerMonth: 10,
    teamSeats: 1,
  },
};

export const PAID_PLAN_CODES = ["STARTER", "GROWTH", "PRO", "TEAM"] as const;

export function getPlan(code?: PlanCode | AppPlanCode | null) {
  return PLAN_DEFINITIONS[(code || "FREE") as AppPlanCode] || PLAN_DEFINITIONS.FREE;
}

export function canExport(code?: PlanCode | AppPlanCode | null) {
  return getPlan(code).exportRowsPerMonth > 0;
}

/** STARTER 及以上可见字段：贸易方式、官网、参展等级标签 */
export function canViewStarterFields(code?: PlanCode | AppPlanCode | null): boolean {
  const plan = code as AppPlanCode;
  return plan === "STARTER" || plan === "GROWTH" || plan === "PRO" || plan === "TEAM" || plan === "DATA_LICENSE";
}

/** GROWTH 及以上可见字段：参展具体次数、行业认证明细 */
export function canViewGrowthFields(code?: PlanCode | AppPlanCode | null): boolean {
  const plan = code as AppPlanCode;
  return plan === "GROWTH" || plan === "PRO" || plan === "TEAM" || plan === "DATA_LICENSE";
}

/** PRO 及以上可见字段：供应商硬核信号、诉讼与风控评级 */
export function canViewProFields(code?: PlanCode | AppPlanCode | null): boolean {
  const plan = code as AppPlanCode;
  return plan === "PRO" || plan === "TEAM" || plan === "DATA_LICENSE";
}
