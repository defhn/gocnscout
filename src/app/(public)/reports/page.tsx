import Link from "next/link";
import { BookOpen, FileText, ArrowRight, ShieldCheck, Cpu, Hammer, Home, Sparkles, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STRIPE_CATALOG } from "@/config/pricing";
import { createMetadata } from "@/config/seo";
import { formatUsd } from "@/lib/utils";
import { listPublishedReports } from "@/server/reports";

export const metadata = createMetadata({
  title: "China Supplier Industry Reports and Sourcing Guides",
  description: "Download industry PDF reports built from non-sensitive supplier data, covering supplier counts, city clusters, product keywords, and vetting checklists.",
  path: "/reports",
});

export default async function ReportsPage() {
  const reports = await listPublishedReports().catch(() => []);
  const hasRealData = reports.length > 0;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reports" }]} />
      
      <section className="container-page pb-20">
        {/* Header Block */}
        <div className="max-w-4xl py-6 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Sourcing Intelligence</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Industry PDF Reports
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            Download data-driven macro reports analyzing geographic densities, product category distribution ratios, 
            and verified corporate scales of major Chinese exporter clusters.
          </p>
        </div>

        {/* Reports Promotion Banner */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8 mb-16 shadow-2xs">
          <h2 className="text-xl font-bold text-slate-950">Unlock Sourcing Reports with Annual Plans</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
            Gain immediate access to full market intelligence PDF guides mapping regional supplier densities, capital sizes, and export mode ratios.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-extrabold text-teal-600 uppercase">FREE</span>
                <span>Pro & Team Annual</span>
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                All published industry reports are 100% free to download instantly. No additional checkouts required.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-extrabold text-teal-600 uppercase">50% OFF</span>
                <span>Starter Annual</span>
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Get half-price access on every PDF report purchase. Save $49.50 per industry intelligence publication.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-500 uppercase">Standard</span>
                <span>Monthly & Free Users</span>
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Standalone purchases at $99.00 per report. Upgrade to annual billing to unlock discount codes instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Main List Section Header */}
        <div className="border-t border-slate-200 py-10">
          <h2 className="text-2xl font-bold text-slate-950">Published Market Reports</h2>
          <p className="text-xs text-slate-500 mt-1">Select a research publication below to inspect contents, page outlines, and unlock downloads.</p>
        </div>

        {/* Reports Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hasRealData ? (
            reports.map((report) => (
              <Card 
                key={report.id} 
                className="border border-slate-200 bg-white hover:border-teal-500/20 hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {report.type.replaceAll("_", " ")}
                  </span>
                  <h3 className="text-base font-bold text-slate-950 mt-4 leading-snug line-clamp-2">
                    <a href={`/reports/${report.slug}`}>{report.title}</a>
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                    {report.description || "Aggregated category overview mapping manufacturing hubs, corporate sizes, website domains, and compliance checklists."}
                  </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{formatUsd(report.priceUsdCents)}</span>
                  <a href={`/reports/${report.slug}`} className="text-teal-600 font-bold hover:text-teal-700 inline-flex items-center">
                    Review Outline <ArrowRight className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center max-w-2xl mx-auto my-4">
              <div className="mx-auto w-12 h-12 bg-teal-100 text-teal-700 flex items-center justify-center rounded-xl mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Custom Industry Sourcing Reports</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Currently, there are no pre-compiled digital PDF reports available for instant download. 
                However, our research department compiles bespoke geographic cluster analyses, exporter registries, 
                and factory-vetting checklists customized specifically to your procurement targets.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Request Custom Hub Report &amp; RFP
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Structured Chapters (EEAT layout) */}
        <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950 flex items-center mb-6">
            <BookOpen className="h-5 w-5 text-teal-600 mr-2" />
            Standard Report Chapters & Data Outlines
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
            {[
              "Industry Overview & Macro Trends",
              "Registered Capital & Scales",
              "Province Hub Densities",
              "City Manufacturing Clusters",
              "Standardized Product Keywords",
              "Company Size Distributions",
              "Exporter Ownership Nature",
              "Primary Trade Mode Mix",
              "Sample Public Profiles",
              "Buyer Vetting Checklists"
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 flex items-center font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Bento Guide Card block */}
        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <Card className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-base font-bold text-slate-950">Purchase & Delivery Security</h3>
            <div className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900">Instant Digital Delivery</h4>
                <p className="mt-0.5">Purchased reports are unlocked dynamically inside your dashboard. Users can download PDF assets immediately.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Enterprise Invoices</h4>
                <p className="mt-0.5">All billing processes run through Stripe with dynamic VAT/corporate invoice rendering options.</p>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-base font-bold text-slate-950">Analytical Research Purpose</h3>
            <div className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900">Consolidated Hub Insights</h4>
                <p className="mt-0.5">Reports analyze geographical concentrations and category setups to help procurement managers evaluate feasibility.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Compliance & Privacy Borders</h4>
                <p className="mt-0.5">All PDF analysis conforms strictly to GDPR/CCPA and does not contain personal direct contact listings.</p>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-base font-bold text-slate-950">When to use Database Subscription</h3>
            <div className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900">Micro Vetting Filters</h4>
                <p className="mt-0.5">Use the database console when you need to perform direct supplier mapping, website analysis, and compare parameters.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Recurring Sourcing Workflows</h4>
                <p className="mt-0.5">A database subscription is recommended when your organization manages a continuous sourcing pipeline.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <FaqSection
            title="Report FAQ"
            items={[
              {
                question: "Can I request custom product category reports?",
                answer: "Yes. Sourcing departments can request a custom supplier shortlist or target category reports by submitting details to our consultation experts via our Contact page.",
              },
              {
                question: "Do reports include personal supplier emails or phone numbers?",
                answer: "No. In strict compliance with CCPA and GDPR, gocnscout prunes personal coordinates. We provide official business details and verified domains.",
              },
              {
                question: "How do subscription plans benefit report purchases?",
                answer: "Active Pro and Team Annual members get 100% free downloads of all published reports. Starter Annual members receive a 50% discount on every purchase ($49.50 instead of $99.00). Monthly plan subscribers pay standard pricing.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
