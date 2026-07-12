import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { createCheckoutRequest, stripeCreate } = vi.hoisted(() => ({
  createCheckoutRequest: vi.fn(),
  stripeCreate: vi.fn(),
}));

vi.mock("@/server/manual-review/repository", () => ({
  createManualReviewCheckoutRequest: createCheckoutRequest,
  attachCheckoutSession: vi.fn(),
}));

vi.mock("@/server/stripe", () => ({
  stripe: () => ({
    checkout: {
      sessions: {
        create: stripeCreate,
      },
    },
  }),
}));

describe("manual review checkout", () => {
  beforeEach(() => {
    createCheckoutRequest.mockReset();
    stripeCreate.mockReset();
    createCheckoutRequest.mockResolvedValue({ id: "review_123" });
    stripeCreate.mockResolvedValue({ id: "cs_123", url: "https://checkout.stripe.test/session" });
  });

  it("creates a checkout session for a valid manual package", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/manual-review/checkout?package=DECISION_SINGLE&supplierUrl=https%3A%2F%2Fnewo.m.en.alibaba.com&analysisId=analysis_123",
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://checkout.stripe.test/session");
    expect(createCheckoutRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        packageCode: "DECISION_SINGLE",
        supplierUrl: "https://newo.m.en.alibaba.com/",
        analysisId: "analysis_123",
        amountUsdCents: 24900,
      }),
    );
    expect(stripeCreate).toHaveBeenCalledWith(expect.objectContaining({ mode: "payment" }));
  });

  it("rejects unknown packages", async () => {
    const response = await GET(new Request("http://localhost/api/manual-review/checkout?package=NOPE"));
    expect(response.status).toBe(400);
  });
});
