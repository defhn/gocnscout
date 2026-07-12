import { prisma } from "@/lib/db";
import type { SupplierAnalysisResult } from "./contract";

export async function createAnalysisRecord(result: SupplierAnalysisResult, userId?: string | null) {
  return prisma.supplierAnalysis.create({
    data: {
      sourceUrl: result.sourceUrl,
      normalizedUrl: result.normalizedUrl,
      sourceType: result.sourceType,
      status: "COMPLETED",
      companyName: result.companyName,
      resultJson: result,
      userId: userId || null,
    },
  });
}

export async function getAnalysisRecord(id: string) {
  return prisma.supplierAnalysis.findUnique({
    where: { id },
  });
}

export async function assignAnalysisToUser(analysisId: string, userId: string) {
  return prisma.supplierAnalysis.update({
    where: { id: analysisId },
    data: { userId },
  });
}
