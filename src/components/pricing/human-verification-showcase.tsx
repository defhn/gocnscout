"use client";

import { Check, FileCheck2, Info, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getManualReviewPackage, MANUAL_REVIEW_COMPARISON_ROWS } from "@/config/manual-review";
import { STRIPE_CATALOG } from "@/config/pricing";
import { formatUsd } from "@/lib/utils";

const identity = getManualReviewPackage("IDENTITY_SINGLE");
const decision = getManualReviewPackage("DECISION_SINGLE");
const decisionBundle = getManualReviewPackage("DECISION_BUNDLE");

const PACKAGES = [
  {
    pkg: identity,
    stageTag: "Stage 1 · First Quote & Screening",
    idealFor:
      "Best when you just received a quote or B2B link and want to verify legal existence, active status, business scope, and obvious risk flags before investing time.",
  },
  {
    pkg: decision,
    stageTag: "Stage 2 · Pre-Sample & Pre-Deposit",
    idealFor:
      "Best before paying tooling fees or a 30% deposit — covers shareholder penetration, related-company shell risks, lawsuits, mortgages, insured headcount, domestic certificates, IP, and domestic social signals.",
  },
  {
    pkg: decisionBundle,
    stageTag: "Stage 3 · Comparing 2-3 Finalists",
    idealFor:
      "Best when choosing between up to three shortlisted suppliers so you eliminate risky candidates before paying for samples or on-site QC audits.",
  },
] as const;

const BUNDLE_SAVINGS_CENTS = decision.amountUsdCents * 3 - decisionBundle.amountUsdCents;

export function HumanVerificationPackages({
  heading = "Services and reference prices",
  subtitle = "All packages include 100% independent buyer-side desk research across official Chinese registries. Scope is confirmed before payment.",
  eyebrow,
  inPageAnchor = false,
}: {
  heading?: string;
  subtitle?: string;
  eyebrow?: string;
  inPageAnchor?: boolean;
}) {
  function handleSelectInPage(code: string) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gocnscout:select-service", { detail: { query: code } }));
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto">
        {eyebrow && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">{heading}</h2>
        <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{subtitle}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PACKAGES.map(({ pkg, stageTag, idealFor }) => {
          const isRecommended = pkg.code === "DECISION_SINGLE";
          const isBundle = pkg.code === "DECISION_BUNDLE";
          const href = inPageAnchor ? "#human-review" : `/pricing?service=${pkg.code}#human-review`;

          return (
            <Card
              key={pkg.code}
              className={`relative flex flex-col rounded-2xl bg-white ${
                isRecommended
                  ? "border-2 border-teal-500 shadow-lg"
                  : "border border-slate-200 shadow-xs"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Most Popular Before Deposit
                </span>
              )}
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {isBundle ? "3-Supplier Bundle" : "Single Supplier"}
                  </span>
                  {isBundle && BUNDLE_SAVINGS_CENTS > 0 && (
                    <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-bold text-teal-700">
                      Save {formatUsd(BUNDLE_SAVINGS_CENTS)}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] font-bold text-teal-700">{stageTag}</div>
                <CardTitle className="mt-1 text-lg font-extrabold text-slate-950">{pkg.name}</CardTitle>
                <p className="text-xs text-slate-500">{pkg.delivery} · Confidential (supplier is never contacted)</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">From</div>
                <div className="text-3xl font-black tracking-tight text-slate-950">{formatUsd(pkg.amountUsdCents)}</div>
                <p className="mt-2.5 rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-xs leading-relaxed text-slate-700">
                  {idealFor}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-4 flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">What is included</h3>
                  <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-700">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                    Availability depends on public records for the company; we always report what could and could not be verified.
                  </p>
                </div>

                {inPageAnchor ? (
                  <a
                    href={href}
                    onClick={() => handleSelectInPage(pkg.code)}
                    className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                      isRecommended
                        ? "bg-teal-600 !text-white hover:bg-teal-700"
                        : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    Request {pkg.shortName}
                  </a>
                ) : (
                  <Link
                    href={href}
                    onClick={() => handleSelectInPage(pkg.code)}
                    className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                      isRecommended
                        ? "bg-teal-600 !text-white hover:bg-teal-700"
                        : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    Request {pkg.shortName}
                  </Link>
                )}

                {pkg.code === "IDENTITY_SINGLE" && (
                  <a
                    href="/samples/gocnscout-sample-identity-check-149.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-teal-700 transition-colors"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
                    Preview 9-Page Sample PDF ↗
                  </a>
                )}
                {pkg.code === "DECISION_SINGLE" && (
                  <a
                    href="/samples/gocnscout-sample-decision-review-249.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-teal-600" />
                    Preview 14-Page Sample PDF ↗
                  </a>
                )}
                {pkg.code === "DECISION_BUNDLE" && (
                  <Link
                    href="/sample-report"
                    className="mt-2.5 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-teal-700 transition-colors"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
                    Inspect Full Sample Gallery →
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desk Due Diligence vs On-Site QC Audit Complementarity Note */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-600">
            <strong className="text-slate-900">Clear scope boundary (what we check vs. what we do not):</strong>{" "}
            Our {formatUsd(identity.amountUsdCents)}–{formatUsd(decision.amountUsdCents)} desk review analyzes Chinese
            public corporate, court, mortgage, domestic certificate, IP, and domestic social records <em>before</em> you
            commit. We do <strong>not</strong> perform on-site visits/satellite facility inspections, verify private
            bank accounts, supply original business license scans, or audit overseas lab certificates (CE/FCC/FDA/UL) —
            instead, we give you the exact checklist of documents to request from the supplier and recommend pairing
            mass-production orders with on-site QC (SGS / TÜV).
          </div>
        </div>
        <div className="flex flex-wrap shrink-0 gap-2">
          <a
            href="/samples/gocnscout-sample-identity-check-149.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <FileCheck2 className="h-4 w-4 text-slate-600" />
            $149 Sample PDF
          </a>
          <a
            href="/samples/gocnscout-sample-decision-review-249.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-colors"
          >
            <FileCheck2 className="h-4 w-4 text-teal-600" />
            $249 Sample PDF
          </a>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        Need a licensed dataset for internal procurement or supply-chain systems?{" "}
        <Link href="/data-license" className="font-semibold text-teal-700 underline hover:text-teal-800">
          Enterprise Data License
        </Link>{" "}
        starts at {formatUsd(STRIPE_CATALOG.dataLicenseAnnualUsdCents)} per year.
      </p>
    </div>
  );
}

export function HumanVerificationComparison() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950">
          Compare {formatUsd(identity.amountUsdCents)} Identity Check vs {formatUsd(decision.amountUsdCents)} Buyer Decision Review
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          See the exact difference between our two verification levels. The {formatUsd(decisionBundle.amountUsdCents)} bundle includes three full {formatUsd(decision.amountUsdCents)} Buyer Decision Reviews.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[760px] w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <th className="w-[24%] px-5 py-4 border-r border-slate-200">Review Area</th>
              <th className="w-[38%] px-5 py-4 border-r border-slate-200">
                Supplier Identity Check ({formatUsd(identity.amountUsdCents)})
              </th>
              <th className="w-[38%] px-5 py-4 bg-teal-600 text-white">
                <div className="flex items-center justify-between gap-2">
                  <span>Buyer Decision Review ({formatUsd(decision.amountUsdCents)})</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                    Recommended
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MANUAL_REVIEW_COMPARISON_ROWS.map((row) => (
              <tr key={row.feature} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 bg-slate-50/40 border-r border-slate-200 align-top">
                  {row.feature}
                </td>
                <td className="px-5 py-4 leading-relaxed text-slate-600 border-r border-slate-100 align-top">
                  {renderComparisonCell(row.identity)}
                </td>
                <td className="px-5 py-4 leading-relaxed text-slate-900 bg-teal-50/25 font-medium align-top">
                  {renderComparisonCell(row.decision, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HumanVerificationProcess() {
  const steps = [
    ["1. Submit supplier target", "Share the English/Chinese name, Alibaba link, website, or proforma invoice draft."],
    ["2. Free scope confirmation", "We check record availability and reply by email with exact scope, price, and timeline."],
    ["3. Pay via Stripe link", "Only after you approve the scope do we send a secure Stripe payment link."],
    ["4. Receive report in 24-48h", "Get a structured English verification report, risk verdict, and pre-deposit checklist."],
  ] as const;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map(([title, text]) => (
          <Card key={title} className="border border-slate-200 bg-white">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function renderComparisonCell(text: string, highlight = false) {
  const unavailable = text.startsWith("Not included");
  if (unavailable) {
    return (
      <span className="inline-flex items-start gap-2 text-slate-400">
        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
        <span>{text}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-start gap-2 ${highlight ? "text-teal-950" : "text-slate-700"}`}>
      <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${highlight ? "text-teal-600" : "text-teal-500"}`} />
      <span>{text}</span>
    </span>
  );
}
