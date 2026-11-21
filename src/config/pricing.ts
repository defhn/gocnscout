import type { BillingInterval } from "@/generated/prisma/enums";

export const STRIPE_CATALOG = {
  subscriptions: {
    STARTER: {
      month: { name: "gocnscout Starter", amountUsdCents: 3900 },
      year: { name: "gocnscout Starter Annual", amountUsdCents: 37000 },
    },
    GROWTH: {
      month: { name: "gocnscout Growth", amountUsdCents: 8900 },
      year: { name: "gocnscout Growth Annual", amountUsdCents: 85000 },
    },
    PRO: {
      month: { name: "gocnscout Pro", amountUsdCents: 19900 },
      year: { name: "gocnscout Pro Annual", amountUsdCents: 189000 },
    },
    TEAM: {
      month: { name: "gocnscout Team", amountUsdCents: 49900 },
      year: { name: "gocnscout Team Annual", amountUsdCents: 479000 },
    },
  },
  customShortlist: { name: "Custom Supplier Shortlist", amountUsdCents: 39900 },
  dataLicenseAnnualUsdCents: 600000,
} as const;

export function getSubscriptionPrice(planCode: "STARTER" | "GROWTH" | "PRO" | "TEAM", interval: BillingInterval) {
  return STRIPE_CATALOG.subscriptions[planCode][interval === "YEAR" ? "year" : "month"];
}
