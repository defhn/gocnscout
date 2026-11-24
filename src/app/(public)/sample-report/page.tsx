import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Lock,
  MessageCircle,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WHATSAPP_URL } from "@/config/community";
import { createMetadata } from "@/config/seo";

export const metadata = createMetadata({
  title: "Sample Buyer Decision Review Report (Redacted)",
  description:
    "Inspect a full redacted $249 Buyer Decision Review showing how our analysts cross-check Chinese GSXT corporate records, ownership, lawsuits, CNCA/CNIPA filings, and deposit risks.",
  path: "/sample-report",
});

export default function SampleReportPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Human Services", href: "/pricing" },
          { label: "Sample Verification Report" },
        ]}
      />

      <section className="container-page pt-6">
        {/* Intro Header */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <FileSearch className="h-3.5 w-3.5 text-teal-600" /> Redacted Deliverable Example
          </span>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Sample Buyer Decision Review ($249 Tier)
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Company identifiers below are redacted to protect client confidentiality. This shows the exact structure,
            official Chinese sources checked, and buyer decision guidance delivered within 24-48 hours.
          </p>
        </div>

        {/* Report Document Container */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
          {/* Report Top Banner */}
          <div className="bg-slate-950 text-white p-6 md:p-8 border-b border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
                  GoCNScout Independent Buyer Intelligence · Confidential Desk Review
                </div>
                <h2 className="mt-2 text-xl md:text-2xl font-extrabold">
                  Target: &ldquo;Shenzhen [REDACTED] Smart Appliances Co., Ltd.&rdquo;
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Buyer Context: US DTC brand ordering 1,500 pcs countertop garment steamers ($21,000 USD order · 30% T/T deposit requested)
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Analyst Verdict</div>
                <div className="text-sm font-black text-amber-200">HOLD DEPOSIT — CONTRACT MISMATCH</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-slate-400 block text-[10px] uppercase">Package</span>
                <strong className="text-white">Buyer Decision Review ($249)</strong>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-slate-400 block text-[10px] uppercase">Turnaround</span>
                <strong className="text-white">31 Hours</strong>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-slate-400 block text-[10px] uppercase">Claimed Role</span>
                <strong className="text-white">&ldquo;200-Staff Direct Factory&rdquo;</strong>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-slate-400 block text-[10px] uppercase">Verified Role</span>
                <strong className="text-amber-300">Asset-Light Trading Desk</strong>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8 text-sm leading-relaxed text-slate-700">
            {/* Executive Summary */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex items-center gap-2 font-extrabold text-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Executive Summary (Read First)</span>
              </div>
              <p className="mt-2 text-xs md:text-sm text-amber-950/90 leading-relaxed">
                The supplier quoting you on B2B is a <strong>14-month-old Shenzhen trading company</strong> registered
                in a commercial office building with <strong>0 RMB paid-in capital, 2 insured employees, and no manufacturing license</strong>.
                However, shareholder penetration shows its majority owner holds a 25% minority stake in an established
                Foshan Shunde appliance factory (founded 2015, 42 insured workers) whose workshop photos were used in
                your quote. Paying a $6,300 deposit to the Shenzhen shell leaves you with almost zero legal recourse if
                the Foshan factory delays or rejects warranty claims.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950 border-b border-slate-200 pb-2">
                <Building2 className="h-4 w-4 text-teal-600" />
                <span>1. GSXT Legal Identity &amp; Address Verification</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="w-1/3 bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Chinese Legal Name</td>
                      <td className="px-4 py-2.5">深圳市[已脱敏]智能电器有限公司 (Active / 存续)</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Unified Social Credit Code</td>
                      <td className="px-4 py-2.5 font-mono">91440300MA5******* (Verified via GSXT)</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Establishment &amp; Capital</td>
                      <td className="px-4 py-2.5">
                        Founded Sep 2025 (14 months old) · Subscribed Capital: 1,000,000 RMB · <strong>Paid-in Capital: 0 RMB</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Registered Address Check</td>
                      <td className="px-4 py-2.5 text-amber-800 font-medium">
                        Room 1408, [REDACTED] Commercial Plaza, Longhua District, Shenzhen — confirmed commercial office
                        cluster via satellite/street map, NOT an industrial plant.
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Licensed Business Scope</td>
                      <td className="px-4 py-2.5">
                        Domestic trade, e-commerce sales, household appliance wholesale, goods &amp; technology import/export.{" "}
                        <strong className="text-rose-700">(&ldquo;Manufacturing / Production&rdquo; is NOT in scope.)</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950 border-b border-slate-200 pb-2">
                <ShieldAlert className="h-4 w-4 text-teal-600" />
                <span>2. Ownership Penetration &amp; Storefront / Beneficiary Consistency</span>
              </div>
              <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                  <span>
                    <strong>Shareholder Trace:</strong> Individual Mr. Lin [REDACTED] holds 70% of the Shenzhen company
                    and concurrently holds 25% in <em>Foshan Shunde [REDACTED] Electrical Mfg. Co., Ltd.</em> (established 2015,
                    licensed for appliance manufacturing, 42 insured employees in 2025 annual report).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>
                    <strong>Proforma Invoice Wire Risk:</strong> The supplier&apos;s PI instructs T/T payment to a Hong Kong
                    company named <em>&ldquo;[REDACTED] Global Trading Limited&rdquo;</em> with no documented parent-subsidiary
                    link to either the Shenzhen company or the Foshan factory.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950 border-b border-slate-200 pb-2">
                <Scale className="h-4 w-4 text-teal-600" />
                <span>3. Litigation, CNCA Certificates, CNIPA Patents &amp; Domestic Signals</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 text-xs">
                <Card className="border border-slate-200 bg-slate-50/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Court &amp; Enforcement Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-600 space-y-1.5">
                    <p>• <strong>Shenzhen Entity:</strong> 0 lawsuits, 0 dishonest debtor or administrative penalty records (too newly formed to have history).</p>
                    <p>• <strong>Foshan Affiliate Factory:</strong> 0 dishonest debtor records; 1 minor 2023 packaging supplier contract dispute (settled, 68,000 RMB) — low systemic risk.</p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-slate-50/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      CNCA Certificates &amp; CNIPA IP Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-600 space-y-1.5">
                    <p>• <strong>ISO 9001 Certificate:</strong> Valid on CNCA, but issued to the Foshan factory, NOT the Shenzhen seller on your contract.</p>
                    <p>• <strong>ETL / FCC Report Check:</strong> Provided lab report covers corded 220V model only; 120V US model certification is still pending.</p>
                    <p>• <strong>Patents (CNIPA):</strong> 3 utility/design patents confirmed under the Foshan entity.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 4: Buyer Action Plan */}
            <div className="rounded-2xl border-2 border-teal-500 bg-teal-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950">
                <ClipboardList className="h-5 w-5 text-teal-700" />
                <span>4. Actionable Buyer Recommendations &amp; Pre-Deposit Checklist</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 text-xs">
                <div>
                  <h3 className="font-bold text-slate-950 mb-2">Documents to Require Before Sending $1:</h3>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-700">
                    <li>Re-issue the Purchase Contract &amp; PI directly under <strong>Foshan Shunde [REDACTED] Mfg. Co., Ltd.</strong> (or signed/chopped jointly as co-warrantor).</li>
                    <li>Pay into the Foshan factory&apos;s verified onshore USD export account rather than the unlinked HK third-party account.</li>
                    <li>Written lab confirmation for <strong>UL/ETL 120V 60Hz</strong> coverage on the exact SKU model number.</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 mb-2">Tailored Questions to Ask the Sales Rep:</h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
                    <li>&ldquo;Can Foshan Shunde [REDACTED] stamp the purchase contract directly as the manufacturing warrantor?&rdquo;</li>
                    <li>&ldquo;Please share the beneficiary bank account opening permit matching the contracting Chinese entity.&rdquo;</li>
                    <li>&ldquo;Will pre-shipment QC inspection take place at the Shunde Ronggui plant address on the ISO certificate?&rdquo;</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confidentiality footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-teal-600" />
                100% Buyer-Side Independent · Zero Supplier Commissions · Scope Confirmed Before Payment
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                Desk research on official public records (does not replace physical sample testing)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-3xl mx-auto mt-10 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-950">Have a Chinese supplier you want verified like this?</h2>
          <p className="text-sm text-slate-600">
            Send us the supplier&apos;s English/Chinese name, Alibaba storefront, or website. We confirm what records
            are available before you pay.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/pricing?service=DECISION_SINGLE#human-review" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Request $249 Buyer Decision Review <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold !text-white hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
            <ButtonLink href="/pricing" variant="outline">
              Compare $149 vs $249 Plans
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
