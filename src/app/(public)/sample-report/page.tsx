import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  FileSearch,
  Lock,
  MessageCircle,
  Scale,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { SampleReportGallery } from "@/components/sample-report/sample-gallery";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WHATSAPP_URL } from "@/config/community";
import { createMetadata } from "@/config/seo";

export const metadata = createMetadata({
  title: "Sample Supplier Verification Reports ($149 vs $249 Redacted PDFs)",
  description:
    "Inspect real redacted $149 (9-page) and $249 (14-page) China supplier due diligence reports side-by-side: statutory filings, deregistration notices, 40.5M RMB court enforcement, 83.1M RMB mortgages, related shells, revoked ISO, and RFQ scripts.",
  path: "/sample-report",
});

const SAME_CASE_COMPARISON = [
  {
    area: "Executive Verdict & Scoring",
    tier149: "4-Tier Screening Scale (Critical Risk — Pause) + 3-point identity audit",
    tier249: "Full 6-Dimension Radar Scorecard (3 / 30) + Mandatory Critical Override breakdown",
    tier249Exclusive: false,
  },
  {
    area: "Statutory Profile & Deregistration",
    tier149: "Active Simplified Deregistration Notice (Nov 6–26, 2026), 0 insured staff, 3/3 branches cancelled, −81% capital drop",
    tier249: "Full statutory profile + 25-year capital contraction curve (52M → 10M RMB) & milestone change analysis",
    tier249Exclusive: false,
  },
  {
    area: "Ownership & Related-Shell Topology",
    tier149: "Not included in $149 tier",
    tier249: "Maps 6 related entities sharing identical phone/email — incl. 3 new 2022–2024 1M RMB trading & printing shells + Legal Rep's 4 cancelled companies",
    tier249Exclusive: true,
  },
  {
    area: "Court Enforcement & Chattel Mortgages",
    tier149: "Flags 40.5M RMB resumed enforcement, 65.27M RMB historical debtor records & 5 admin penalties",
    tier249: "Full litigation inversion timeline (51 cases), 83.1M RMB active chattel mortgages (12.4× debt-to-capital), deposit-seizure analysis & 7 labor arbitrations",
    tier249Exclusive: false,
  },
  {
    area: "Domestic ISO Certificates & Patents",
    tier149: "Not included in $149 tier",
    tier249: "Uncovers all 3 recent ISO 9001/14001/45001 certificates REVOKED + 58/58 patents TERMINATED for unpaid annual fees + 4 national standards",
    tier249Exclusive: true,
  },
  {
    area: "External Footprint, Hiring & Social",
    tier149: "Checks website (unmaintained, no ICP) & Alibaba / 1688 storefronts (both closed)",
    tier249: "Adds BOSS Zhipin (0 active jobs), Xiaohongshu / Douyin / Zhihu pulse, and domestic Tax / Environmental credit downgrades",
    tier249Exclusive: false,
  },
  {
    area: "Buyer Action Playbook & RFQ Script",
    tier149: "5 practical China export pre-payment safeguards & clear scope boundaries",
    tier249: "5 practical safeguards PLUS 4 direct trap-testing RFQ questions tailored to this factory's exact red flags",
    tier249Exclusive: false,
  },
] as const;

export default function SampleReportPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Human Services", href: "/pricing" },
          { label: "Sample Verification Reports" },
        ]}
      />

      <section className="container-page pt-6 space-y-14">
        {/* 1. Intro Header & Dual PDF Cards */}
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <FileSearch className="h-3.5 w-3.5 text-teal-600" /> Redacted Real-Case Deliverables
          </span>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Inspect Real Sample Reports Before You Order
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Both PDFs below analyze the <strong>exact same redacted Chinese factory</strong> (a 25-year-old Zhejiang
            knitwear manufacturer) so you can compare the <strong>$149 9-page Identity Check</strong> against the{" "}
            <strong>$249 14-page Buyer Decision Review</strong> page by page.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto text-left">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  $149 Tier · 9-Page PDF
                </span>
                <h2 className="mt-2 text-base font-extrabold text-slate-950">Supplier Identity Check Sample</h2>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Fast pre-sample gatekeeper: 4-tier verdict, 3-point identity audit, statutory registration profile,
                  capital history, enforcement/penalty screen, B2B check, and 5 practical safeguards.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/samples/gocnscout-sample-identity-check-149.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-bold !text-white hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Preview 9-Page PDF
                </a>
                <a
                  href="/samples/gocnscout-sample-identity-check-149.pdf"
                  download
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-teal-500 bg-white p-5 shadow-md flex flex-col justify-between gap-4">
              <div>
                <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  $249 Tier · 14-Page PDF · Recommended
                </span>
                <h2 className="mt-2 text-base font-extrabold text-slate-950">Buyer Decision Review Sample</h2>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Full pre-deposit due diligence: 6-dimension radar scorecard, related-entity shell topology, 83.1M RMB
                  chattel mortgages, labor arbitrations, domestic ISO/patent audit, domestic social pulse, and RFQ script.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/samples/gocnscout-sample-decision-review-249.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-xs font-bold !text-white hover:bg-teal-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Preview 14-Page PDF
                </a>
                <a
                  href="/samples/gocnscout-sample-decision-review-249.pdf"
                  download
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50/50 px-3.5 text-xs font-bold text-teal-900 hover:bg-teal-100 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Visual Page Gallery (Real Rendered Pages) */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Inside the Actual PDFs</span>
            <h2 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">
              Visual Page-by-Page Preview Gallery
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Switch between tiers below and click any page to inspect the real institutional typography, charts, and
              evidence tables at full resolution.
            </p>
          </div>
          <SampleReportGallery />
        </div>

        {/* 3. Same-Case Comparison: $149 vs $249 */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-7">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Same Factory · Side-by-Side</span>
            <h2 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">
              What $149 Catches vs. What $249 Uncovers on This Exact Case
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Both tiers immediately caught the deregistration notice and 40.5M RMB enforcement. Here is the deeper
              ownership, mortgage, ISO/patent, and shell-migration intelligence added by the $249 Decision Review.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[740px] w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-700">
                  <th className="w-[22%] px-5 py-4 border-r border-slate-200">Due Diligence Area</th>
                  <th className="w-[37%] px-5 py-4 border-r border-slate-200">$149 Identity Check (9 Pages)</th>
                  <th className="w-[41%] px-5 py-4 bg-teal-600 text-white">$249 Buyer Decision Review (14 Pages)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SAME_CASE_COMPARISON.map((row) => (
                  <tr key={row.area} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 bg-slate-50/40 border-r border-slate-200 align-top">
                      {row.area}
                    </td>
                    <td className="px-5 py-4 leading-relaxed border-r border-slate-100 align-top">
                      {row.tier249Exclusive ? (
                        <span className="inline-flex items-start gap-2 text-slate-400">
                          <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
                          <span>{row.tier149}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-start gap-2 text-slate-600">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" />
                          <span>{row.tier149}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 leading-relaxed bg-teal-50/25 font-medium text-teal-950 align-top">
                      <span className="inline-flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                        <span>{row.tier249}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Full Case Walkthrough Container (SEO & Fast Reading) */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
          {/* Report Top Banner */}
          <div className="bg-slate-950 text-white p-6 md:p-8 border-b border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
                  GoCNScout Independent Buyer Intelligence · Redacted Case Breakdown
                </div>
                <h2 className="mt-2 text-xl md:text-2xl font-extrabold">
                  Target: &ldquo;Zhejiang [REDACTED] Knitting Co., Ltd.&rdquo;
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Buyer Context: Apparel importer evaluating a 25-year-old seamless knitwear manufacturer before placing
                  a $28,000 trial order
                </p>
              </div>
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2.5 text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Analyst Verdict</div>
                <div className="text-sm font-black text-rose-200">CRITICAL — PAUSE DEPOSIT (3 / 30)</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-slate-400 block text-[10px] uppercase">Package</span>
                <strong className="text-white">Buyer Decision Review ($249)</strong>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-slate-400 block text-[10px] uppercase">Turnaround</span>
                <strong className="text-white">28 Hours · Silent</strong>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-slate-400 block text-[10px] uppercase">Surface Profile</span>
                <strong className="text-white">Est. 2001 · 58 Patents · ISO</strong>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <span className="text-slate-400 block text-[10px] uppercase">Verified Reality</span>
                <strong className="text-rose-300">0 Insured Staff · Winding Down</strong>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8 text-sm leading-relaxed text-slate-700">
            {/* Executive Summary */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
              <div className="flex items-center gap-2 font-extrabold text-rose-950">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Executive Summary (Read First)</span>
              </div>
              <p className="mt-2 text-xs md:text-sm text-rose-950/90 leading-relaxed">
                On the surface, this looks like a prestigious 25-year-old manufacturer (founded 2001, 10M RMB paid-in
                capital, customs exporter since 2003, co-drafter of national textile standards). However, Chinese public
                registry &amp; court records reveal <strong>critical distress</strong>: the entity has an active{" "}
                <strong>simplified deregistration notice</strong>, reported <strong>0 insured employees</strong> in
                both 2024 and 2025 annual reports, let <strong>all 58 patents lapse for unpaid fees</strong>, had its{" "}
                <strong>ISO 9001/14001/45001 certificates revoked</strong>, carries a{" "}
                <strong>40.5M RMB resumed court enforcement case</strong> and{" "}
                <strong>83.1M RMB in active chattel mortgages</strong>, while its shareholders registered new
                trading/printing entities sharing the same phone and email.{" "}
                <strong>Do not wire a deposit to this legal entity.</strong>
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950 border-b border-slate-200 pb-2">
                <Building2 className="h-4 w-4 text-teal-600" />
                <span>1. Chinese Legal Identity, Status &amp; Annual-Report Scale</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="w-1/3 bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Chinese Legal Name</td>
                      <td className="px-4 py-2.5">
                        浙江[已脱敏]针织有限公司 (Status: Active —{" "}
                        <strong className="text-rose-700">Simplified Deregistration Notice Active</strong>)
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Unified Social Credit Code</td>
                      <td className="px-4 py-2.5 font-mono">913307827303****** (Customs Exporter Code Verified)</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Establishment &amp; Capital</td>
                      <td className="px-4 py-2.5">
                        Founded 2001 · Registered Capital: 10,000,000 RMB (reduced −81% from peak 52,000,000 RMB) ·
                        Paid-in: 10,000,000 RMB
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">
                        Insured Employees (Annual Report)
                      </td>
                      <td className="px-4 py-2.5 text-rose-700 font-bold">
                        0 insured employees in 2024 &amp; 2025 annual reports (all 3 registered branches are cancelled)
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Official Website &amp; B2B</td>
                      <td className="px-4 py-2.5">
                        Historical domain resolves via HTTP but is unmaintained with no active ICP filing; both
                        Alibaba.com and 1688 storefronts are closed.
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900">Registered Business Scope</td>
                      <td className="px-4 py-2.5">
                        Knitted underwear, woven chemical fiber fabrics, socks, covered yarn (excluding dyeing)
                        manufacturing &amp; sales; goods &amp; technology import/export.
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
                <span>2. Ownership, Historical Changes &amp; Related-Entity Mixing Signals</span>
              </div>
              <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                  <span>
                    <strong>Shareholders &amp; Capital History:</strong> Two individual shareholders (51% / 49%) held
                    control since 2004, with 29 historical registry changes — notably shrinking registered capital from
                    52M RMB down to 10M RMB between 2019 and 2021.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>
                    <strong>Related Entities Sharing Phone/Email (Entity-Migration Risk):</strong> 6 active local
                    companies share the same registered phone/email, including three newly formed 1M RMB trading &amp;
                    printing companies (founded 2022–2024, one chaired by the 49% shareholder). Business operations
                    appear to have migrated away from the indebted legacy factory.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950 border-b border-slate-200 pb-2">
                <Scale className="h-4 w-4 text-teal-600" />
                <span>3. Litigation, Debt, Domestic Certificates, IP &amp; Domestic Platforms</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 text-xs">
                <Card className="border border-slate-200 bg-slate-50/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Judicial, Debt &amp; Mortgage Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-600 space-y-1.5">
                    <p>
                      • <strong>Court Enforcement:</strong> 40.5M RMB resumed enforcement case (Jul 2025) + 480K RMB
                      labor-injury enforcement (2026). Historical dishonest debtor records total 65.27M RMB.
                    </p>
                    <p>
                      • <strong>Chattel Mortgages &amp; Labor:</strong> 3 active chattel mortgages totaling 83.1M RMB
                      (12.4× remaining capital) + 7 historical labor arbitrations + 5 historical administrative penalties.
                    </p>
                    <p>
                      • <strong>Critical Flag:</strong> Simplified deregistration notice active — entity may legally
                      cease to exist imminently.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-slate-50/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Domestic Certificates, IP &amp; Social Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-600 space-y-1.5">
                    <p>
                      • <strong>Domestic ISO Certificates:</strong> All 3 recent ISO 9001/14001/45001 certificates show
                      status <strong>Revoked (撤销)</strong>; older certificates expired. Only customs registration
                      remains active.
                    </p>
                    <p>
                      • <strong>Patents &amp; Trademarks:</strong> 26 trademarks still registered, but{" "}
                      <strong>58 of 58 patents are terminated</strong> due to unpaid annual fees.
                    </p>
                    <p>
                      • <strong>External Pulse:</strong> 0 active jobs on BOSS Zhipin; zero active presence on
                      Xiaohongshu, Douyin, or Zhihu.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 4: Buyer Action Plan */}
            <div className="rounded-2xl border-2 border-teal-500 bg-teal-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950">
                <ClipboardList className="h-5 w-5 text-teal-700" />
                <span>4. Realistic Pre-Payment Safeguards &amp; RFQ Verification Questions</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 text-xs">
                <div>
                  <h3 className="font-bold text-slate-950 mb-2">Recommended Next Steps (Standard Export Practice):</h3>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-700">
                    <li>
                      <strong>Do NOT sign or wire any deposit</strong> to the legacy entity currently undergoing
                      simplified deregistration.
                    </li>
                    <li>
                      Request a watermarked copy of the stamped Chinese Business License (&ldquo;For supplier onboarding
                      only&rdquo;) from whichever active successor entity the rep proposes — and verify that entity
                      first.
                    </li>
                    <li>
                      Require a stamped Proforma Invoice (PI). If paying a Hong Kong or third-party account, require a
                      1-page stamped Payment Authorization Letter from the contracting mainland entity, plus a 5-minute
                      live video check and SGS / TÜV pre-shipment QC for bulk orders.
                    </li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 mb-2">Tailored Questions to Send the Sales Rep:</h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
                    <li>
                      &ldquo;Public records show your company filed a simplified deregistration notice — which active
                      company will actually sign our contract and manufacture the order?&rdquo;
                    </li>
                    <li>
                      &ldquo;Your recent ISO 9001/14001/45001 certificates show status revoked; are you producing under
                      a successor company or subcontracting?&rdquo;
                    </li>
                    <li>
                      &ldquo;Will the PI beneficiary match the active mainland entity, or if using a Hong Kong account,
                      can you issue a stamped Payment Authorization Letter?&rdquo;
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Scope & Confidentiality footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-teal-600" />
                100% Buyer-Side Independent · Silent Desk Review · Scope Confirmed Before Payment
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                Public-record desk research only (no on-site visits, private bank checks, or overseas lab audits)
              </span>
            </div>
          </div>
        </div>

        {/* 5. Bottom CTA */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-950">Have a Chinese supplier you want verified like this?</h2>
          <p className="text-sm text-slate-600">
            Send us the supplier&apos;s English/Chinese name, B2B store link, or website (if any). We confirm what
            records are available before you pay.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink
              href="/pricing?service=DECISION_SINGLE#human-review"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
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
