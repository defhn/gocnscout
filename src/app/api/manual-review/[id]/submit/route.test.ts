import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { submitRequest, getRequest, sendEmail } = vi.hoisted(() => ({
  submitRequest: vi.fn(),
  getRequest: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/server/manual-review/repository", () => ({
  getManualReviewRequest: getRequest,
  submitManualReviewRequest: submitRequest,
}));

vi.mock("@/server/email", () => ({
  sendTransactionalEmail: sendEmail,
}));

describe("manual review submit API", () => {
  beforeEach(() => {
    getRequest.mockReset();
    submitRequest.mockReset();
    sendEmail.mockReset();
    getRequest.mockResolvedValue({ id: "review_123", status: "PAID", packageCode: "DECISION_SINGLE" });
    submitRequest.mockResolvedValue({ id: "review_123", buyerEmail: "buyer@example.com", status: "SUBMITTED" });
  });

  it("submits paid review details and emails the admin", async () => {
    const response = await POST(
      new Request("http://localhost/api/manual-review/review_123/submit", {
        method: "POST",
        body: JSON.stringify({
          buyerName: "Buyer",
          buyerEmail: "buyer@example.com",
          supplierUrl: "https://newo.m.en.alibaba.com",
          targetProduct: "Vitamin C serum",
          destinationMarket: "United States",
          procurementStage: "Before sample order",
        }),
      }),
      { params: Promise.resolve({ id: "review_123" }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, delivery: "48 hours" });
    expect(submitRequest).toHaveBeenCalledWith("review_123", expect.objectContaining({ targetProduct: "Vitamin C serum" }));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.stringContaining("Manual review submitted") }));
  });

  it("rejects unpaid review details", async () => {
    getRequest.mockResolvedValue({ id: "review_123", status: "CHECKOUT_CREATED" });

    const response = await POST(
      new Request("http://localhost/api/manual-review/review_123/submit", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "review_123" }) },
    );

    expect(response.status).toBe(403);
  });
});
