import { NextResponse } from "next/server";

/** 数据库订阅已停止销售,不再创建新的订阅结账会话。 */
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/pricing", request.url));
}

export async function POST() {
  return NextResponse.json({ error: "Database subscriptions are no longer offered." }, { status: 410 });
}
