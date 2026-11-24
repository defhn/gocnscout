import { Check, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getManualReviewPackage, MANUAL_REVIEW_COMPARISON_ROWS } from "@/config/manual-review";
import { STRIPE_CATALOG } from "@/config/pricing";
import { formatUsd } from "@/lib/utils";

const identity = getManualReviewPackage("IDENTITY_SINGLE");
const decision = getManualReviewPackage("DECISION_SINGLE");
const decisionBundle = getManualReviewPackage("DECISION_BUNDLE");

const PACKAGES = [identity, decision, decisionBundle];

const BUNDLE_SAVINGS_CENTS = decision.amountUsdCents * 3 - decisionBundle.amountUsdCents;

export function HumanVerificationPackages({
  heading = "Services and reference prices",
  subtitle = "All packages include full online desk research and public record verification. Scope is confirmed before payment.",
  eyebrow,
}: {
  heading?: string;
  subtitle?: string;
  eyebrow?: string;
}) {
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
        {PACKAGES.map((pkg) => {
          const isRecommended = pkg.code === "DECISION_SINGLE";
          const isBundle = pkg.code === "DECISION_BUNDLE";
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
                  Recommended
                </span>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {isBundle ? "3-Supplier Bundle" : "Single Supplier"}
                  </span>
                  {isBundle && BUNDLE_SAVINGS_CENTS > 0 && (
                    <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-bold text-teal-700">
                      Save {formatUsd(BUNDLE_SAVINGS_CENTS)}
                    </span>
                  )}
                </div>
                <CardTitle className="mt-2 text-lg font-extrabold text-slate-950">{pkg.name}</CardTitle>
                <p className="text-xs text-slate-500">{pkg.delivery}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">From</div>
                <div className="text-3xl font-black tracking-tight text-slate-950">{formatUsd(pkg.amountUsdCents)}</div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{pkg.description}</p>

                <div className="mt-5 border-t border-slate-100 pt-4 flex-1">
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

                <Link
                  href={`/pricing?service=${pkg.code}#human-review`}
                  className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                    isRecommended
                      ? "bg-teal-600 !text-white hover:bg-teal-700"
                      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Request {pkg.shortName}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Need a licensed dataset for internal systems?{" "}
        <Link href="/data-license" className="font-semibold text-teal-700 underline hover:text-teal-800">
          Data license enquiries
        </Link>{" "}
        start at {formatUsd(STRIPE_CATALOG.dataLicenseAnnualUsdCents)} per year.
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
    ["1. Tell us what you need", "Send us the supplier name, website, or B2B store link along with your target product."],
    ["2. We confirm scope", "We reply by email with what public records we can check, the exact price, and the timeline."],
    ["3. You pay after confirmation", "Only once you approve the scope do we send a secure Stripe payment link."],
    ["4. Delivered in 24-48h", "You receive our structured human findings, risk signals, and clear buyer next steps."],
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
