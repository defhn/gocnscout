import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";

/** 订阅账单入口已停用。历史订阅的续费/退款仍由 Stripe webhook 处理。 */
export async function GET() {
  return NextResponse.redirect(absoluteUrl("/pricing"));
}

export async function POST() {
  return NextResponse.json({ error: "Billing portal is no longer available." }, { status: 410 });
}
