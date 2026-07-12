import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { normalizeAnalysisUrl } from "@/server/analysis/contract";
import { sendTransactionalEmail } from "@/server/email";
import { getManualReviewRequest, submitManualReviewRequest } from "@/server/manual-review/repository";

const submitSchema = z.object({
  buyerName: z.string().trim().min(1).max(120),
  buyerEmail: z.string().trim().email().max(240),
  companyName: z.string().trim().max(160).optional().or(z.literal("")),
  supplierUrl: z.string().trim().min(4).max(2000),
  additionalSupplierUrls: z.array(z.string().trim().max(2000)).max(2).optional(),
  targetProduct: z.string().trim().min(1).max(500),
  destinationMarket: z.string().trim().min(1).max(120),
  procurementStage: z.string().trim().min(1).max(160),
  estimatedOrderValue: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const review = await getManualReviewRequest(id);

  if (!review) {
    return NextResponse.json({ error: "Manual review request not found" }, { status: 404 });
  }

  if (review.status !== "PAID" && review.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Payment must be completed before submitting review details" }, { status: 403 });
  }

  let parsed;
  try {
    parsed = submitSchema.safeParse(await request.json());
  } catch {
    return validationError();
  }

  if (!parsed.success) {
    return validationError();
  }

  let supplierUrl: string;
  let additionalSupplierUrls: string[];
  try {
    supplierUrl = normalizeAnalysisUrl(parsed.data.supplierUrl).normalizedUrl;
    additionalSupplierUrls = (parsed.data.additionalSupplierUrls || [])
      .filter(Boolean)
      .map((url) => normalizeAnalysisUrl(url).normalizedUrl);
  } catch {
    return validationError();
  }

  const updated = await submitManualReviewRequest(id, {
    buyerName: parsed.data.buyerName,
    buyerEmail: parsed.data.buyerEmail,
    companyName: parsed.data.companyName || undefined,
    supplierUrl,
    additionalSupplierUrls,
    targetProduct: parsed.data.targetProduct,
    destinationMarket: parsed.data.destinationMarket,
    procurementStage: parsed.data.procurementStage,
    estimatedOrderValue: parsed.data.estimatedOrderValue || undefined,
    notes: parsed.data.notes || undefined,
  });

  await sendTransactionalEmail({
    to: env.SUPPORT_EMAIL,
    subject: `Manual review submitted: ${updated.packageCode} (${updated.id})`,
    html: buildAdminEmail(updated),
  });

  return NextResponse.json({
    ok: true,
    reviewId: updated.id,
    delivery: "48 hours",
    message: "Your request was submitted. We will deliver the manual review within 24-48 hours.",
  });
}

function validationError() {
  return NextResponse.json({ error: "Please complete the required review details." }, { status: 422 });
}

function escapeHtml(input: string | null | undefined) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAdminEmail(review: {
  id: string;
  packageCode: string;
  buyerName: string | null;
  buyerEmail: string | null;
  companyName: string | null;
  supplierUrl: string;
  additionalSupplierUrls: string[];
  targetProduct: string | null;
  destinationMarket: string | null;
  procurementStage: string | null;
  estimatedOrderValue: string | null;
  notes: string | null;
}) {
  const additionalUrls = review.additionalSupplierUrls || [];
  const extraUrls = additionalUrls.length > 0 ? additionalUrls.map((url) => escapeHtml(url)).join("<br/>") : "None";
  return `
    <h2>Manual review submitted</h2>
    <p><strong>Review ID:</strong> ${escapeHtml(review.id)}</p>
    <p><strong>Package:</strong> ${escapeHtml(review.packageCode)}</p>
    <p><strong>Buyer:</strong> ${escapeHtml(review.buyerName)} (${escapeHtml(review.buyerEmail)})</p>
    <p><strong>Company:</strong> ${escapeHtml(review.companyName)}</p>
    <p><strong>Supplier URL:</strong> ${escapeHtml(review.supplierUrl)}</p>
    <p><strong>Additional URLs:</strong><br/>${extraUrls}</p>
    <p><strong>Target product:</strong> ${escapeHtml(review.targetProduct)}</p>
    <p><strong>Destination market:</strong> ${escapeHtml(review.destinationMarket)}</p>
    <p><strong>Procurement stage:</strong> ${escapeHtml(review.procurementStage)}</p>
    <p><strong>Estimated order value:</strong> ${escapeHtml(review.estimatedOrderValue)}</p>
    <p><strong>Notes:</strong><br/>${escapeHtml(review.notes)}</p>
  `;
}
