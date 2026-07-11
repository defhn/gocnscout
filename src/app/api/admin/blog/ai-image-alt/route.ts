import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/server/auth";
import { isBlogDocument } from "@/lib/blog/content";
import { withGeneratedImageAlts } from "@/lib/blog/seo";

const schema = z.object({
  title: z.string().trim().min(1).max(240),
  content: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const payload = schema.parse(await request.json());
    if (!isBlogDocument(payload.content)) {
      return NextResponse.json({ error: "正文格式不正确" }, { status: 400 });
    }
    const result = withGeneratedImageAlts(payload.content, payload.title);
    return NextResponse.json({ content: result.document, count: result.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? "请求数据格式不正确" : "Alt 回填失败" }, { status: 400 });
  }
}
