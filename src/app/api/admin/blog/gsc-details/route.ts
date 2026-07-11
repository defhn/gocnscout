import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/server/auth";

export async function GET(request: Request) {
  try {
    await requireAdminUser();
    const slug = new URL(request.url).searchParams.get("slug")?.trim();
    if (!slug) return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
    const rows = await prisma.blogGscKeywordStat.findMany({
      where: { postSlug: slug },
      orderBy: [{ date: "desc" }, { clicks: "desc" }],
      take: 100,
    });
    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json({ error: "没有管理员权限" }, { status: 403 });
  }
}
