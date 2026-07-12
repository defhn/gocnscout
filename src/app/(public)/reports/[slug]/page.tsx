import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { formatUsd } from "@/lib/utils";
import { getPublishedReport, userOwnsReport } from "@/server/reports";
import { getCurrentAppUser } from "@/server/auth";
import { CheckCircle2, ShieldCheck, Lock, Clock, FileText, Check, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReport(slug).catch(() => null);
  if (!report) {
    return createMetadata({
      title: "China Supplier Industry Report",
      description: "Download industry PDF reports based on non-sensitive supplier data, cluster analysis, and buyer vetting checklists.",
      noindex: true,
    });
  }
  return createMetadata({
    title: report.title,
    description:
      report.description ||
      "Industry PDF report based on non-sensitive supplier data, supplier counts, city clusters, product keywords, and buyer verification checklists.",
    path: `/reports/${slug}`,
  });
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReport(slug).catch(() => null);
  if (!report) notFound();

  const user = await getCurrentAppUser();
  const ownsReport = user ? await userOwnsReport(user.id, report.id) : false;

  const isProTeamAnnual = user && 
                          (user.planCode === "PRO" || user.planCode === "TEAM") && 
                          user.billingInterval === "YEAR" && 
                          user.subscriptionStatus === "ACTIVE";

  const isStarterAnnual = user && 
                          user.planCode === "STARTER" && 
                          user.billingInterval === "YEAR" && 
                          user.subscriptionStatus === "ACTIVE";

  // Determine displayed price, delivery note, button text and target link
  let priceDisplay: React.ReactNode = formatUsd(report.priceUsdCents);
  let btnText = "Buy Complete Report";
  let btnHref = `/api/reports/${report.id}/checkout`;
  let deliveryNote = "Instant PDF Download. The file is also stored in your dashboard downloads for lifetime access.";

  if (ownsReport) {
    priceDisplay = <span className="text-teal-600 font-extrabold text-2xl">Purchased</span>;
    btnText = "Download Report (PDF)";
    btnHref = `/api/reports/${report.id}/download`;
    deliveryNote = "You have unlocked this report. Download the PDF directly below or manage it in your dashboard downloads page.";
  } else if (isProTeamAnnual) {
    priceDisplay = (
      <div className="flex flex-col">
        <span className="text-2xl font-extrabold text-teal-600">FREE UNLOCK</span>
        <span className="text-[10px] text-teal-600 mt-1 font-bold uppercase tracking-wider">Included in Pro/Team Annual</span>
      </div>
    );
    btnText = "Unlock Free Report";
    deliveryNote = "As an active Pro/Team Annual Member, you can unlock this industry intelligence report for free instantly.";
  } else if (isStarterAnnual) {
    const halfPriceCents = Math.round(report.priceUsdCents / 2);
    priceDisplay = (
      <div className="flex flex-col">
        <span className="text-xs text-slate-400 line-through font-normal">{formatUsd(report.priceUsdCents)}</span>
        <span className="text-2xl font-extrabold text-teal-600">{formatUsd(halfPriceCents)}</span>
        <span className="text-[10px] text-teal-650 mt-1 font-bold uppercase tracking-wider">50% Starter Annual Discount</span>
      </div>
    );
    btnText = "Buy with 50% Discount";
  }

  // Parse exporter count dynamically
  const countMatch = report.description?.match(/analyzing\s+([\d,]+)/i);
  const totalExporters = countMatch ? parseInt(countMatch[1].replace(/,/g, ""), 10) : 100;
  const isLess = totalExporters < 100;

  const includedSections = [
    "Executive Summary & Sourcing Standards",
    "gocnscout Supplier Audit Framework",
    isLess ? `Vetted Exporter Catalog (All ${totalExporters} Stable Firms)` : "Vetted Exporter Catalog (Top 100 Stable Firms)",
    "Manufacturing Origins & Regional Hub Density",
    "Corporate Size & Capitalization Breakdown",
    "Historic Attendance Stability Index",
    "Supplier Vetting & Verification Checklist",
    "Data Standards & Licensing Disclaimer"
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reports", href: "/reports" }, { label: report.title }]} />
      
      <section className="container-page pb-20">
        <div className="max-w-4xl py-6">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Verified Sourcing Intelligence
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 mt-2">
            {report.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {report.description || "This report is based on non-sensitive supplier data and admin-published analysis."}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left Column: Report Contents */}
          <div className="space-y-8">
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Inside the Report</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  This sourcing intelligence guide is structured into 8 professional chapters to provide an exhaustive, audit-ready profile of manufacturers in this sector.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {includedSections.map((item, index) => (
                    <div 
                      key={item} 
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-teal-500/20 hover:bg-white"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-bold text-teal-700">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Structure Details (EEAT) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/30 p-6 md:p-8">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-teal-600" />
                Data Standard & Audit Verification
              </h2>
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  Our analysts compile the <strong>Exporter Catalog</strong> using data aggregated from official public exhibition registries. Every supplier listed in this sourcing report has been verified across multiple trade sessions, establishing a solid history of operation and export volume.
                </p>
                <p>
                  To assist your compliance department, each supplier entry is pre-mapped with their <strong>Unified Social Credit Code (USCC)</strong>, registered capital, region of origin, and verified website domain. This gives you a fast, reliable checklist to identify trading agents from direct manufacturers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Sidebar */}
          <div className="space-y-6">
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-6">
                {/* Price Display header */}
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Single PDF Guide Price</span>
                  <div className="text-3xl font-extrabold text-slate-900">{priceDisplay}</div>
                </div>

                {/* Specs list */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Delivery
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {deliveryNote}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      Report Specifications
                    </h3>
                    <ul className="mt-1.5 space-y-1.5 text-xs text-slate-600 border-b border-slate-100 pb-3">
                      <li className="flex justify-between">
                        <span className="text-slate-500 font-medium">File format:</span>
                        <span className="font-bold text-slate-800">Vector PDF (Print Ready)</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-slate-500 font-medium">Language:</span>
                        <span className="font-bold text-slate-800">English (Bilingual names)</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-slate-500 font-medium">Catalog size:</span>
                        <span className="font-bold text-slate-800">{isLess ? `${totalExporters}` : "100"} Vetted Exporters</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                      Guarantees & Trust
                    </h3>
                    <ul className="mt-1.5 space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>Vector PDF / Print Ready</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>USCC Codes & Domains mapped</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>Stripe Payment Protection</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                      Compliance Disclaimer
                    </h3>
                    <p className="mt-1.5 text-[10px] leading-normal text-slate-500">
                      Private personal contact info (e.g. personal mobile numbers, WeChat IDs) and raw factory street addresses are excluded to comply with commercial data standards.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0 border-t border-slate-50 bg-slate-50/50">
                <a
                  href={btnHref}
                  className="mt-4 inline-flex w-full h-11 items-center justify-center rounded-xl bg-brand !text-white hover:bg-brand-strong text-xs font-bold transition shadow-sm hover:shadow"
                >
                  {btnText}
                </a>
              </div>
            </Card>

            {/* Quick Helper note */}
            <div className="flex gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-500">
              <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Transactions are secured by Stripe with 256-bit SSL encryption. We do not store your credit card details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
