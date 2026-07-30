import { describe, expect, it } from "vitest";
import { getPlan, PLAN_DEFINITIONS } from "@/config/plans";

describe("plan definitions", () => {
  it("keeps free plan strict with soft masking", () => {
    expect(PLAN_DEFINITIONS.FREE.searchPages).toBe(2);
    expect(PLAN_DEFINITIONS.FREE.resultsPerPage).toBe(10);
    expect(PLAN_DEFINITIONS.FREE.profileViewsPerMonth).toBe(10);
    expect(PLAN_DEFINITIONS.FREE.exportRowsPerMonth).toBe(0);
  });

  it("uses requested export quotas and new price tiers", () => {
    expect(PLAN_DEFINITIONS.STARTER.exportRowsPerMonth).toBe(500);
    expect(PLAN_DEFINITIONS.STARTER.monthlyUsdCents).toBe(3900);

    expect(PLAN_DEFINITIONS.GROWTH.exportRowsPerMonth).toBe(1500);
    expect(PLAN_DEFINITIONS.GROWTH.monthlyUsdCents).toBe(8900);

    expect(PLAN_DEFINITIONS.PRO.exportRowsPerMonth).toBe(4000);
    expect(PLAN_DEFINITIONS.PRO.monthlyUsdCents).toBe(19900);

    expect(PLAN_DEFINITIONS.TEAM.exportRowsPerMonth).toBe(15000);
    expect(PLAN_DEFINITIONS.TEAM.monthlyUsdCents).toBe(49900);
  });

  it("falls back to free for missing plan", () => {
    expect(getPlan(null).code).toBe("FREE");
  });
});
