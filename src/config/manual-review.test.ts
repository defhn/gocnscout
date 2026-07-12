import { describe, expect, it } from "vitest";
import { getManualReviewPackage, MANUAL_REVIEW_COMPARISON_ROWS, MANUAL_REVIEW_PACKAGES, SINGLE_SUPPLIER_MANUAL_REVIEW_PACKAGES } from "./manual-review";

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

  it("exposes only the $149 and $249 offers for the result-page sidebar", () => {
    expect(SINGLE_SUPPLIER_MANUAL_REVIEW_PACKAGES.map((pkg) => [pkg.code, pkg.amountUsdCents])).toEqual([
      ["IDENTITY_SINGLE", 14900],
      ["DECISION_SINGLE", 24900],
    ]);
  });

  it("spells out the $149 identity-check delivery scope from the report plan", () => {
    const identityCopy = getManualReviewPackage("IDENTITY_SINGLE").features.join(" ");

    expect(identityCopy).toContain("company name");
    expect(identityCopy).toContain("registration number");
    expect(identityCopy).toContain("unified social credit code");
    expect(identityCopy).toContain("registered address");
    expect(identityCopy).toContain("legal representative");
    expect(identityCopy).toContain("registered capital");
    expect(identityCopy).toContain("establishment year");
    expect(identityCopy).toContain("business status");
    expect(identityCopy).toContain("business scope");
    expect(identityCopy).toContain("import/export-related fields");
    expect(identityCopy).toContain("store name");
    expect(identityCopy).toContain("address");
    expect(identityCopy).toContain("contact details");
    expect(identityCopy).toContain("product category");
    expect(identityCopy).toContain("business abnormality");
    expect(identityCopy).toContain("serious violation");
    expect(identityCopy).toContain("dishonest judgment debtor");
    expect(identityCopy).toContain("administrative penalty");
    expect(identityCopy).toContain("official site is reachable");
    expect(identityCopy).toContain("initial confidence");
    expect(identityCopy).toContain("documents the buyer should request");
  });

  it("spells out the $249 decision-review scope and limits social checks to Xiaohongshu, Douyin, and Zhihu", () => {
    const decisionCopy = getManualReviewPackage("DECISION_SINGLE").features.join(" ");

    expect(decisionCopy).toContain("Everything in Supplier Identity Check");
    expect(decisionCopy).toContain("shareholder structure");
    expect(decisionCopy).toContain("group / subsidiary signals");
    expect(decisionCopy).toContain("entity-mixing risk");
    expect(decisionCopy).toContain("historical shareholder");
    expect(decisionCopy).toContain("litigation types");
    expect(decisionCopy).toContain("hearing trends");
    expect(decisionCopy).toContain("enforcement / dishonest debtor risk");
    expect(decisionCopy).toContain("administrative penalties");
    expect(decisionCopy).toContain("equity pledge");
    expect(decisionCopy).toContain("certificates");
    expect(decisionCopy).toContain("administrative licenses");
    expect(decisionCopy).toContain("import/export credit");
    expect(decisionCopy).toContain("insured employee count");
    expect(decisionCopy).toContain("trademarks");
    expect(decisionCopy).toContain("patents");
    expect(decisionCopy).toContain("software copyrights");
    expect(decisionCopy).toContain("website filings");
    expect(decisionCopy).toContain("standards information");
    expect(decisionCopy).toContain("Xiaohongshu");
    expect(decisionCopy).toContain("Douyin");
    expect(decisionCopy).toContain("Zhihu");
    expect(decisionCopy).toContain("whether to contact");
    expect(decisionCopy).toContain("request samples");
    expect(decisionCopy).toContain("payment-before-order notes");
    expect(decisionCopy).not.toContain("other public social");
    expect(decisionCopy).not.toContain("WeChat");
    expect(decisionCopy).not.toContain("Weibo");
  });

  it("defines a pricing-page comparison between Supplier Identity Check and Buyer Decision Review", () => {
    expect(MANUAL_REVIEW_COMPARISON_ROWS.map((row) => row.feature)).toEqual([
      "Best for",
      "Company identity fields",
      "Alibaba / website consistency",
      "Basic risk screen",
      "Ownership and control",
      "Legal and operating-risk interpretation",
      "Operating capability",
      "IP and brand signals",
      "Social / content platforms",
      "Buyer decision output",
    ]);

    const socialRow = MANUAL_REVIEW_COMPARISON_ROWS.find((row) => row.feature === "Social / content platforms");
    expect(socialRow?.identity).toBe("Not included.");
    expect(socialRow?.decision).toContain("Xiaohongshu");
    expect(socialRow?.decision).toContain("Douyin");
    expect(socialRow?.decision).toContain("Zhihu");
  });
});
