"use client";

import dynamic from "next/dynamic";
import type { SupplierRow } from "@/components/database/supplier-detail-modal";

const SupplierTable = dynamic(
  () =>
    import("@/components/database/supplier-detail-modal").then((mod) => mod.SupplierTable),
  { ssr: false }
);

export default function SupplierTableClient({
  suppliers,
  total,
  page,
  totalPages,
  searchParams,
  isSignedIn,
  initialSavedIds,
}: {
  suppliers: SupplierRow[];
  total: number;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
  isSignedIn: boolean;
  initialSavedIds: string[];
}) {
  return (
    <SupplierTable
      suppliers={suppliers}
      total={total}
      page={page}
      totalPages={totalPages}
      searchParams={searchParams}
      isSignedIn={isSignedIn}
      initialSavedIds={initialSavedIds}
    />
  );
}
