import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";

/** 数据库订阅已停止销售,不再创建新的订阅结账会话。 */
export async function GET() {
  return NextResponse.redirect(absoluteUrl("/pricing"));
}

export async function POST() {
  return NextResponse.json({ error: "Database subscriptions are no longer offered." }, { status: 410 });
}
