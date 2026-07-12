import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisResult } from "@/components/supplier-check/analysis-result";
import { ButtonLink } from "@/components/ui/button";
import { getAnalysisRecord, assignAnalysisToUser } from "@/server/analysis/repository";
import type { SupplierAnalysisResult } from "@/server/analysis/contract";
import { getCurrentAppUser } from "@/server/auth";

export default async function SupplierCheckResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getAnalysisRecord(id);

  if (!record) {
    notFound();
  }

  if (!record.resultJson || record.status !== "COMPLETED") {
    return (
      <section className="container-page py-12">
        <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-slate-950">Analysis is not ready</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This analysis is still processing or failed during capture. Try a different public supplier URL.
          </p>
          <ButtonLink href="/supplier-check" variant="teal" className="mt-5">
            Start another check
          </ButtonLink>
        </div>
      </section>
    );
  }

  const user = await getCurrentAppUser();
  let isSaved = false;

  if (user) {
    if (!record.userId) {
      await assignAnalysisToUser(id, user.id);
      record.userId = user.id;
    }
    isSaved = record.userId === user.id;
  }

  return (
    <section className="container-page py-10">
      <div className="mb-6 text-sm text-slate-500">
        <Link href="/supplier-check" className="text-teal-700 hover:underline">
          Supplier Check
        </Link>{" "}
        / Result
      </div>
      <AnalysisResult 
        analysisId={id} 
        result={record.resultJson as SupplierAnalysisResult} 
        isSaved={isSaved}
        isAuthenticated={!!user}
      />
    </section>
  );
}
