import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Props) {
  const { slug } = await params;
  const body = await request.json().catch(() => ({})) as { source?: string };
  const source = body.source === "search" ? "search" : body.source === "social" ? "social" : "other";
  const today = new Date();
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const post = await prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" }, select: { slug: true } });
  if (!post) return NextResponse.json({ ok: false }, { status: 404 });
  await prisma.$transaction([
    prisma.blogPost.update({ where: { slug }, data: { viewCount: { increment: 1 } } }),
    prisma.blogPostDailyView.upsert({
      where: { postSlug_date: { postSlug: slug, date } },
      create: { postSlug: slug, date, views: 1, ...(source === "search" ? { searchViews: 1 } : source === "social" ? { socialViews: 1 } : { otherViews: 1 }) },
      update: { views: { increment: 1 }, ...(source === "search" ? { searchViews: { increment: 1 } } : source === "social" ? { socialViews: { increment: 1 } } : { otherViews: { increment: 1 } }) },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
