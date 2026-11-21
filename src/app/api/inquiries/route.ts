import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentAppUser } from "@/server/auth";

const inquirySchema = z.object({
  type: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  email: z.string().email().max(180),
  companyName: z.string().max(180).optional(),
  message: z.string().min(1).max(4000),
  redirectTo: z.string().optional(),
});

function safeRedirectPath(value?: string) {
  // 只允许站内相对路径,避免开放重定向
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/contact";
}

export async function POST(request: Request) {
  const limit = rateLimit(`inquiry:${clientIp(request)}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const form = await request.formData();
  const entries = Object.fromEntries(form.entries());
  const redirectTo = safeRedirectPath(typeof entries.redirectTo === "string" ? entries.redirectTo : undefined);

  // 蜜罐字段:真人看不到该输入框,机器人通常会自动填写
  if (typeof entries.website === "string" && entries.website.trim() !== "") {
    return NextResponse.redirect(new URL(`${redirectTo}?submitted=1`, request.url));
  }

  const parsed = inquirySchema.parse(entries);
  const user = await getCurrentAppUser().catch(() => null);

  await prisma.inquiry.create({
    data: {
      type: parsed.type,
      name: parsed.name,
      email: parsed.email,
      companyName: parsed.companyName,
      message: parsed.message,
      userId: user?.id,
    },
  });

  return NextResponse.redirect(new URL(`${redirectTo}?submitted=1`, request.url));
}
