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

  const purchase = await prisma.reportPurchase.upsert({
    where: { userId_reportId: { userId: user.id, reportId } },
    update: { amountUsdCents: report.priceUsdCents, status: "PENDING" },
    create: { userId: user.id, reportId, amountUsdCents: report.priceUsdCents },
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
          unit_amount: report.priceUsdCents,
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
