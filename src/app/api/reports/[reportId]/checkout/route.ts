import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { requireAppUser } from "@/server/auth";
import { stripe } from "@/server/stripe";

export async function GET(_request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const user = await requireAppUser();
  const { reportId } = await params;
  const report = await prisma.report.findUnique({ where: { id: reportId } });

  if (!report || report.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Report not available" }, { status: 404 });
  }

  const isProTeamAnnual =
    (user.planCode === "PRO" || user.planCode === "TEAM") &&
    user.billingInterval === "YEAR" &&
    user.subscriptionStatus === "ACTIVE";

  const isStarterAnnual =
    user.planCode === "STARTER" &&
    user.billingInterval === "YEAR" &&
    user.subscriptionStatus === "ACTIVE";

  if (isProTeamAnnual) {
    // 100% Free access - instantly fulfill purchase bypass Stripe
    await prisma.reportPurchase.upsert({
      where: { userId_reportId: { userId: user.id, reportId } },
      update: { amountUsdCents: 0, status: "FULFILLED" },
      create: { userId: user.id, reportId, amountUsdCents: 0, status: "FULFILLED" },
    });
    return NextResponse.redirect(absoluteUrl("/app/reports?checkout=success"));
  }

  const finalPriceCents = isStarterAnnual
    ? Math.round(report.priceUsdCents / 2)
    : report.priceUsdCents;

  const purchase = await prisma.reportPurchase.upsert({
    where: { userId_reportId: { userId: user.id, reportId } },
    update: { amountUsdCents: finalPriceCents, status: "PENDING" },
    create: { userId: user.id, reportId, amountUsdCents: finalPriceCents },
  });

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    success_url: absoluteUrl("/app/reports?checkout=success"),
    cancel_url: absoluteUrl(`/reports/${report.slug}?checkout=canceled`),
    metadata: { userId: user.id, reportId },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: finalPriceCents,
          product_data: { name: report.title },
        },
      },
    ],
  });

  await prisma.reportPurchase.update({
    where: { id: purchase.id },
    data: { stripeCheckoutSession: session.id },
  });

  return NextResponse.redirect(session.url || absoluteUrl("/app/reports"));
}
