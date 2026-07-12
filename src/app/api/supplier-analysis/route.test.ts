import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { createAnalysis } = vi.hoisted(() => ({
  createAnalysis: vi.fn(),
}));

vi.mock("@/server/analysis/repository", () => ({
  createAnalysisRecord: createAnalysis,
}));

vi.mock("@/server/analysis/service", () => ({
  analyzeSupplierUrl: vi.fn(async (url: string) => ({
    sourceType: "WEBSITE",
    sourceUrl: url,
    normalizedUrl: url,
    companyName: "Example Co., Ltd.",
    summary: "Public-source first pass.",
    sources: [],
    unavailable: [],
    riskFlags: [],
    buyerQuestions: [],
    nextSteps: [],
    limitations: [],
    generatedAt: new Date().toISOString(),
  })),
}));

describe("supplier analysis API", () => {
  beforeEach(() => {
    createAnalysis.mockReset();
    createAnalysis.mockResolvedValue({
      id: "analysis_123",
      resultJson: { summary: "Public-source first pass." },
    });
  });

  it("rejects unsafe urls", async () => {
    const response = await POST(
      new Request("http://localhost/api/supplier-analysis", {
        method: "POST",
        body: JSON.stringify({ url: "http://localhost:3000" }),
      }),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Enter a valid public supplier URL.",
      },
    });
  });

  it("persists an analysis result", async () => {
    const response = await POST(
      new Request("http://localhost/api/supplier-analysis", {
        method: "POST",
        body: JSON.stringify({ url: "https://example.com" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      analysisId: "analysis_123",
      redirectTo: "/supplier-check/analysis_123",
    });
    expect(createAnalysis).toHaveBeenCalledWith(expect.objectContaining({ companyName: "Example Co., Ltd." }));
  });
});
