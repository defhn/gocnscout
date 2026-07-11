import type { BillingInterval, ReportType } from "@/generated/prisma/enums";

export const STRIPE_CATALOG = {
  subscriptions: {
    STARTER: {
      month: { name: "gocnscout Starter", amountUsdCents: 4900 },
      year: { name: "gocnscout Starter Annual", amountUsdCents: 47000 },
    },
    PRO: {
      month: { name: "gocnscout Pro", amountUsdCents: 19900 },
      year: { name: "gocnscout Pro Annual", amountUsdCents: 167000 },
    },
    TEAM: {
      month: { name: "gocnscout Team", amountUsdCents: 49900 },
      year: { name: "gocnscout Team Annual", amountUsdCents: 359000 },
    },
  },
  reports: {
    BASIC: { name: "Basic Industry PDF Report", amountUsdCents: 4900 },
    FULL: { name: "Full Industry PDF Report", amountUsdCents: 9900 },
    PREMIUM: { name: "Premium Industry PDF Report", amountUsdCents: 29900 },
    CANTON_FAIR_INTELLIGENCE: {
      name: "China Sourcing Intelligence Report",
      amountUsdCents: 14900,
    },
  },
  customShortlist: { name: "Custom Supplier Shortlist", amountUsdCents: 39900 },
  dataLicenseAnnualUsdCents: 600000,
} as const;

export function getSubscriptionPrice(planCode: "STARTER" | "PRO" | "TEAM", interval: BillingInterval) {
  return STRIPE_CATALOG.subscriptions[planCode][interval === "YEAR" ? "year" : "month"];
}

export function getReportPrice(type: ReportType) {
  return STRIPE_CATALOG.reports[type];
}
