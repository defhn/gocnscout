import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { requireAdminUser } from "@/server/auth";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function readGscCredentials() {
  let clientEmail = env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  let privateKey = env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
  if (env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON) {
    const decoded = Buffer.from(env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { client_email?: string; private_key?: string };
    clientEmail = parsed.client_email;
    privateKey = parsed.private_key;
  }
  return { clientEmail, privateKey };
}

export async function POST() {
  try {
    await requireAdminUser();
    const { clientEmail, privateKey } = readGscCredentials();
    if (!env.GOOGLE_SEARCH_CONSOLE_SITE_URL || !clientEmail || !privateKey) {
      return NextResponse.json({
        error: "GSC_NOT_CONFIGURED",
        message: "Google Search Console API 环境变量尚未完整配置。",
      }, { status: 400 });
    }

    const key = privateKey.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({
      email: clientEmail,
      key,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    const client = google.searchconsole({ version: "v1", auth });

    const today = new Date();
    const end = new Date(today);
    end.setUTCDate(today.getUTCDate() - 3);
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 7);
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    const response = await client.searchanalytics.query({
      siteUrl: env.GOOGLE_SEARCH_CONSOLE_SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["query", "page", "date"],
        rowLimit: 25000,
        searchType: "web",
        dataState: "all",
      },
    });

    let processed = 0;
    for (const row of response.data.rows ?? []) {
      const [keyword, page, dateText] = row.keys ?? [];
      if (!keyword || !page || !dateText || !page.includes("/blog/")) continue;
      const slug = page.match(/\/blog\/([^/?#]+)/)?.[1];
      if (!slug) continue;
      const post = await prisma.blogPost.findUnique({ where: { slug }, select: { slug: true } });
      if (!post) continue;
      await prisma.blogGscKeywordStat.upsert({
        where: { postSlug_date_keyword: { postSlug: slug, date: new Date(dateText), keyword } },
        create: {
          postSlug: slug,
          date: new Date(dateText),
          keyword,
          clicks: row.clicks ?? 0,
          impressions: row.impressions ?? 0,
          ctr: row.ctr ?? 0,
          position: row.position ?? 0,
        },
        update: {
          clicks: row.clicks ?? 0,
          impressions: row.impressions ?? 0,
          ctr: row.ctr ?? 0,
          position: row.position ?? 0,
        },
      });
      processed += 1;
    }

    return NextResponse.json({ success: true, message: `GSC 同步完成：${startDate} 至 ${endDate}，写入 ${processed} 条关键词记录。` });
  } catch (error) {
    return NextResponse.json({ error: "GSC_SYNC_FAILED", message: error instanceof Error ? error.message : "GSC 同步失败" }, { status: 500 });
  }
}
