import { NextResponse } from "next/server";
import { getSubscriptionPrice } from "@/config/pricing";
import { absoluteUrl } from "@/lib/utils";
import { requireAppUser } from "@/server/auth";
import { stripe } from "@/server/stripe";

export async function GET(request: Request) {
  const user = await requireAppUser();
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  const interval = url.searchParams.get("interval") === "YEAR" ? "YEAR" : "MONTH";

  if (plan !== "STARTER" && plan !== "PRO" && plan !== "TEAM") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const price = getSubscriptionPrice(plan, interval);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    success_url: absoluteUrl("/app/billing?checkout=success"),
    cancel_url: absoluteUrl("/pricing?checkout=canceled"),
    metadata: {
      userId: user.id,
      planCode: plan,
      interval,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          recurring: { interval: interval === "YEAR" ? "year" : "month" },
          unit_amount: price.amountUsdCents,
          product_data: {
            name: price.name,
          },
        },
      },
    ],
  });

  return NextResponse.redirect(session.url || absoluteUrl("/app/billing"));
}
