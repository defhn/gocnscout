import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Database, FileText, ListChecks, Search, ShieldCheck, CheckCircle2, ChevronRight, Sparkles, Check, X, ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqSection } from "@/components/marketing/faq-section";
import { createMetadata, organizationJsonLd, websiteSearchJsonLd } from "@/config/seo";
import { mediaAssets } from "@/config/media";
import { getHomeStats, listCityPages, listIndustryPages } from "@/server/suppliers";
import { AnalysisForm } from "@/components/supplier-check/analysis-form";
import { PricingGrid } from "@/components/pricing/pricing-grid";
import { PLAN_DEFINITIONS } from "@/config/plans";
import { MANUAL_REVIEW_PACKAGES } from "@/config/manual-review";
import { formatUsd } from "@/lib/utils";

export const metadata = createMetadata({
  title: "China Supplier Database for Export Manufacturers",
  description:
    "Search structured public China supplier records by industry, city, products, company type, trade mode, and exhibition history.",
});

const plans = [
  PLAN_DEFINITIONS.FREE,
  PLAN_DEFINITIONS.STARTER,
  PLAN_DEFINITIONS.PRO,
  PLAN_DEFINITIONS.TEAM,
];

export default async function HomePage() {
  const [stats, industries, cities] = await Promise.all([
    getHomeStats().catch(() => ({ supplierCount: 0, industryCount: 0, provinceCount: 0, reportsCount: 0 })),
    listIndustryPages(8).catch(() => []),
    listCityPages(8).catch(() => []),
  ]);

  const orgSchema = organizationJsonLd();
  const searchSchema = websiteSearchJsonLd();

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 py-20 text-white lg:py-28">
        {/* Ambient Blur Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="container-page relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-1 text-sm text-teal-300 font-semibold tracking-wide w-fit">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Verified Export Supplier Sourcing Hub</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
              Unlock 20,000+ Export Exhibitors
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
              Accelerate manufacturer vetting with verified, structured, and compliant records. 
              Search by industry category, regional cluster, product tags, and exporter types.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <ButtonLink href="/database" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all duration-300">
                Search Database <Search className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/china-exporter-database" variant="darkOutline">
                View Sourcing Guide <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
 
          {/* Interactive Mock Dashboard */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md p-6 shadow-2xl transition-all duration-500 hover:border-teal-500/40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs text-slate-400 font-mono">live_database_status.json</div>
            </div>
 
            <div className="space-y-4">
              {/* Pseudo Search input */}
              <div className="relative rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-teal-400" />
                  <span className="animate-pulse border-r border-teal-400 pr-1 text-slate-300">Search &quot;Titanium cups&quot;</span>
                </div>
                <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Ctrl + K</span>
              </div>
 
              {/* Metric grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-teal-500/30">
                  <p className="text-3xl font-bold text-white tracking-tight">{(stats.supplierCount || 20291).toLocaleString("en-US")}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Exhibitors</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-teal-500/30">
                  <p className="text-3xl font-bold text-white tracking-tight">{(stats.industryCount || 54).toLocaleString("en-US")}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Industries</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-teal-500/30">
                  <p className="text-3xl font-bold text-white tracking-tight">{(stats.provinceCount || 35).toLocaleString("en-US")}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Provinces</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-teal-500/30">
                  <p className="text-3xl font-bold text-teal-400 tracking-tight">{(stats.reportsCount || 216).toLocaleString("en-US")}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">PDF Reports</p>
                </div>
              </div>

              {/* Data boundary note */}
              <div className="rounded-lg bg-teal-950/20 border border-teal-800/30 p-3.5 text-xs leading-normal text-teal-300/90 flex items-start space-x-2 mt-2">
                <ShieldCheck className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Compliance Guard Active</strong>: Database fields are structured dynamically in compliance with China&apos;s Data Security Law. Sensitive personal contact points are omitted.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free AI Supplier Checker Input Box */}
      <section className="bg-slate-100 border-b border-slate-200 py-16">
        <div className="container-page max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 px-3.5 py-1 text-xs font-bold text-teal-800 tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5 text-teal-650 animate-pulse" />
            <span>Free AI Supplier Checker</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
            Verify a Chinese Supplier Before You Pay
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Paste an Alibaba product link, store page, or company website. Get an instant, first-pass public-source screening report detailing registration signals and potential red flags.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md max-w-3xl mx-auto text-left relative z-20">
            <AnalysisForm />
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-500 justify-center">
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-teal-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-teal-650" /> Instant report generation
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-teal-650" /> Alibaba & standalone websites
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid Section */}
      <section className="container-page py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Engineered for Global Sourcing Pros</h2>
          <p className="mt-3 text-lg text-slate-600">
            Streamline manufacturer vetting, mapping, and outreach campaigns with structured procurement intelligence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Sourcing Database */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <MediaPanel src={mediaAssets.bentoClusterCost} alt="Industrial cluster cost-reduction visual" />
            <div className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Deep Supplier Database</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Filter verified manufacturers by regional clusters, trade mode, company scale, and official website domain availability.
            </p>
            <Link href="/database" className="inline-flex items-center text-xs font-bold text-teal-600 mt-4 group-hover:text-teal-700">
              Start searching <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Link>
            </div>
          </div>

          {/* Card 2: PDF Reports */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <MediaPanel src={mediaAssets.bentoLogisticsPort} alt="Factory-to-port logistics proximity visual" />
            <div className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Market Intelligence Reports</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Download structural analysis reports detailing cluster density, exporter rankings, product keywords, and custom buyer checklists.
            </p>
            <Link href="/reports" className="inline-flex items-center text-xs font-bold text-blue-600 mt-4 group-hover:text-blue-700">
              Browse reports <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Link>
            </div>
          </div>

          {/* Card 3: Custom Shortlist */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <MediaPanel src={mediaAssets.bentoSkilledLabor} alt="Supplier quality inspection worker visual" />
            <div className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
              <ListChecks className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Custom Supplier Shortlists</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Need niche criteria? Submit specifications to receive custom shortlists with curated manufacturer profiles matching your criteria.
            </p>
            <Link href="/custom-shortlist" className="inline-flex items-center text-xs font-bold text-purple-650 mt-4 group-hover:text-purple-700">
              Request shortlist <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing Workflow Steps */}
      <section className="border-y border-slate-200 bg-white py-16 lg:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Vetting Process Made Simple</h2>
            <p className="mt-2 text-slate-600">How professional buyers utilize our data to secure their supply chain.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <WorkflowStep num="01" title="Select Category" image={mediaAssets.workflowSelectCategory} text="Filter suppliers by industry classifications or raw product description keywords." />
            <WorkflowStep num="02" title="Apply Scale Filters" image={mediaAssets.workflowApplyFilters} text="Narrow candidates down using company registration sizes, trade modes, and locations." />
            <WorkflowStep num="03" title="Inspect Public Profiles" image={mediaAssets.workflowInspectProfile} text="Review exhibition history, export focus areas, and verified website links." />
            <WorkflowStep num="04" title="Perform Direct Vetting" image={mediaAssets.workflowDirectVetting} text="Conduct standard verification audits before placing sample orders or agreements." />
          </div>
        </div>
      </section>

      {/* Custom Module A: Common Supplier Scams We Expose */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-650">B2B Trade Safeguards</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-955 mt-2">Common Sourcing Scams We Expose</h2>
            <p className="mt-2 text-slate-600 text-sm md:text-base leading-relaxed">
              Understand the loopholes bad-faith suppliers exploit, and how our screening signals flag them.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border border-slate-200 bg-slate-50 transition-all duration-300 hover:shadow-md hover:border-red-200">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">The &quot;Canceled Dispute&quot; Trap</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Sellers send fake production photos and beg you to cancel your Alibaba Trade Assurance refund request. Once canceled, Alibaba rules prohibit reopening it.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-bold text-teal-650">
                  GoCNScout Action: Flags historical disputes and warns against dispute cancellation.
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-slate-50 transition-all duration-300 hover:shadow-md hover:border-red-200">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">The &quot;Manufacturer&quot; Illusion</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Trading agents register empty offices and use stock factory photos to masquerade as direct manufacturers, inflating your unit costs by 20% to 50%.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-bold text-teal-650">
                  GoCNScout Action: Cross-checks employee counts, business scope, and IP assets.
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-slate-50 transition-all duration-300 hover:shadow-md hover:border-red-200">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Payment Destination Fraud</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Scammers hack email threads or use similar domains to redirect your TT payments to unrelated offshore or personal bank accounts.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-bold text-teal-650">
                  GoCNScout Action: Verifies official ICP websites and beneficiary registration records.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Custom Module B: Interactive Screening Report Preview */}
      <section className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-650">Report Preview</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">What Does a Screening Report Look Like?</h2>
            <p className="text-slate-650 leading-relaxed text-sm">
              Every free scan and manual audit structures raw records into an intuitive dashboard. Know exactly what to inspect before signing any purchase order.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-650 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-955">Clean Signal Coding</h4>
                  <p className="text-xs text-slate-500 mt-1">Green for verified active parameters, orange for caution points, and red for abnormalities.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-650 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-955">Missing Evidence Alerts</h4>
                  <p className="text-xs text-slate-500 mt-1">Instantly alerts you if the company has zero insured employees, unverified website domains, or missing registration records.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Interactive Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono font-semibold text-slate-400 tracking-wider">REPORT #CS-90281</span>
                <h3 className="text-base font-bold text-slate-955 mt-0.5">Ningbo Precision Tools Factory</h3>
              </div>
              <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-700">Verified Active</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                <span className="font-medium text-slate-500">Unified Social Credit Code</span>
                <span className="font-mono text-slate-900 font-semibold">91330206M... (Matched)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                <span className="font-medium text-slate-500">Registered Capital</span>
                <span className="font-semibold text-slate-900">RMB 10,000,000 (Fully Paid)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                <span className="font-medium text-slate-500">Operating Status</span>
                <span className="text-teal-600 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> In Operation / Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                <span className="font-medium text-slate-500">Alibaba Consistency Score</span>
                <span className="text-teal-600 font-bold">96% High Match</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                <span className="font-medium text-slate-500">Risk Incidents</span>
                <span className="text-emerald-600 font-semibold">0 Abnormalities, 0 Lawsuits</span>
              </div>
              <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 mt-2 text-[11px] leading-relaxed text-teal-850">
                <strong>Analyst Recommendation</strong>: Supplier matches all physical coordinates. Safe to request samples. Ensure bank details beneficiary name matches the company legal Pinyin name.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Module C: Real-time Verification Activity Feed */}
      <section className="bg-slate-950 text-white py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container-page relative z-10 grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Live Coverage</span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Real-time Sourcing Vetting Activity</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Importers worldwide use GoCNScout to vet suppliers hourly. Here are the latest public screening summaries (anonymized for compliance).
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-teal-400">Ningbo, Zhejiang</span>
                <span>12m ago</span>
              </div>
              <p className="font-bold text-white">Power Tools Manufacturer</p>
              <p className="text-slate-300 leading-normal">Free AI Scan completed. Status: Active (Matched with USCC).</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-amber-400">Quanzhou, Fujian</span>
                <span>35m ago</span>
              </div>
              <p className="font-bold text-white">Gifts & Premiums Exporter</p>
              <p className="text-slate-300 leading-normal">Alert: Business Abnormality found. Operating address discrepancy.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-teal-400">Shenzhen, Guangdong</span>
                <span>1h ago</span>
              </div>
              <p className="font-bold text-white">Home Appliances Factory</p>
              <p className="text-slate-300 leading-normal">Manual ID Check delivered. Insured employee size: 45 (Verified).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Directory Browser */}
      <section className="container-page py-16">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Browse Industry & Sourcing Hubs</h2>
          <p className="mt-2 text-slate-600">Discover verified suppliers based in prominent Chinese manufacturing cities and industry clusters.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DirectoryBlock title="Browse by Industry Category" href="/industries" image={mediaAssets.directoryIndustryMatrix} items={industries.map((item) => ({ label: item.industryName, count: item.supplierCount, href: `/industries/${item.slug}` }))} />
          <DirectoryBlock title="Browse by Sourcing City" href="/cities" image={mediaAssets.directoryCityHeatmap} items={cities.map((item) => ({ label: [item.city, item.province].filter(Boolean).join(", "), count: item.supplierCount, href: `/cities/${item.slug}` }))} />
        </div>
      </section>

      {/* Subscription Pricing Grid */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 lg:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-650">Database Access Plans</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-955 mt-2">Simple, Transparent Subscription Tiers</h2>
            <p className="mt-2 text-slate-600 text-sm md:text-base leading-relaxed">
              Unlock advanced search page filtering, bulk CSV downloads, and pre-compiled industry intelligence reports.
            </p>
          </div>
          <PricingGrid plans={plans} />
        </div>
      </section>

      {/* Manual Supplier Verification Packages */}
      <section className="bg-white border-t border-slate-200 py-16 lg:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-[10px] font-extrabold uppercase text-teal-800 tracking-wider">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Verified Sourcing Intelligence
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 mt-3">Manual Supplier Due Diligence</h2>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Chinese sourcing analysts verify corporate databases, litigation registries, court enforcement records, and social footings before you send funds.
            </p>
          </div>

          {/* Manual Review Cards */}
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {MANUAL_REVIEW_PACKAGES.filter(pkg => pkg.supplierSlots === 1).map((pkg) => {
              const isDecision = pkg.code.includes("DECISION");
              return (
                <Card 
                  key={pkg.code} 
                  className={`flex flex-col rounded-2xl transition-all duration-300 relative ${
                    isDecision 
                      ? "border-2 border-teal-500 bg-gradient-to-b from-teal-50/20 via-white to-white shadow-lg scale-[1.01] hover:scale-[1.02]" 
                      : "border border-slate-200 bg-white shadow-xs hover:shadow-md"
                  }`}
                >
                  {isDecision && (
                    <span className="absolute -top-3.5 left-6 inline-flex items-center space-x-1 rounded-full bg-teal-500 px-3 py-1 text-[10px] font-black text-slate-955 uppercase tracking-wider shadow-sm">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      <span>Highly Recommended</span>
                    </span>
                  )}
                  
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-slate-600 tracking-wider">
                        Single Supplier Target
                      </span>
                    </div>
                    <CardTitle className="text-base font-extrabold text-slate-950 mt-3">{pkg.name}</CardTitle>
                    <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      {pkg.delivery}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col p-6 pt-0">
                    <div className="text-3xl font-black tracking-tight text-slate-955">{formatUsd(pkg.amountUsdCents)}</div>
                    <p className="mt-3.5 text-xs leading-relaxed text-slate-600">{pkg.description}</p>
                    
                    <ul className="mt-6 pt-5 border-t border-slate-150 space-y-3.5 text-xs text-slate-700 flex-1">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex gap-2.5 items-start">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-650 bg-teal-50 rounded-full p-0.5" />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <ButtonLink 
                      href={`/api/manual-review/checkout?package=${pkg.code}`} 
                      className="w-full text-xs font-semibold py-3 rounded-xl transition-all duration-200 mt-6 shadow-xs hover:shadow-md" 
                      variant={isDecision ? "teal" : "outline"}
                    >
                      Order Verification
                    </ButtonLink>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Security & Compliance Safe (Replacement for development log) */}
      <section className="border-y border-slate-200 bg-white py-16 lg:py-20">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Compliance & Legal Guarantee</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 mt-2">100% GDPR, CCPA & DSL Compliant</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                gocnscout is engineered to supply cross-border buyers with clean, public manufacturer data. 
                We adhere strictly to international privacy frameworks and local digital asset structures.
              </p>
              <div className="mt-6 space-y-3">
                <ComplianceItem title="Zero Resale of Private Contact Details" text="We exclude personal phone numbers, emails, and home addresses, preventing marketing spam and respecting individual rights." />
                <ComplianceItem title="Non-Sensitive Public Registry Only" text="All profiles originate from official directories, public exhibition registrations, and business license parameters." />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-slate-200 bg-slate-50 transition-all duration-300 hover:shadow-sm hover:border-teal-500/20">
                <CardContent className="p-5">
                  <ShieldCheck className="h-6 w-6 text-teal-600" />
                  <h3 className="mt-3 text-base font-bold text-slate-950">Procurement Safeguard</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">We assist in the preliminary list screening process. Final supplier vetting audits must be performed by the buyer.</p>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 bg-slate-50 transition-all duration-300 hover:shadow-sm hover:border-teal-500/20">
                <CardContent className="p-5">
                  <ShieldCheck className="h-6 w-6 text-teal-600" />
                  <h3 className="mt-3 text-base font-bold text-slate-950">Daily Data Cleansing</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">Our systems dynamically cross-verify website domains, registration statuses, and business scope consistency.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container-page py-16">
        <FaqSection
          title="Frequently Asked Questions"
          items={[
            {
              question: "Is gocnscout a vendor contact directory?",
              answer: "No. gocnscout is an analytical supplier database focused on company structures, regions, and capabilities. We do not sell lists of personal contact emails or phone numbers.",
            },
            {
              question: "How does the database verify Chinese manufacturers?",
              answer: "Our data is cross-referenced using export exhibition directories, official company registration scopes, and active export website domain structures to filter out shell trading firms.",
            },
            {
              question: "What values do the premium subscriptions unlock?",
              answer: "Paid access unlocks unlimited search result pages, filters for exporter types, saved lists, supplier comparisons, bulk CSV exports, and pre-packaged PDF intelligence reports.",
            },
            {
              question: "How is compliance ensured under international privacy laws?",
              answer: "Since our database is limited strictly to public business records and excludes private identifiers, it remains fully compliant with GDPR, CCPA, and China's Data Security Law.",
            },
          ]}
        />
      </section>

      {/* Bottom CTA Block */}
      <section className="bg-gradient-to-br from-slate-950 to-teal-950 text-white py-16 border-t border-slate-800">
        <div className="container-page text-center flex flex-col items-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Access Verified Trade Exhibitor Insights</h2>
          <p className="max-w-xl text-slate-300 text-sm md:text-base leading-relaxed">
            Stop sorting outdated directories or buying lists containing outdated contacts. Search, compare, and shortlist with gocnscout.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <ButtonLink href="/database" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-lg">
              Explore Database Now
            </ButtonLink>
            <ButtonLink href="/pricing" variant="darkOutline">
              Pricing Options <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

function MediaPanel({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
      <Image src={src} alt={alt} fill sizes="(min-width: 768px) 33vw, 100vw" quality={58} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
    </div>
  );
}

function WorkflowStep({ num, title, text, image }: { num: string; title: string; text: string; image: string }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm">
      <div className="relative aspect-square bg-slate-100">
        <Image src={image} alt={`${title} sourcing workflow visual`} fill sizes="(min-width: 768px) 25vw, 100vw" quality={56} className="object-cover" />
      </div>
      <CardContent className="p-6 relative overflow-hidden">
        <span className="absolute right-6 top-2 text-5xl font-extrabold text-slate-200/40 font-mono tracking-tighter select-none">{num}</span>
        <h3 className="text-base font-bold text-slate-950 relative z-10">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 relative z-10">{text}</p>
      </CardContent>
    </Card>
  );
}

function DirectoryBlock({ title, href, image, items }: { title: string; href: string; image: string; items: Array<{ label: string; count: number; href: string }> }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-teal-500/20">
      <div className="relative aspect-[16/9] bg-slate-100">
        <Image src={image} alt={`${title} visual`} fill sizes="(min-width: 1024px) 50vw, 100vw" quality={58} className="object-cover" />
      </div>
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-base font-bold text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid gap-2 mb-4">
          {items.length ? items.map((item) => (
            <div key={item.href} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
              <Link href={item.href} className="text-slate-700 hover:text-teal-600 transition-colors font-medium flex items-center">
                <ChevronRight className="h-3 w-3 text-slate-400 mr-1" />
                {item.label}
              </Link>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-500 font-semibold">{item.count.toLocaleString("en-US")}</span>
            </div>
          )) : <div className="text-sm text-slate-500 italic">Browse list will populate dynamically upon live data sync.</div>}
        </div>
        <ButtonLink href={href} className="w-full justify-center text-xs font-semibold" variant="outline">
          View All Clusters
        </ButtonLink>
      </CardContent>
    </Card>
  );
}

function ComplianceItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start space-x-3">
      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
      <div>
        <h4 className="text-sm font-bold text-slate-950">{title}</h4>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
