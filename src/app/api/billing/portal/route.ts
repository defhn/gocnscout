import { NextResponse } from "next/server";

/** 订阅账单入口已停用。历史订阅的续费/退款仍由 Stripe webhook 处理。 */
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/pricing", request.url));
}

export async function POST() {
  return NextResponse.json({ error: "Billing portal is no longer available." }, { status: 410 });
}
