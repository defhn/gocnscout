"use client";

import dynamic from "next/dynamic";
import type { SupplierRow } from "@/components/database/supplier-detail-modal";
import type { AppPlanCode } from "@/config/plans";


const SupplierTable = dynamic(
  () =>
    import("@/components/database/supplier-detail-modal").then((mod) => mod.SupplierTable),
  { ssr: false }
);

export function SupplierTableClient({
  suppliers,
  planCode,
}: {
  suppliers: SupplierRow[];
  planCode: AppPlanCode;
}) {
  return <SupplierTable suppliers={suppliers} planCode={planCode} />;
}

