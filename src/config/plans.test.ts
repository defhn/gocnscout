import { describe, expect, it } from "vitest";
import { getPlan, PLAN_DEFINITIONS } from "@/config/plans";

describe("plan definitions", () => {
  it("keeps free plan strict", () => {
    expect(PLAN_DEFINITIONS.FREE.searchPages).toBe(2);
    expect(PLAN_DEFINITIONS.FREE.resultsPerPage).toBe(10);
    expect(PLAN_DEFINITIONS.FREE.profileViewsPerMonth).toBe(5);
    expect(PLAN_DEFINITIONS.FREE.exportRowsPerMonth).toBe(0);
  });

  it("uses requested export quotas", () => {
    expect(PLAN_DEFINITIONS.STARTER.exportRowsPerMonth).toBe(200);
    expect(PLAN_DEFINITIONS.PRO.exportRowsPerMonth).toBe(1600);
    expect(PLAN_DEFINITIONS.TEAM.exportRowsPerMonth).toBe(8000);
  });

  it("falls back to free for missing plan", () => {
    expect(getPlan(null).code).toBe("FREE");
  });
});
