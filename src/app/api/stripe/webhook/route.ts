import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireEnv } from "@/lib/env";
import { prisma } from "@/lib/db";
import { stripe } from "@/server/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planCode = session.metadata?.planCode;
    const reportId = session.metadata?.reportId;

    if (userId && planCode) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          planCode: planCode as "STARTER" | "PRO" | "TEAM",
          subscriptionStatus: "ACTIVE",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          subscriptionStartedAt: new Date(),
        },
      });
    }

    if (userId && reportId) {
      await prisma.reportPurchase.updateMany({
        where: { userId, reportId, stripeCheckoutSession: session.id },
        data: {
          status: "PAID",
          stripePaymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
