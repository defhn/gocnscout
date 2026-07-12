import { AlertTriangle, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { MANUAL_REVIEW_PACKAGES, SINGLE_SUPPLIER_MANUAL_REVIEW_PACKAGES } from "@/config/manual-review";
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
  const snapshot = buildSnapshot(result);

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
          <h2 className="text-lg font-bold text-slate-950">Buyer Snapshot</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SnapshotItem label="Initial confidence" value={snapshot.confidence} tone="teal" />
            <SnapshotItem label="Product fit signals" value={snapshot.productSignals} />
            <SnapshotItem label="Marketplace reputation" value={snapshot.marketplaceSignals} />
            <SnapshotItem label="Registration / TrustPass" value={snapshot.registrationSignals} />
          </div>
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-bold text-amber-950">What this free scan still cannot verify</h3>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-900">
              {snapshot.missingEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">Evidence Coverage</h2>
          <div className="mt-4 space-y-4">
            {result.sources.map((source) => {
              const displayFacts = getDisplayFacts(source.facts);

              return (
                <div key={source.url} className="rounded-md border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{source.label}</h3>
                      <p className="mt-1 text-xs text-slate-500">Public source captured for analysis</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${source.status === "AVAILABLE" ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-600"}`}>
                      {source.status}
                    </span>
                  </div>
                  {displayFacts.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-700">
                      {displayFacts.map((fact) => (
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
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <SignalPanel title="Risk Notes" items={result.riskFlags} icon={AlertTriangle} />
          <SignalPanel title="Buyer Questions" items={result.buyerQuestions} icon={ClipboardList} />
          <SignalPanel title="Next Steps" items={result.nextSteps} icon={CheckCircle2} />
          <SignalPanel title="Limitations" items={[...result.unavailable, ...result.limitations]} icon={ShieldCheck} />
        </section>

        <section className="rounded-xl border border-teal-200 bg-teal-50 p-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Manual verification options</p>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950">Need a human call before you contact this supplier?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Use the free scan as a first pass. Upgrade when you need a human report that checks company identity, Alibaba / website consistency, public risk signals, operating capability, IP / brand signals, and buyer decision questions.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {MANUAL_REVIEW_PACKAGES.map((pkg) => (
              <ManualReviewCard key={pkg.code} pkg={pkg} analysisId={analysisId} supplierUrl={supplierUrl} compact />
            ))}
          </div>
        </section>
      </main>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-950">Need human judgment?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with one supplier: $149 for identity and basic risk, or $249 for a buyer decision review with Xiaohongshu, Douyin, and Zhihu checks.
          </p>
        </div>

        {SINGLE_SUPPLIER_MANUAL_REVIEW_PACKAGES.map((pkg) => (
          <ManualReviewCard key={pkg.code} pkg={pkg} analysisId={analysisId} supplierUrl={supplierUrl} />
        ))}
      </aside>
    </div>
  );
}

function ManualReviewCard({
  pkg,
  analysisId,
  supplierUrl,
  compact = false,
}: {
  pkg: (typeof MANUAL_REVIEW_PACKAGES)[number];
  analysisId: string;
  supplierUrl: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-lg border bg-white p-5 ${pkg.code.includes("DECISION") ? "border-teal-200" : "border-slate-200"} ${compact ? "flex flex-col shadow-sm" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-teal-700">{getPackageEyebrow(pkg.code)}</p>
          <h3 className="text-sm font-bold text-slate-950">{pkg.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{pkg.delivery}</p>
        </div>
        <span className="text-lg font-extrabold text-slate-950">{formatUsd(pkg.amountUsdCents)}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{pkg.description}</p>
      <ul className="mt-3 flex-1 space-y-2 text-xs leading-5 text-slate-600">
        {pkg.features.map((feature) => (
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
  );
}

function getPackageEyebrow(code: string) {
  if (code.includes("BUNDLE")) return "3-supplier bundle";
  return "1 supplier";
}

export function buildSnapshot(result: SupplierAnalysisResult) {
  const allFacts = result.sources.flatMap((source) => source.facts);
  const confidence = result.riskFlags.find((item) => item.startsWith("Initial buyer confidence:"))?.replace("Initial buyer confidence: ", "") || "Needs manual verification.";
  const productFacts = allFacts.filter((fact) => fact.startsWith("Product signal:")).slice(0, 3);
  const ratingFacts = allFacts.filter((fact) => /Reviews|Supplier Service|On-time Shipment|Product Quality|Overall Ratings/i.test(fact)).slice(0, 4);
  const registrationFacts = allFacts.filter((fact) => /Registration no|Registered capital|Year Established|Date of issue/i.test(fact)).slice(0, 4);

  return {
    confidence: sanitizeDisplayText(confidence, 180),
    productSignals: productFacts.length ? sanitizeDisplayText(productFacts.map((fact) => fact.replace("Product signal: ", "")).join("; "), 180) : "No clear product signals captured.",
    marketplaceSignals: ratingFacts.length ? sanitizeDisplayText(ratingFacts.join("; "), 180) : "No rating or review signals captured.",
    registrationSignals: registrationFacts.length ? sanitizeDisplayText(registrationFacts.join("; "), 180) : "No registration fields captured from public pages.",
    missingEvidence: [
      "Business registration consistency against independent public records.",
      "Official website and social-media footprint consistency.",
      "Product certificate authenticity for your target market.",
      "Whether the product is made in-house, outsourced, or traded.",
    ],
  };
}

export function sanitizeDisplayText(input: string, max = 220) {
  const robust = dedupeRepeatedDisplayText(
    input
      .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
      .replace(/!\[[^\]]*]\(?/g, " ")
      .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
      .replace(/^\[+/g, "")
      .replace(/\]\(?/g, "")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/\S+\.(?:jpg|jpeg|png|webp|gif)(?:\?\S*)?/gi, " ")
      .replace(/鈮\?/g, "<=")
      .replace(/鈮/g, "<=")
      .replace(/鈮\?/g, "<=")
      .replace(/鈮/g, "<=")
      .replace(/\u920e\?/g, "<=")
      .replace(/\u920e/g, "<=")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[\s"'()[\]]+/g, "")
      .replace(/[\s"'()[\]]+$/g, "")
      .trim(),
  );

  if (robust.length <= max) return robust;
  return `${robust.slice(0, max - 1).trim()}...`;

  const cleaned = input
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\S+\.(?:jpg|jpeg|png|webp|gif)(?:\?\S*)?/gi, " ")
    .replace(/鈮\?/g, "<=")
    .replace(/鈮/g, "<=")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trim()}...`;
}

export function getDisplayFacts(facts: string[]) {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const fact of facts) {
    const clean = sanitizeDisplayText(fact, 220);
    if (!clean || /^Product signal:\s*$/i.test(clean)) continue;
    if (seen.has(clean.toLowerCase())) continue;
    seen.add(clean.toLowerCase());
    output.push(clean);
  }

  return output.slice(0, 8);
}

function dedupeRepeatedDisplayText(input: string): string {
  const labeledValue = input.match(/^([^:]{2,40}:\s+)(.+)$/);
  if (labeledValue) {
    return `${labeledValue[1]}${dedupeRepeatedDisplayText(labeledValue[2])}`;
  }

  const words = input.trim().split(/\s+/);
  if (words.length > 0 && words.length % 2 === 0) {
    const half = words.length / 2;
    const left = words.slice(0, half).join(" ");
    const right = words.slice(half).join(" ");
    if (left.toLowerCase() === right.toLowerCase()) return left;
  }

  return input.replace(/\b(.{12,100}?)\s+\1\b/gi, "$1");
}

function SnapshotItem({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "teal";
}) {
  return (
    <div className={`rounded-md border p-4 ${tone === "teal" ? "border-teal-200 bg-teal-50" : "border-slate-100 bg-slate-50"}`}>
      <div className={`text-xs font-bold uppercase tracking-wide ${tone === "teal" ? "text-teal-800" : "text-slate-500"}`}>{label}</div>
      <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
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
