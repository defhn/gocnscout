import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAppUser } from "@/server/auth";

const inquirySchema = z.object({
  type: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  email: z.string().email().max(180),
  companyName: z.string().max(180).optional(),
  message: z.string().min(1).max(4000),
  redirectTo: z.string().optional(),
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = inquirySchema.parse(Object.fromEntries(form.entries()));
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

  return NextResponse.redirect(new URL(`${parsed.redirectTo || "/contact"}?submitted=1`, request.url));
}
