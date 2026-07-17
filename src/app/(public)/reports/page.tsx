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
import { ReportsList } from "@/components/reports/reports-list";

export const metadata = createMetadata({
  title: "China Sourcing Reports and Supplier Due Diligence PDFs",
  description: "Download China sourcing reports with supplier counts, city clusters, product keywords, exporter profiles, and due diligence checklists for import teams.",
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
            China Sourcing Reports
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            Download industry PDF reports for China supplier due diligence, regional factory clusters, product keywords,
            exporter profiles, and buyer vetting checklists.
          </p>
        </div>

        {/* Reports Promotion Banner */}
        <section className="rounded-2xl border border-teal-100 bg-linear-to-b from-teal-50/40 to-teal-50/10 p-6 md:p-8 mb-16 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-extrabold uppercase text-teal-800 tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
                <span>Instant Sourcing Guides</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">Standalone China Supplier Sourcing Reports</h2>
              <p className="text-sm leading-relaxed text-slate-650 max-w-2xl">
                Gain immediate access to sourcing reports that map regional supplier densities, capital sizes, export mode ratios, and practical due diligence checks. Every report is available as a standalone PDF download.
              </p>
            </div>
            
            <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-xs text-center space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Single Report Price</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-950">$99.00 <span className="text-xs font-normal text-slate-550">/ PDF</span></p>
              </div>
              <div className="space-y-2 text-left text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                  <span>100% Lifetime Access & Updates</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                  <span>Interactive Sourcing Checklists</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main List Section Header */}
        <div className="border-t border-slate-200 py-10">
          <h2 className="text-2xl font-bold text-slate-950">Published Market Reports</h2>
          <p className="text-xs text-slate-500 mt-1">Select a research publication below to inspect contents, page outlines, and unlock downloads.</p>
        </div>

        {/* Interactive Reports Search, Filter & Categories list */}
        <ReportsList initialReports={reports} />

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
                question: "How do I download a purchased report?",
                answer: "Once payment is completed securely through Stripe, the report is instantly unlocked and available for PDF download inside your user dashboard export/reports tab. You will also receive an email confirmation with a download link.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
