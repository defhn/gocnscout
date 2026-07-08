import Papa from "papaparse";
import { EXPORT_SUPPLIER_FIELDS } from "@/config/field-policy";
import { prisma } from "@/lib/db";
import { monthKey } from "@/lib/utils";
import { canExportRows, incrementUsage } from "@/server/quota";
import { buildSupplierWhere, supplierPublicSelect, type SupplierSearchParams } from "@/server/suppliers";
import { uploadPrivateFile } from "@/server/storage";

export async function createSupplierExport(userId: string, planCode: "FREE" | "STARTER" | "PRO" | "TEAM" | "DATA_LICENSE", params: SupplierSearchParams, requestedCount: number) {
  const allowed = await canExportRows(userId, planCode, requestedCount);
  if (!allowed) {
    throw new Error("Export quota exceeded or unavailable for this plan.");
  }

  const job = await prisma.exportJob.create({
    data: {
      userId,
      requestedCount,
      filtersJson: params,
      status: "PROCESSING",
    },
  });

  try {
    const suppliers = await prisma.supplier.findMany({
      where: buildSupplierWhere(params),
      select: supplierPublicSelect(),
      orderBy: { exhibitorName: "asc" },
      take: requestedCount,
    });

    const rows = suppliers.map((supplier) => {
      const row: Record<string, string | number | null> = {};
      for (const field of EXPORT_SUPPLIER_FIELDS) {
        const value = supplier[field as keyof typeof supplier];
        row[field] = Array.isArray(value) ? value.join(",") : (value as string | number | null);
      }
      return row;
    });

    const csv = Papa.unparse(rows);
    const fileName = `gocnscout-suppliers-${monthKey()}-${job.id}.csv`;
    const fileKey = `exports/${userId}/${fileName}`;
    await uploadPrivateFile(fileKey, Buffer.from(csv, "utf8"), "text/csv; charset=utf-8");
    await incrementUsage(userId, "export_rows", rows.length);

    return prisma.exportJob.update({
      where: { id: job.id },
      data: {
        status: "READY",
        deliveredCount: rows.length,
        fileKey,
        fileName,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
  } catch (error) {
    await prisma.exportJob.update({
      where: { id: job.id },
      data: { status: "FAILED", errorMessage: error instanceof Error ? error.message : "Unknown export error" },
    });
    throw error;
  }
}
