import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { requireAdminUser } from "@/server/auth";
import { extractBlogText } from "@/lib/blog/seo";

const requestSchema = z.object({
  action: z.enum(["generate_excerpt", "generate_seo_pack", "generate_tags", "generate_cover_prompt"]),
  title: z.string().max(240).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  category: z.string().max(120).optional().nullable(),
  excerpt: z.string().max(1000).optional().nullable(),
});

async function callDeepSeek(prompt: string) {
  if (!env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY 未配置");
  const baseUrl = env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a B2B sourcing SEO editor for GoCNScout. Return only the requested output. Do not mention private contacts or personal data.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.35,
      max_tokens: 900,
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek API 请求失败：${response.status}`);
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const payload = requestSchema.parse(await request.json());
    const contentText = payload.content ? extractBlogText(payload.content).slice(0, 1200) : "";
    const title = payload.title ?? "";
    const category = payload.category ?? "China supplier sourcing";
    const excerpt = payload.excerpt ?? contentText;

    let prompt = "";
    if (payload.action === "generate_excerpt") {
      prompt = `Write a concise English blog excerpt for GoCNScout.
Title: ${title}
Category: ${category}
Content preview: ${contentText}
Rules: 120-180 characters, practical B2B sourcing angle, no quotes, no private contact data claims.`;
    } else if (payload.action === "generate_tags") {
      prompt = `Generate 5-8 lowercase tags for a GoCNScout sourcing article.
Title: ${title}
Category: ${category}
Content preview: ${contentText}
Return only a JSON array of strings.`;
    } else if (payload.action === "generate_cover_prompt") {
      prompt = `Generate an image prompt for a professional B2B sourcing blog cover.
Title: ${title}
Category: ${category}
Rules: concrete supply-chain/exporter visual, no logos, no brand names, no personal data. Return English prompt, then "---", then Chinese version.`;
    } else {
      prompt = `Generate SEO metadata for a GoCNScout English blog article.
Title: ${title}
Category: ${category}
Excerpt: ${excerpt}
Content preview: ${contentText}
Return only JSON with:
{
  "metaTitle": "50-60 characters, contains main keyword",
  "metaDescription": "150-160 characters, contains main keyword naturally",
  "tags": ["5-8 lowercase sourcing tags"]
}`;
    }

    let result = await callDeepSeek(prompt);
    if (payload.action === "generate_seo_pack" || payload.action === "generate_tags") {
      result = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      JSON.parse(result);
    }
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof z.ZodError ? "请求数据格式不正确" : error instanceof Error ? error.message : "AI 生成失败";
    return NextResponse.json({ error: message }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}
