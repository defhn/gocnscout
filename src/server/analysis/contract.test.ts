import { describe, expect, it } from "vitest";
import {
  buildAnalysisSources,
  normalizeAnalysisUrl,
  sanitizeSourceLinks,
  serializeAnalysisResult,
} from "./contract";

describe("supplier analysis contract", () => {
  it("accepts public http urls and rejects unsafe urls", () => {
    expect(normalizeAnalysisUrl("dgypsw.m.en.alibaba.com")).toEqual({
      normalizedUrl: "https://dgypsw.m.en.alibaba.com/",
      sourceType: "ALIBABA_STORE",
    });

    expect(() => normalizeAnalysisUrl("ftp://example.com")).toThrow("public http");
    expect(() => normalizeAnalysisUrl("http://localhost:3000")).toThrow("public http");
    expect(() => normalizeAnalysisUrl("http://192.168.1.8")).toThrow("public http");
  });

  it("derives only public Alibaba evidence pages", () => {
    const sources = buildAnalysisSources(
      "https://newo.m.en.alibaba.com/?productId=1601382467425&from=detail_company_card",
    );

    expect(sources.map((source) => source.url)).toEqual([
      "https://newo.m.en.alibaba.com/?productId=1601382467425&from=detail_company_card",
      "https://newo.en.alibaba.com/company_profile/feedback.html",
      "https://newo.en.alibaba.com/company_profile/trustpass_profile.html?certification_type=intl_assessment",
      "https://newo.m.en.alibaba.com/productlist.html",
    ]);
    expect(sources.map((source) => source.label)).toEqual([
      "Alibaba storefront",
      "Alibaba ratings",
      "Alibaba TrustPass summary",
      "Alibaba product list",
    ]);
  });

  it("removes session, contact, and messaging links before persistence", () => {
    const links = sanitizeSourceLinks([
      "https://newo.en.alibaba.com/company_profile/feedback.html",
      "https://message.alibaba.com/msgsend/contact.htm?token=abc",
      "https://newo.en.alibaba.com/contactinfo.html",
      "javascript:void(0)",
    ]);

    expect(links).toEqual(["https://newo.en.alibaba.com/company_profile/feedback.html"]);
  });

  it("serializes bounded public results", () => {
    const result = serializeAnalysisResult({
      sourceType: "ALIBABA_STORE",
      sourceUrl: "https://newo.m.en.alibaba.com/",
      normalizedUrl: "https://newo.m.en.alibaba.com/",
      companyName: "Newo",
      sources: [
        {
          label: "Alibaba storefront",
          url: "https://newo.m.en.alibaba.com/",
          status: "AVAILABLE",
          facts: ["Company name: Newo", "Store years: 1YR"],
        },
      ],
      unavailable: ["Contact details are not collected by this tool."],
      summary: "Public Alibaba storefront signals were found.",
      riskFlags: [],
      buyerQuestions: ["Ask for business license and export documents."],
      nextSteps: ["Request samples before bulk payment."],
    });

    expect(result.sources[0]?.facts).toHaveLength(2);
    expect(result.limitations.join(" ")).toContain("publicly reachable");
    expect(JSON.stringify(result)).not.toContain("message.alibaba.com");
  });
});
