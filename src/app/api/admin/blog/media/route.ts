import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { requireAdminUser } from "@/server/auth";
import { uploadPrivateFile } from "@/server/storage";

export async function GET() {
  try {
    await requireAdminUser();
    const items = await prisma.blogMedia.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "没有管理员权限" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAdminUser();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/")) return NextResponse.json({ error: "只支持图片文件" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "图片不能超过 8MB" }, { status: 400 });
    if (!env.R2_PUBLIC_BASE_URL) return NextResponse.json({ error: "尚未配置图片存储" }, { status: 503 });
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const key = `blog/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    await uploadPrivateFile(key, Buffer.from(await file.arrayBuffer()), file.type);
    const item = await prisma.blogMedia.create({ data: { key, publicUrl: `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`, fileName: file.name, contentType: file.type, uploadedBy: user.id } });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("[blog media] upload failed", error);
    return NextResponse.json({ error: "图片上传失败" }, { status: 500 });
  }
}
