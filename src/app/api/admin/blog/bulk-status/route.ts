import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Verify admin access
    await requireAdminUser();

    const body = await request.json();
    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "请提供有效的文章 ID 列表" }, { status: 400 });
    }

    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      return NextResponse.json({ error: "无效的文章状态" }, { status: 400 });
    }

    // Perform bulk update in database
    const updateResult = await prisma.blogPost.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `已成功将选中的 ${updateResult.count} 篇文章设为${status === "DRAFT" ? "草稿" : status === "PUBLISHED" ? "发布" : "归档"}状态`,
      count: updateResult.count,
    });
  } catch (error) {
    console.error("[BulkStatus] Error updating status:", error);
    const errorMessage = error instanceof Error ? error.message : "批量修改文章状态失败";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
