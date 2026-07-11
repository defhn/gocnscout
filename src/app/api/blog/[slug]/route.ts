import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/server/auth";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  title: z.string().trim().min(1).max(240).optional(),
  excerpt: z.string().max(600).nullable().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  coverImage: z.string().url().nullable().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  category: z.string().max(80).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  metaTitle: z.string().max(240).nullable().optional(),
  metaDescription: z.string().max(600).nullable().optional(),
  authorName: z.string().max(100).nullable().optional(),
  sourceFileName: z.string().max(255).nullable().optional(),
  trafficSource: z.string().max(40).optional(),
  searchViews: z.coerce.number().int().min(0).optional(),
  linkedinViews: z.coerce.number().int().min(0).optional(),
  xViews: z.coerce.number().int().min(0).optional(),
  youtubeViews: z.coerce.number().int().min(0).optional(),
  otherViews: z.coerce.number().int().min(0).optional(),
});

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } });
  return post ? NextResponse.json({ post }) : NextResponse.json({ error: "文章不存在" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    await requireAdminUser();
    const { slug } = await params;
    const payload = updateSchema.parse(await request.json());
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    const nextStatus = payload.status ?? existing.status;
    const post = await prisma.blogPost.update({
      where: { slug },
      data: {
        ...payload,
        slug: payload.slug,
        content: payload.content as object | undefined,
        coverImage: payload.coverImage === "" ? null : payload.coverImage,
        publishedAt: nextStatus === "PUBLISHED" ? existing.publishedAt ?? new Date() : nextStatus === "DRAFT" ? null : existing.publishedAt,
      },
    });
    return NextResponse.json({ post });
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : 403;
    return NextResponse.json({ error: error instanceof z.ZodError ? "文章数据格式不正确" : "没有管理员权限" }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    await requireAdminUser();
    const { slug } = await params;
    await prisma.blogPost.delete({ where: { slug } });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "删除文章失败" }, { status: 403 });
  }
}
