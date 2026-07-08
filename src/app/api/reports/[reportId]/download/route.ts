import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAppUser } from "@/server/auth";
import { createPrivateDownloadUrl } from "@/server/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const user = await requireAppUser();
  const { reportId } = await params;
  const purchase = await prisma.reportPurchase.findFirst({
    where: { userId: user.id, reportId, status: { in: ["PAID", "FULFILLED"] } },
    include: { report: true },
  });

  if (!purchase?.report.fileKey) {
    return NextResponse.json({ error: "Report file is not available" }, { status: 404 });
  }

  const url = await createPrivateDownloadUrl(purchase.report.fileKey);
  return NextResponse.redirect(url);
}
