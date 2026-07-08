import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

export function stripe() {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"));
}
