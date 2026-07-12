import { describe, expect, it } from "vitest";
import { buildSnapshot, getDisplayFacts, sanitizeDisplayText } from "./analysis-result";
import type { SupplierAnalysisResult } from "@/server/analysis/contract";

describe("analysis result display helpers", () => {
  it("removes links and image fragments from snapshot text", () => {
    const result = {
      sourceType: "ALIBABA_STORE",
      sourceUrl: "https://example.com/product",
      normalizedUrl: "https://supplier.m.en.alibaba.com/",
      companyName: "Supplier Co., Ltd.",
      summary: "Summary",
      sources: [
        {
          label: "Alibaba storefront",
          url: "https://supplier.m.en.alibaba.com/",
          status: "AVAILABLE",
          facts: [
            "Product signal: Face Cream & Lotion![](https://s.alicdn.com/@img/imgextra/i4/O1CN.jpg) [Private-Label-Strong-Effective-Whitening-Freckle-Cream.jpg?hasNWGrade=1](https://www.alibaba.com/product-detail/P) Private Label Strong Effective Whitening Freckle Cream Removal Melasma Dark Spot Melanin Remover Brighten Skin Fac",
          ],
        },
      ],
      unavailable: [],
      riskFlags: ["Initial buyer confidence: Needs manual verification."],
      buyerQuestions: [],
      nextSteps: [],
      limitations: [],
      generatedAt: "2026-07-12T00:00:00.000Z",
    } satisfies SupplierAnalysisResult;

    const snapshot = buildSnapshot(result);

    expect(snapshot.productSignals).not.toContain("https://");
    expect(snapshot.productSignals).not.toContain("![](");
    expect(snapshot.productSignals).not.toContain(".jpg");
    expect(snapshot.productSignals.length).toBeLessThanOrEqual(180);
  });

  it("sanitizes direct display text", () => {
    expect(sanitizeDisplayText("abc https://example.com/a.jpg?x=1 ![](https://img.com/a.png) 鈮?h")).toBe("abc <=h");
    expect(sanitizeDisplayText("Face Cream & Lotion![](")).toBe("Face Cream & Lotion");
    expect(sanitizeDisplayText("[Salmon DNA PDRN")).toBe("Salmon DNA PDRN");
    expect(sanitizeDisplayText("Korean Skincare Ampoule Serum](")).toBe("Korean Skincare Ampoule Serum");
    expect(sanitizeDisplayText('Korean Skincare Ampoule Serum")')).toBe("Korean Skincare Ampoule Serum");
    expect(sanitizeDisplayText("Guangzhou Biying Cosmetics Co., Ltd. Guangzhou Biying Cosmetics Co., Ltd.")).toBe(
      "Guangzhou Biying Cosmetics Co., Ltd.",
    );
  });

  it("deduplicates and limits displayed evidence facts", () => {
    const facts = getDisplayFacts([
      "Product signal: Korean Skincare Ampoule Serum",
      'Product signal: Korean Skincare Ampoule Serum")',
      "Product signal: Salmon DNA PDRN Ampoule Serum Booting Anti Aging Facial Skin Booster Brightening Anti-Wri",
      "Company name: Guangzhou Biying Cosmetics Co., Ltd. Guangzhou Biying Cosmetics Co., Ltd.",
      "Product signal:",
    ]);

    expect(facts).toEqual([
      "Product signal: Korean Skincare Ampoule Serum",
      "Product signal: Salmon DNA PDRN Ampoule Serum Booting Anti Aging Facial Skin Booster Brightening Anti-Wri",
      "Company name: Guangzhou Biying Cosmetics Co., Ltd.",
    ]);
  });

  it("builds website-specific snapshot fields for company website analyses", () => {
    const result = {
      sourceType: "WEBSITE",
      sourceUrl: "http://www.shanghai-alix.com/product.htm",
      normalizedUrl: "http://www.shanghai-alix.com/",
      companyName: "Alix Industrial Co., Ltd.",
      summary: "Website footprint analysis.",
      sources: [
        {
          label: "Website homepage",
          url: "http://www.shanghai-alix.com/",
          status: "AVAILABLE",
          facts: [
            "Company name: Alix Industrial Co., Ltd.",
            "Website contact signal: public email or phone is present",
            "Website address signal: Shanghai address mentioned",
            "Certificate claim: SGS",
            "Certificate claim: ISO9001",
            "Product category signal: stationery",
          ],
        },
      ],
      unavailable: [],
      riskFlags: ["Initial buyer confidence: Medium public-source coverage, needs manual verification before purchase decisions."],
      buyerQuestions: [],
      nextSteps: [],
      limitations: [],
      generatedAt: "2026-07-12T00:00:00.000Z",
    } satisfies SupplierAnalysisResult;

    const snapshot = buildSnapshot(result);

    expect(snapshot.marketplaceSignals).toContain("Website contact signal");
    expect(snapshot.marketplaceSignals).toContain("Shanghai address");
    expect(snapshot.registrationSignals).toContain("Company name: Alix Industrial Co., Ltd.");
    expect(snapshot.registrationSignals).toContain("Certificate claim: SGS");
  });
});
