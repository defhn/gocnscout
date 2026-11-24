import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentAppUser } from "@/server/auth";
import { sendTransactionalEmail } from "@/server/email";

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

function buildSubmittedRedirectUrl(redirectTo: string, requestUrl: string) {
  const target = new URL(redirectTo, requestUrl);
  target.searchParams.set("submitted", "1");
  return target;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
    return NextResponse.redirect(buildSubmittedRedirectUrl(redirectTo, request.url), 303);
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

  // 如果服务器配置了 Brevo,自动发一封新咨询提醒邮件到支持邮箱(发送失败不影响表单提交成功)
  if (env.BREVO_API_KEY && env.SUPPORT_EMAIL) {
    await sendTransactionalEmail({
      to: env.SUPPORT_EMAIL,
      subject: `[GoCNScout] New inquiry: ${parsed.type} from ${parsed.name}`,
      html: [
        `<h2>New Inquiry Received</h2>`,
        `<p><strong>Service / Type:</strong> ${escapeHtml(parsed.type)}</p>`,
        `<p><strong>Name:</strong> ${escapeHtml(parsed.name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(parsed.email)}</p>`,
        parsed.companyName ? `<p><strong>Company:</strong> ${escapeHtml(parsed.companyName)}</p>` : "",
        `<p><strong>Message:</strong></p><pre style="white-space:pre-wrap;font-family:sans-serif;">${escapeHtml(parsed.message)}</pre>`,
      ].join(""),
    }).catch((err) => {
      console.error("[inquiries] Failed to send email notification:", err);
    });
  }

  // 必须使用 303 See Other,否则浏览器会对重定向目标继续发 POST 导致 405
  return NextResponse.redirect(buildSubmittedRedirectUrl(redirectTo, request.url), 303);
}
