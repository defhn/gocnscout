import { prisma } from "@/lib/db";
import type { ManualReviewPackageCode } from "@/server/analysis/contract";

export type ManualReviewCheckoutInput = {
  packageCode: ManualReviewPackageCode;
  supplierUrl: string;
  analysisId?: string | null;
  amountUsdCents: number;
};

export async function createManualReviewCheckoutRequest(input: ManualReviewCheckoutInput) {
  return prisma.manualReviewRequest.create({
    data: {
      packageCode: input.packageCode,
      supplierUrl: input.supplierUrl,
      analysisId: input.analysisId || undefined,
      amountUsdCents: input.amountUsdCents,
    },
  });
}

export async function attachCheckoutSession(reviewId: string, checkoutSessionId: string) {
  return prisma.manualReviewRequest.update({
    where: { id: reviewId },
    data: { stripeCheckoutSession: checkoutSessionId },
  });
}

export async function markManualReviewPaid(input: {
  checkoutSessionId: string;
  paymentIntent?: string;
}) {
  return prisma.manualReviewRequest.updateMany({
    where: { stripeCheckoutSession: input.checkoutSessionId },
    data: {
      status: "PAID",
      stripePaymentIntent: input.paymentIntent,
      paidAt: new Date(),
    },
  });
}

export async function getManualReviewRequest(id: string) {
  return prisma.manualReviewRequest.findUnique({
    where: { id },
    include: { analysis: true },
  });
}

export async function submitManualReviewRequest(
  id: string,
  data: {
    buyerName: string;
    buyerEmail: string;
    companyName?: string;
    supplierUrl: string;
    additionalSupplierUrls: string[];
    targetProduct: string;
    destinationMarket: string;
    procurementStage: string;
    estimatedOrderValue?: string;
    notes?: string;
  },
) {
  return prisma.manualReviewRequest.update({
    where: { id },
    data: {
      ...data,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });
}
