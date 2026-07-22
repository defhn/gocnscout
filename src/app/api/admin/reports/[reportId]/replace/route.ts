import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/server/auth";
import { uploadPrivateFile } from "@/server/storage";

export async function POST(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { user } = await requireAdminUser();
  const { reportId } = await params;
  
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file required" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Use structured R2 key: reports/${slug}-sourcing-report.pdf (this will overwrite the existing one or create a new versioned one)
  const r2Key = `reports/${report.slug}-sourcing-report.pdf`;
  
  try {
    await uploadPrivateFile(r2Key, buffer, "application/pdf");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown upload error";
    return NextResponse.json({ error: `R2 Upload failed: ${message}` }, { status: 500 });
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      fileKey: r2Key,
      fileName: file.name,
      fileSizeBytes: buffer.byteLength,
      uploadedBy: user.id,
      updatedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL("/admin/reports", request.url));
}
