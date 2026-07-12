"use client";

import { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ClipboardList, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldAlert, 
  Activity, 
  Layers, 
  Sparkles, 
  Check,
  Building,
  Info,
  HelpCircle,
  Clock,
  Briefcase,
  Globe
} from "lucide-react";
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

  // State to track which accordion source is expanded.
  // By default, the first source is expanded.
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (result.sources && result.sources.length > 0) {
      initial[result.sources[0].url] = true;
    }
    return initial;
  });

  const toggleSource = (url: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [url]: !prev[url]
    }));
  };

  // Determine confidence status color
  const confText = (result.riskFlags.find((item) => item.startsWith("Initial buyer confidence:"))?.replace("Initial buyer confidence: ", "") || "").toLowerCase();
  let confColor = "from-slate-500 to-slate-700 text-white";
  let confLabel = "Needs Verification";
  if (confText.includes("high")) {
    confColor = "from-teal-600 to-emerald-600 text-white";
    confLabel = "High Confidence";
  } else if (confText.includes("medium") || confText.includes("moderate")) {
    confColor = "from-teal-500 to-cyan-600 text-white";
    confLabel = "Moderate Confidence";
  } else if (confText.includes("low")) {
    confColor = "from-amber-500 to-orange-600 text-white";
    confLabel = "Low Confidence";
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <main className="space-y-8">
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 md:p-8 text-white shadow-lg">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 shrink-0 animate-pulse text-teal-400" />
              <span>Public-Source First Pass</span>
            </div>
            
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-gradient-to-r ${confColor} shadow-sm`}>
              <Activity className="h-3.5 w-3.5" />
              {confLabel}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {result.companyName || "Supplier Screening Report"}
          </h1>
          
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-300 max-w-3xl">
            {result.summary}
          </p>

          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap gap-x-6 gap-y-2.5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-teal-550" />
              Generated: Just now
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-teal-550" />
              Source: Public Webpages
            </span>
          </div>
        </section>

        {/* Buyer Snapshot Grid */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 mb-5">
            <Layers className="h-5 w-5 text-teal-600" />
            Automated Screening Snapshot
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <SnapshotItem label="Initial confidence" value={snapshot.confidence} tone="teal" />
            <SnapshotItem label="Product fit signals" value={snapshot.productSignals} />
            <SnapshotItem label="Marketplace reputation" value={snapshot.marketplaceSignals} />
            <SnapshotItem label="Registration / TrustPass" value={snapshot.registrationSignals} />
          </div>

          {/* Critical Warnings Alert */}
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              What this free scan STILL cannot verify
            </h3>
            <p className="mt-1.5 text-xs text-amber-800">
              The following critical items require manual investigation or direct documentation checks:
            </p>
            <ul className="mt-3.5 space-y-2.5 text-xs leading-relaxed text-amber-900">
              {snapshot.missingEvidence.map((item, idx) => (
                <li key={item} className="flex gap-2 items-start">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Evidence Coverage - Accordions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-teal-600" />
            Captured Evidence Sources
          </h2>
          <p className="text-xs text-slate-500 mb-5">Click on any page source below to inspect the analyzed details and extracted facts.</p>
          
          <div className="space-y-3">
            {result.sources.map((source) => {
              const displayFacts = getDisplayFacts(source.facts);
              const isOpen = !!expandedSources[source.url];

              return (
                <div key={source.url} className={`rounded-xl border transition-all duration-300 ${isOpen ? "border-teal-200 bg-teal-50/5" : "border-slate-150 bg-slate-50/30 hover:border-slate-350"}`}>
                  {/* Accordion Trigger Header */}
                  <button
                    type="button"
                    onClick={() => toggleSource(source.url)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium outline-none cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{source.label}</h3>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${source.status === "AVAILABLE" ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-600"}`}>
                          {source.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 truncate hover:text-teal-700 flex items-center gap-1">
                        <span>{source.url}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </p>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-2xs">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-150/50 animate-in fade-in duration-300">
                      {displayFacts.length > 0 ? (
                        <ul className="grid gap-2.5 sm:grid-cols-2 text-xs leading-relaxed text-slate-700">
                          {displayFacts.map((fact) => (
                            <li key={fact} className="flex gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                              <span>{fact}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 text-xs text-slate-500 italic">
                          <Info className="h-4 w-4 text-slate-400 shrink-0" />
                          No public facts were captured from this page.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Signals Panels Matrix */}
        <section className="grid gap-6 md:grid-cols-2">
          <SignalPanel 
            title="Risk Notes" 
            items={result.riskFlags} 
            icon={AlertTriangle} 
            panelColor="border-red-100 bg-red-50/20 text-red-950" 
            iconColor="text-red-600" 
          />
          <SignalPanel 
            title="Buyer Questions" 
            items={result.buyerQuestions} 
            icon={ClipboardList} 
            panelColor="border-indigo-100 bg-indigo-50/15 text-indigo-950" 
            iconColor="text-indigo-600" 
          />
          <SignalPanel 
            title="Next Steps" 
            items={result.nextSteps} 
            icon={CheckCircle2} 
            panelColor="border-teal-100 bg-teal-50/15 text-teal-950" 
            iconColor="text-teal-600" 
          />
          <SignalPanel 
            title="Limitations" 
            items={[...result.unavailable, ...result.limitations]} 
            icon={ShieldCheck} 
            panelColor="border-slate-200 bg-slate-50 text-slate-900" 
            iconColor="text-slate-500" 
          />
        </section>

        {/* Inline Manual Review Banner Offer */}
        <section className="rounded-2xl border border-teal-200 bg-gradient-to-tr from-teal-50/80 via-teal-50/30 to-emerald-50/30 p-6 md:p-8 shadow-xs">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Manual Sourcing Review</span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              Need deep validation before committing funds?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Upgrade from the automated report to a professional manual review. A human sourcing expert will inspect local corporate databases, verification history, risk parameters, and verify IP footprints.
            </p>
          </div>
          
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {MANUAL_REVIEW_PACKAGES.map((pkg) => (
              <ManualReviewCard key={pkg.code} pkg={pkg} analysisId={analysisId} supplierUrl={supplierUrl} compact />
            ))}
          </div>
        </section>
      </main>

      {/* Sidebar Checkout Panel */}
      <aside className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-teal-600" />
            Upgrade Report
          </h2>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
            For orders with budget or high liability, verify legal compliance, registry history, and real operational capacity.
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
  const isPremium = pkg.code.includes("DECISION");

  return (
    <div className={`rounded-xl border bg-white p-5 flex flex-col transition-all duration-300 hover:shadow-md ${isPremium ? "border-teal-500 ring-1 ring-teal-500/10" : "border-slate-200"} ${compact ? "shadow-xs" : ""}`}>
      {isPremium && (
        <div className="mb-2 self-start rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-teal-700 tracking-wider">
          Best Buyer Choice
        </div>
      )}
      
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-teal-700">{getPackageEyebrow(pkg.code)}</p>
          <h3 className="text-sm font-bold text-slate-950 truncate mt-0.5">{pkg.name}</h3>
          <p className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            {pkg.delivery}
          </p>
        </div>
        <span className="text-lg font-extrabold text-slate-950 shrink-0">{formatUsd(pkg.amountUsdCents)}</span>
      </div>
      
      <p className="mt-3 text-xs leading-relaxed text-slate-600">{pkg.description}</p>
      
      <ul className="mt-4 flex-1 space-y-2 text-xs leading-normal text-slate-600">
        {pkg.features.slice(0, compact ? 3 : 6).map((feature) => (
          <li key={feature} className="flex gap-2 items-start">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <ButtonLink
        href={`/api/manual-review/checkout?package=${pkg.code}&analysisId=${analysisId}&supplierUrl=${supplierUrl}`}
        variant={isPremium ? "teal" : "outline"}
        className="mt-5 w-full text-xs font-semibold rounded-lg shadow-sm py-2.5 hover:scale-[1.01] transition-transform duration-200"
      >
        Buy {pkg.shortName}
      </ButtonLink>
    </div>
  );
}

function getPackageEyebrow(code: string) {
  if (code.includes("BUNDLE")) return "3-supplier bundle";
  return "1 supplier review";
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
      "Independent public registry verification of company ownership/status.",
      "Check of official corporate website and Chinese social-media footprint consistency.",
      "Verification of target-market product certificate authenticity.",
      "Evidence of actual production capacity (factory vs trading company status).",
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
    <div className={`rounded-xl border p-4.5 transition-shadow duration-200 hover:shadow-xs ${tone === "teal" ? "border-teal-200 bg-teal-50/40" : "border-slate-150 bg-slate-50/50"}`}>
      <div className={`text-[10px] font-extrabold uppercase tracking-wider ${tone === "teal" ? "text-teal-905" : "text-slate-500"}`}>{label}</div>
      <p className="mt-2 text-xs leading-relaxed text-slate-800 font-medium">{value}</p>
    </div>
  );
}

function SignalPanel({
  title,
  items,
  icon: Icon,
  panelColor,
  iconColor,
}: {
  title: string;
  items: string[];
  icon: any;
  panelColor: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-2xs ${panelColor}`}>
      <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide">
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
        {title}
      </h2>
      <ul className="mt-3.5 space-y-2 text-xs leading-relaxed">
        {(items.length > 0 ? items : ["No additional records listed in this section."]).map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
