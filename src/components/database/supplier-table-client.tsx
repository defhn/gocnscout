"use client";

import { SupplierTable, type SupplierRow } from "@/components/database/supplier-detail-modal";
import type { AppPlanCode } from "@/config/plans";

export function SupplierTableClient({
  suppliers,
  planCode,
}: {
  suppliers: SupplierRow[];
  planCode: AppPlanCode;
}) {
  return <SupplierTable suppliers={suppliers} planCode={planCode} />;
}
