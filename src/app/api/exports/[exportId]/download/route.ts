import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAppUser } from "@/server/auth";
import { createPrivateDownloadUrl } from "@/server/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ exportId: string }> }) {
  const user = await requireAppUser();
  const { exportId } = await params;
  const job = await prisma.exportJob.findFirst({ where: { id: exportId, userId: user.id, status: "READY" } });
  if (!job?.fileKey) {
    return NextResponse.json({ error: "Export file is not available" }, { status: 404 });
  }
  return NextResponse.redirect(await createPrivateDownloadUrl(job.fileKey));
}
