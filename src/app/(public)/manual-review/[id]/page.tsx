import Link from "next/link";
import { notFound } from "next/navigation";
import { ManualReviewForm } from "@/components/manual-review/manual-review-form";
import { getManualReviewPackage } from "@/config/manual-review";
import { getManualReviewRequest } from "@/server/manual-review/repository";
import { formatUsd } from "@/lib/utils";

export default async function ManualReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const review = await getManualReviewRequest(id);

  if (!review) {
    notFound();
  }

  const pkg = getManualReviewPackage(review.packageCode);
  const canSubmit = review.status === "PAID" || review.status === "SUBMITTED";

  return (
    <section className="container-page py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/supplier-check" className="text-sm font-semibold text-teal-700 hover:underline">
          Supplier Check
        </Link>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Manual review request</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{pkg.name}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">{pkg.delivery}. Submit the details below and we will use them to prepare the review.</p>
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3 text-right">
              <div className="text-xs font-semibold text-slate-500">Paid package</div>
              <div className="text-xl font-extrabold text-slate-950">{formatUsd(pkg.amountUsdCents)}</div>
            </div>
          </div>

          {!canSubmit ? (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Payment is still being confirmed. If you just completed checkout, refresh this page in a moment.
            </div>
          ) : (
            <div className="mt-6">
              <ManualReviewForm reviewId={review.id} supplierUrl={review.supplierUrl} supplierSlots={pkg.supplierSlots} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
