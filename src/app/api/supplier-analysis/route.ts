import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeAnalysisUrl } from "@/server/analysis/contract";
import { createAnalysisRecord } from "@/server/analysis/repository";
import { analyzeSupplierUrl } from "@/server/analysis/service";

const requestSchema = z.object({
  url: z.string().trim().min(4).max(2000),
});

export async function POST(request: Request) {
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
    const result = await analyzeSupplierUrl(parsed.data.url);
    const record = await createAnalysisRecord(result);

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
