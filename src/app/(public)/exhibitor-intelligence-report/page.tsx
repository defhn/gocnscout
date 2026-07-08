import { BookOpen, FileText, ChevronRight, CheckCircle2, ShieldCheck, Download, DollarSign, Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STRIPE_CATALOG } from "@/config/pricing";
import { createMetadata, faqJsonLd } from "@/config/seo";
import { formatUsd } from "@/lib/utils";

export const metadata = createMetadata({
  title: "China Sourcing Intelligence Report | Premium Sourcing Guide",
  description: "Get structured insights on Chinese manufacturers. Category distribution, cluster maps, exporter rankings, and checklists.",
  path: "/exhibitor-intelligence-report",
});

export default function ExhibitorIntelligenceReportPage() {
  const faqs = [
    {
      question: "Is this report downloadable immediately after purchase?",
      answer: "Yes. Once payment is processed, the report PDF is automatically unlocked in your user dashboard for direct download.",
    },
    {
      question: "Why should I buy this report if the search database exists?",
      answer: "The intelligence report provides macro data models, geographical densities, product category distribution ratios, and vetting workflow guides in a presentation-ready format. The database is designed for micro-filtering and exporting records.",
    },
    {
      question: "What is the data coverage of the intelligence report?",
      answer: "The report aggregates non-sensitive structural attributes from the live exhibitor database (including active manufacturers, exporter categories, cluster cities, and domain availability indexes).",
    },
    {
      question: "Can I get a refund if the report doesn't match my target product?",
      answer: "Since PDFs are digital assets, reports are generally non-refundable. We recommend reviewing the detailed chapter outlines and database previews before purchasing.",
    },
  ];

  const faqSchema = faqJsonLd(faqs);

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exhibitor Sourcing Intelligence Report" }]} />
      
      <section className="container-page pb-20">
        {/* Banner Section */}
        <div className="max-w-4xl py-6">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Premium intelligence report</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Exhibitor Sourcing Intelligence Report
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            A comprehensive, data-driven analytical PDF report mapping the industrial distribution, regional cluster densities, exporter profiles, and safety checklists of major export exhibitions.
          </p>
        </div>

        {/* Hero Product layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          {/* Main Info */}
          <div className="space-y-8">
            {/* 3D CSS Book Mockup Container */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center space-x-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs text-teal-700 font-bold">
                  <Calendar className="h-3 w-3" />
                  <span>Latest 2026 Edition</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">China Sourcing Atlas Series</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Navigate China&apos;s complex manufacturing ecosystem with structured analytics. Contains geographical heatmaps, capital distribution tables, and trade verification blueprints.
                </p>
                <div className="text-xs text-slate-400 font-mono">Format: Interactive PDF (78 Pages)</div>
              </div>
              
              {/* Premium 3D Book CSS Representation */}
              <div className="relative shrink-0 select-none pointer-events-none group py-4">
                {/* Book Shadow */}
                <div className="absolute top-2 left-6 w-36 h-48 bg-slate-900/30 rounded-r-lg blur-md" />
                {/* Book body */}
                <div className="relative w-36 h-48 rounded-r-lg bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border-y border-r border-slate-800 flex flex-col justify-between p-4 shadow-xl transform rotate-[-3deg] skew-y-[2deg] transition-all duration-500 hover:rotate-0 hover:skew-y-0">
                  {/* Book spine line */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-r from-black/40 to-transparent" />
                  <div className="space-y-1">
                    <div className="text-[7px] text-teal-400 font-bold uppercase tracking-wider">Intelligence Report</div>
                    <div className="text-[11px] font-extrabold text-white leading-tight">CHINA SOURCING ATLAS</div>
                    <div className="text-[6px] text-slate-400">Trade Exhibitor Analytics</div>
                  </div>
                  <div className="flex items-center justify-between text-[6px] text-slate-500 border-t border-slate-800 pt-2 font-mono">
                    <span>gocnscout</span>
                    <span>v2.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Semantic details summary (FAQ collapsible lists for chapter contents, E-E-A-T SEO optimized) */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">Detailed Report Table of Contents</h2>
              <p className="text-xs text-slate-500">Click headers to inspect subtopics covered in this publication:</p>
              
              <div className="grid gap-3">
                <ChapterAccordion 
                  num="01" 
                  title="Exhibitor Database Structural Overview" 
                  details="Analysis of total registration metrics, division between factories and export agents, average company capital values, and years of export operations."
                />
                <ChapterAccordion 
                  num="02" 
                  title="Macro Industry & Category Mapping" 
                  details="Market share maps across 48 primary directories. Spotlights on high-growth sectors (Solar, EV components, Smart Home appliances) and declining niches."
                />
                <ChapterAccordion 
                  num="03" 
                  title="Geographical & Provincial Clustering" 
                  details="Geographic heatmaps locating manufacturing hubs in Guangdong, Zhejiang, Jiangsu, and Fujian. Sub-analysis of cities like Shenzhen, Ningbo, and Wenzhou."
                />
                <ChapterAccordion 
                  num="04" 
                  title="Capital Structures & Enterprise Scale Analysis" 
                  details="Breakdown of manufacturers by registered capital blocks: Micro (&lt;$500K RMB), Medium ($500K-$5M RMB), and Enterprise scale (&gt;$5M RMB) setups."
                />
                <ChapterAccordion 
                  num="05" 
                  title="Fair Session Exhibition History Tracking" 
                  details="Fidelity reports detailing how long exhibitors have maintained active stands, helping you identify long-term manufacturers from first-time trade firms."
                />
                <ChapterAccordion 
                  num="06" 
                  title="Verified Manufacturer Website Availability Indexes" 
                  details="Ratios of active web domains, e-commerce stores, and local ERP systems in place, illustrating digital reach and direct client communication capabilities."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Panel */}
          <Card className="border border-slate-200 bg-white shadow-lg rounded-2xl overflow-hidden position-sticky top-6">
            <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">PDF Purchase</span>
              <h2 className="text-4xl font-extrabold text-slate-950 mt-2">
                {formatUsd(STRIPE_CATALOG.reports.CANTON_FAIR_INTELLIGENCE.amountUsdCents)}
              </h2>
              <p className="text-xs text-slate-500 mt-1">One-time payment. Instant delivery.</p>
            </div>
            
            <CardContent className="p-6 space-y-5">
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center space-x-2.5">
                  <Download className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Instant PDF download format</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Licensed for internal corporate review</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Compliant non-sensitive data structures</span>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <ButtonLink href="/reports" className="w-full justify-center bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs">
                Acquire Report Copy
              </ButtonLink>
              
              <p className="text-[10px] text-slate-400 leading-normal text-center">
                Requires standard checkout. PDF contains anonymized statistics and sample company profiles. No private contacts resale.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Persona & Utility */}
        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <Card className="border border-slate-200 bg-white shadow-sm rounded-xl">
            <CardContent className="p-5">
              <h3 className="text-base font-bold text-slate-900">Comparing Global Hubs</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Map production clusters across major Chinese industrial cities to match logistics channels and export custom regulations before you make contact.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 bg-white shadow-sm rounded-xl">
            <CardContent className="p-5">
              <h3 className="text-base font-bold text-slate-900">Identify Quality Ratios</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Assess manufacturer capitalization brackets to benchmark factory standards and skip trading agencies posing as direct manufacturers.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 bg-white shadow-sm rounded-xl">
            <CardContent className="p-5">
              <h3 className="text-base font-bold text-slate-900">Database Ready Workflow</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Utilize macro data insights from this report to configure precise database filters on our query portal, saving hours of manual search filters.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Exclusions Statement */}
        <section className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Verification Boundary Statement</h3>
          <div className="grid gap-6 md:grid-cols-2 text-xs leading-relaxed text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900">No Private Communication Channels</h4>
              <p className="mt-1">
                To respect personal boundaries and maintain legal compliance under digital compliance frameworks, this document contains no personal mobile directories, private email indices, or fax registries.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Research & Feasibility Focus</h4>
              <p className="mt-1">
                This analysis compiles structural parameters from public catalogs. The user is entirely responsible for conducting physical product testing, background checks, and negotiating trade terms.
              </p>
            </div>
          </div>
        </section>

        {/* Report FAQs */}
        <section className="mt-16">
          <FaqSection
            title="Intelligence Report FAQ"
            items={faqs}
          />
        </section>
      </section>
    </>
  );
}

function ChapterAccordion({ num, title, details }: { num: string; title: string; details: string }) {
  return (
    <details className="group border border-slate-200 rounded-xl bg-white transition-all duration-300 open:shadow-sm">
      <summary className="flex items-center justify-between gap-3 p-4 font-bold text-xs md:text-sm text-slate-900 cursor-pointer list-none select-none">
        <div className="flex items-center space-x-3">
          <span className="text-teal-600 font-mono font-extrabold">{num}</span>
          <span>{title}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform duration-300" />
      </summary>
      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-50 leading-relaxed">
        {details}
      </div>
    </details>
  );
}
