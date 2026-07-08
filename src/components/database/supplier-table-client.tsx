"use client";

import dynamic from "next/dynamic";
import type { SupplierRow } from "@/components/database/supplier-detail-modal";
import type { AppPlanCode } from "@/config/plans";


const SupplierTable = dynamic(
  () =>
    import("@/components/database/supplier-detail-modal").then((mod) => mod.SupplierTable),
  { ssr: false }
);

export default function SupplierTableClient({
  suppliers,
  planCode,
  total,
  page,
  totalPages,
  searchParams,
}: {
  suppliers: SupplierRow[];
  planCode: AppPlanCode;
  total: number;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <SupplierTable
      suppliers={suppliers}
      planCode={planCode}
      total={total}
      page={page}
      totalPages={totalPages}
      searchParams={searchParams}
    />
  );
}



