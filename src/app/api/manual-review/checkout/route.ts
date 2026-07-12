import { NextResponse } from "next/server";
import { getManualReviewPackage } from "@/config/manual-review";
import { absoluteUrl } from "@/lib/utils";
import { normalizeAnalysisUrl } from "@/server/analysis/contract";
import { createManualReviewCheckoutRequest, attachCheckoutSession } from "@/server/manual-review/repository";
import { stripe } from "@/server/stripe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const packageCode = url.searchParams.get("package") || "";
  const rawSupplierUrl = url.searchParams.get("supplierUrl") || "";
  const analysisId = url.searchParams.get("analysisId");

  let pkg;
  try {
    pkg = getManualReviewPackage(packageCode);
  } catch {
    return NextResponse.json({ error: "Invalid manual review package" }, { status: 400 });
  }

  let supplierUrl: string;
  try {
    supplierUrl = normalizeAnalysisUrl(rawSupplierUrl || "https://example.com").normalizedUrl;
  } catch {
    return NextResponse.json({ error: "Invalid supplier URL" }, { status: 422 });
  }

  const review = await createManualReviewCheckoutRequest({
    packageCode: pkg.code,
    supplierUrl,
    analysisId,
    amountUsdCents: pkg.amountUsdCents,
  });

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    success_url: absoluteUrl(`/manual-review/${review.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`),
    cancel_url: analysisId ? absoluteUrl(`/supplier-check/${analysisId}?checkout=canceled`) : absoluteUrl("/pricing?checkout=canceled"),
    metadata: {
      manualReviewId: review.id,
      manualReviewPackage: pkg.code,
      analysisId: analysisId || "",
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pkg.amountUsdCents,
          product_data: {
            name: pkg.name,
            description: `${pkg.delivery}. ${pkg.description}`,
          },
        },
      },
    ],
  });

  if (session.id) {
    await attachCheckoutSession(review.id, session.id);
  }

  return NextResponse.redirect(session.url || absoluteUrl(`/manual-review/${review.id}`));
}
