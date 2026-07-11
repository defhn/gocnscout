import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/server/auth";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(240),
  excerpt: z.string().max(600).optional().nullable(),
  content: z.record(z.string(), z.unknown()),
  coverImage: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  category: z.string().max(80).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  metaTitle: z.string().max(240).optional().nullable(),
  metaDescription: z.string().max(600).optional().nullable(),
  authorName: z.string().max(100).optional().nullable(),
  sourceFileName: z.string().max(255).optional().nullable(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const category = url.searchParams.get("category")?.trim();
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 9) || 9));
  const where = {
    status: "PUBLISHED" as const,
    ...(category ? { category } : {}),
    ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { excerpt: { contains: search, mode: "insensitive" as const } }] } : {}),
  };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { publishedAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, category: true, tags: true, authorName: true, publishedAt: true, updatedAt: true } }),
    prisma.blogPost.count({ where }),
  ]);
  return NextResponse.json({ posts, page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAdminUser();
    const payload = postSchema.parse(await request.json());
    const post = await prisma.blogPost.create({
      data: {
        ...payload,
        content: payload.content as object,
        coverImage: payload.coverImage || null,
        authorId: user.id,
        authorName: payload.authorName || user.name || "GoCNScout 编辑部",
        publishedAt: payload.status === "PUBLISHED" ? new Date() : null,
      },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : 403;
    return NextResponse.json({ error: error instanceof z.ZodError ? "文章数据格式不正确" : "没有管理员权限" }, { status });
  }
}
