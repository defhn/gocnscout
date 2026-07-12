import { describe, expect, it } from "vitest";
import { getManualReviewPackage, MANUAL_REVIEW_PACKAGES } from "./manual-review";

describe("manual review packages", () => {
  it("defines two single-supplier offers and two three-supplier bundles", () => {
    expect(MANUAL_REVIEW_PACKAGES.map((pkg) => [pkg.code, pkg.amountUsdCents, pkg.supplierSlots])).toEqual([
      ["IDENTITY_SINGLE", 14900, 1],
      ["IDENTITY_BUNDLE", 39900, 3],
      ["DECISION_SINGLE", 24900, 1],
      ["DECISION_BUNDLE", 49900, 3],
    ]);
  });

  it("looks up packages by code", () => {
    expect(getManualReviewPackage("DECISION_SINGLE").name).toBe("Buyer Decision Review");
    expect(() => getManualReviewPackage("NOPE")).toThrow("Unknown manual review package");
  });
});
