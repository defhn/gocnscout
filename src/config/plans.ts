import type { PlanCode } from "@/generated/prisma/enums";

export type AppPlanCode = "FREE" | "STARTER" | "PRO" | "TEAM" | "DATA_LICENSE";

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
    profileViewsPerMonth: 5,
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
    monthlyUsdCents: 4900,
    yearlyUsdCents: 49000,
    searchPages: "unlimited",
    resultsPerPage: 25,
    profileViewsPerMonth: "unlimited",
    exportRowsPerMonth: 200,
    savedLists: 5,
    savedSuppliers: 200,
    compareSuppliers: 5,
    includedReportsPerMonth: 1,
    teamSeats: 1,
  },
  PRO: {
    code: "PRO",
    name: "Pro",
    monthlyUsdCents: 19900,
    yearlyUsdCents: 199000,
    searchPages: "unlimited",
    resultsPerPage: 50,
    profileViewsPerMonth: "unlimited",
    exportRowsPerMonth: 1600,
    savedLists: "unlimited",
    savedSuppliers: 3000,
    compareSuppliers: 10,
    includedReportsPerMonth: 3,
    teamSeats: 1,
  },
  TEAM: {
    code: "TEAM",
    name: "Team",
    monthlyUsdCents: 49900,
    yearlyUsdCents: 499000,
    searchPages: "unlimited",
    resultsPerPage: 100,
    profileViewsPerMonth: "unlimited",
    exportRowsPerMonth: 8000,
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

export const PAID_PLAN_CODES = ["STARTER", "PRO", "TEAM"] as const;

export function getPlan(code?: PlanCode | AppPlanCode | null) {
  return PLAN_DEFINITIONS[(code || "FREE") as AppPlanCode] || PLAN_DEFINITIONS.FREE;
}

export function canExport(code?: PlanCode | AppPlanCode | null) {
  return getPlan(code).exportRowsPerMonth > 0;
}

/** STARTER 及以上可见字段：贸易方式、官网、参展等级标签 */
export function canViewStarterFields(code?: PlanCode | AppPlanCode | null): boolean {
  const plan = code as AppPlanCode;
  return plan === "STARTER" || plan === "PRO" || plan === "TEAM" || plan === "DATA_LICENSE";
}

/** PRO 及以上可见字段：参展具体次数、供应商信号（获奖/认证） */
export function canViewProFields(code?: PlanCode | AppPlanCode | null): boolean {
  const plan = code as AppPlanCode;
  return plan === "PRO" || plan === "TEAM" || plan === "DATA_LICENSE";
}
