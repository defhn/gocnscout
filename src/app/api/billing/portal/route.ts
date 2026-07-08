import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import { requireAppUser } from "@/server/auth";
import { stripe } from "@/server/stripe";

export async function GET() {
  const user = await requireAppUser();

  if (!user.stripeCustomerId) {
    return NextResponse.redirect(absoluteUrl("/pricing"));
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: absoluteUrl("/app/billing"),
  });

  return NextResponse.redirect(session.url);
}
