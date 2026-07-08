import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/server/auth";
import { uploadPrivateFile } from "@/server/storage";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["BASIC", "FULL", "PREMIUM", "CANTON_FAIR_INTELLIGENCE"]),
  priceUsdCents: z.coerce.number().int().positive(),
  industryName: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  const { user } = await requireAdminUser();
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file required" }, { status: 400 });
  }

  const parsed = schema.parse(Object.fromEntries(form.entries()));
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `reports/${parsed.slug}/${Date.now()}-${file.name}`;
  await uploadPrivateFile(key, buffer, file.type || "application/pdf");

  await prisma.report.upsert({
    where: { slug: parsed.slug },
    update: {
      ...parsed,
      fileKey: key,
      fileName: file.name,
      fileSizeBytes: buffer.byteLength,
      uploadedBy: user.id,
      status: "DRAFT",
    },
    create: {
      ...parsed,
      fileKey: key,
      fileName: file.name,
      fileSizeBytes: buffer.byteLength,
      uploadedBy: user.id,
      status: "DRAFT",
    },
  });

  return NextResponse.redirect(new URL("/admin/reports", request.url));
}
