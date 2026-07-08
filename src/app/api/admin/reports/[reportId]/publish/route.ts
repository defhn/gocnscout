import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/server/auth";

export async function POST(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { user } = await requireAdminUser();
  const { reportId } = await params;
  await prisma.report.update({
    where: { id: reportId },
    data: { status: "PUBLISHED", publishedAt: new Date(), uploadedBy: user.id },
  });
  return NextResponse.redirect(new URL("/admin/reports", request.url));
}
