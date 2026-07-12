import { prisma } from "@/lib/db";
import type { SupplierAnalysisResult } from "./contract";

export async function createAnalysisRecord(result: SupplierAnalysisResult) {
  return prisma.supplierAnalysis.create({
    data: {
      sourceUrl: result.sourceUrl,
      normalizedUrl: result.normalizedUrl,
      sourceType: result.sourceType,
      status: "COMPLETED",
      companyName: result.companyName,
      resultJson: result,
    },
  });
}

export async function getAnalysisRecord(id: string) {
  return prisma.supplierAnalysis.findUnique({
    where: { id },
  });
}
