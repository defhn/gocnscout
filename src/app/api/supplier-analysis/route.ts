import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeAnalysisUrl } from "@/server/analysis/contract";
import { createAnalysisRecord } from "@/server/analysis/repository";
import { analyzeSupplierUrl } from "@/server/analysis/service";
import { getCurrentAppUser } from "@/server/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const requestSchema = z.object({
  url: z.string().trim().min(4).max(2000),
});

export async function POST(request: Request) {
  // Every online scan costs Firecrawl / DeepSeek usage, so it is paused by default.
  // Set SUPPLIER_CHECK_ENABLED=true to turn it back on (with the limits below).
  if (process.env.SUPPLIER_CHECK_ENABLED !== "true") {
    return NextResponse.json(
      {
        error: {
          code: "TEMPORARILY_UNAVAILABLE",
          message: "The automatic supplier scan is paused. Please ask in our Discord community or request a human review.",
        },
      },
      { status: 503 },
    );
  }

  const perIp = rateLimit(`supplier-analysis:ip:${clientIp(request)}`, 10, 60 * 60_000);
  const dailyCap = Number(process.env.SUPPLIER_CHECK_DAILY_LIMIT || 200);
  const global = rateLimit("supplier-analysis:global", dailyCap, 24 * 60 * 60_000);
  if (!perIp.ok || !global.ok) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many scans right now. Please try again later." } },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError();
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError();
  }

  try {
    normalizeAnalysisUrl(parsed.data.url);
  } catch {
    return validationError();
  }

  try {
    const user = await getCurrentAppUser();
    const result = await analyzeSupplierUrl(parsed.data.url);
    const record = await createAnalysisRecord(result, user?.id);

    return NextResponse.json({
      analysisId: record.id,
      redirectTo: `/supplier-check/${record.id}`,
      result: record.resultJson,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "ANALYSIS_FAILED",
          message: "We could not analyze this supplier URL right now. Please try another public Alibaba store or website URL.",
        },
      },
      { status: 502 },
    );
  }
}

function validationError() {
  return NextResponse.json(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "Enter a valid public supplier URL.",
      },
    },
    { status: 422 },
  );
}
