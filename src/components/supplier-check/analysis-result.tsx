import { AlertTriangle, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { MANUAL_REVIEW_PACKAGES } from "@/config/manual-review";
import { formatUsd } from "@/lib/utils";
import type { SupplierAnalysisResult } from "@/server/analysis/contract";
import { ButtonLink } from "@/components/ui/button";

export function AnalysisResult({
  analysisId,
  result,
}: {
  analysisId: string;
  result: SupplierAnalysisResult;
}) {
  const supplierUrl = encodeURIComponent(result.normalizedUrl);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <main className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
            <ShieldCheck className="h-4 w-4" />
            Public-source first pass
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
            {result.companyName || "Supplier analysis result"}
          </h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{result.summary}</p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">Evidence Coverage</h2>
          <div className="mt-4 space-y-4">
            {result.sources.map((source) => (
              <div key={source.url} className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{source.label}</h3>
                    <a className="mt-1 block break-all text-xs text-teal-700 hover:underline" href={source.url} target="_blank" rel="noreferrer">
                      {source.url}
                    </a>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${source.status === "AVAILABLE" ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-600"}`}>
                    {source.status}
                  </span>
                </div>
                {source.facts.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-700">
                    {source.facts.map((fact) => (
                      <li key={fact} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">No public facts were captured from this page.</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <SignalPanel title="Risk Notes" items={result.riskFlags} icon={AlertTriangle} />
          <SignalPanel title="Buyer Questions" items={result.buyerQuestions} icon={ClipboardList} />
          <SignalPanel title="Next Steps" items={result.nextSteps} icon={CheckCircle2} />
          <SignalPanel title="Limitations" items={[...result.unavailable, ...result.limitations]} icon={ShieldCheck} />
        </section>
      </main>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-950">Need human judgment?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Automated scraping is useful for screening. Manual review checks public business, marketplace, website, and social signals before you spend time with the supplier.
          </p>
        </div>

        {MANUAL_REVIEW_PACKAGES.map((pkg) => (
          <div key={pkg.code} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950">{pkg.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{pkg.delivery}</p>
              </div>
              <span className="text-lg font-extrabold text-slate-950">{formatUsd(pkg.amountUsdCents)}</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
              {pkg.features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <ButtonLink
              href={`/api/manual-review/checkout?package=${pkg.code}&analysisId=${analysisId}&supplierUrl=${supplierUrl}`}
              variant={pkg.code.includes("DECISION") ? "teal" : "outline"}
              className="mt-4 w-full text-xs font-bold"
            >
              Buy {pkg.shortName}
            </ButtonLink>
          </div>
        ))}
      </aside>
    </div>
  );
}

function SignalPanel({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: typeof AlertTriangle;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950">
        <Icon className="h-4 w-4 text-teal-600" />
        {title}
      </h2>
      <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
        {(items.length > 0 ? items : ["No additional items in this section."]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
