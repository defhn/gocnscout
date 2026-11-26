import {
  AlertTriangle,
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Container,
  Database,
  FileCheck2,
  FileSearch,
  Globe,
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Store,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaqSection } from "@/components/marketing/faq-section";
import {
  HumanVerificationComparison,
  HumanVerificationPackages,
  HumanVerificationProcess,
} from "@/components/pricing/human-verification-showcase";
import { InquiryRequestForm } from "@/components/pricing/inquiry-request-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNITY_SCOPE, DISCORD_INVITE_URL } from "@/config/community";
import { mediaAssets } from "@/config/media";
import { createMetadata, organizationJsonLd, websiteSearchJsonLd } from "@/config/seo";
import { getHomeStatsCached, listCityPagesCached, listIndustryPagesCached } from "@/server/suppliers";

export const revalidate = 604800;

export const metadata = createMetadata({
  title: "Free China Exhibitor Database & Independent Supplier Verification",
  description:
    "Search 20,000+ China exhibitor records for free and verify Chinese suppliers across GSXT, court judgments, CNCA certificates, and CNIPA patents before paying a deposit.",
});

const INDEPENDENCE_PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Buyer-Funded Independence",
    text: "Not a B2B marketplace. Zero listing fees, ad rankings, or commissions taken from Chinese suppliers.",
  },
  {
    icon: Lock,
    title: "Silent & Confidential Checks",
    text: "We never tip off or contact the target supplier — your negotiations and pricing leverage stay intact.",
  },
  {
    icon: FileSearch,
    title: "Official Chinese Registry Sources",
    text: "Analysts cross-verify GSXT corporate filings, court enforcement portals, CNCA certificates, and CNIPA IP.",
  },
  {
    icon: BadgeCheck,
    title: "Scope Confirmed Before Payment",
    text: "Submit your target free first. You only pay via Stripe after we confirm what public records exist.",
  },
] as const;

const BUYER_PERSONAS = [
  {
    icon: Store,
    audience: "E-Commerce & DTC Sellers",
    subtitle: "Amazon FBA · Shopify · Niche Private Label",
    pain: "Tight budgets where a single $3,000 deposit lost to a trading shell or bad batch wipes out months of margin.",
    path: "Screen candidates free in our database, ask pre-sample questions in Discord, and run a $149 Identity Check before wiring your first sample or deposit.",
    ctaLabel: "Start with Free Database",
    href: "/database",
  },
  {
    icon: Container,
    audience: "Wholesalers & Distributors",
    subtitle: "Repeat Containers · Multi-SKU Catalogs",
    pain: "Lead-time slippage and single-factory dependency when an over-extended supplier subcontracts behind your back.",
    path: "Use our Sourcing City Atlas & multi-session exhibition signals to find cluster factories, then compare your top 3 finalists with the $499 Bundle.",
    ctaLabel: "Compare 3-Supplier Bundle",
    href: "#human-verification",
  },
  {
    icon: Briefcase,
    audience: "Brands & Enterprise Importers",
    subtitle: "Strict Compliance · Custom Tooling & IP",
    pain: "High exposure to revoked domestic ISO certificates, lapsed patents, heavy debt enforcement, or entity-mixing between trading desks and legacy plants.",
    path: "Order a $249 Buyer Decision Review before tooling or deposit — or license the full structured dataset ($6,000/yr) for internal procurement teams.",
    ctaLabel: "Inspect Sample Report",
    href: "/sample-report",
  },
] as const;

const PROCUREMENT_STAGES = [
  {
    stage: "01 · First Quote",
    trigger: "Supplier sends catalog or B2B quote",
    risk: "Trading-only entity, deregistration notice, or mismatched business scope",
    solution: "Free DB lookup + $149 Identity Check (GSXT legal status, business scope & obvious-risk screen)",
  },
  {
    stage: "02 · Shortlist Filter",
    trigger: "Comparing 2–3 supplier quotes",
    risk: "Hidden court enforcements, 0 insured workers, or shell affiliates sharing phone/email",
    solution: "$499 3-Supplier Bundle to eliminate distressed finalists before paying sample/audit fees",
  },
  {
    stage: "03 · Sample & Compliance",
    trigger: "Reviewing ISO / patent / factory-scale claims",
    risk: "Revoked domestic ISO certificates, lapsed patents, or shrinking headcount",
    solution: "$249 Decision Review (domestic certificate status, CNIPA patent status & annual-report insured staff)",
  },
  {
    stage: "04 · Pre-Deposit Check",
    trigger: "Before signing contract or paying 30% deposit",
    risk: "Contracting with a winding-down shell or indebted entity with heavy chattel mortgages",
    solution: "$249 Decision Review (shareholder & related-entity trace + exact supplier document checklist)",
  },
  {
    stage: "05 · Production & QC",
    trigger: "Mass production & pre-shipment",
    risk: "Quality drift, overseas lab compliance, or unauthorized subcontracting",
    solution: "Request stamped license/bank proof & overseas CE/FCC/FDA reports from supplier + book on-site QC (SGS / TÜV)",
  },
] as const;

const RED_FLAGS = [
  {
    icon: ShieldAlert,
    tag: "Case #1 · Winding Down",
    title: "25-Year Legacy Factory Quietly Filing Deregistration",
    text: "Catalog still boasts decades of history, yet Chinese public records reveal an active simplified deregistration notice, 0 insured staff, and cancelled branches.",
  },
  {
    icon: AlertTriangle,
    tag: "Case #2 · Revoked Status",
    title: "Revoked Domestic ISO Certificates & Lapsed Patents",
    text: "Suppliers keep advertising 'ISO 9001 & 50+ Patents' while public registries show every ISO certificate revoked and all patents terminated for unpaid fees.",
  },
  {
    icon: Scale,
    tag: "Case #3 · Debt Collapse",
    title: "Heavy Court Enforcements, Mortgages & Labor Disputes",
    text: "Companies hit with multi-million RMB court enforcements, chattel mortgages, and labor arbitrations often chase fast upfront deposits to survive.",
  },
  {
    icon: FileSearch,
    tag: "Case #4 · Shell Migration",
    title: "Entity-Mixing Across Related Trading Companies",
    text: "Shareholders open new 1M RMB trading shells sharing the same phone/email while leaving debts on the old factory — leaving buyers with weak legal recourse.",
  },
] as const;

const PROFILE_DIMENSIONS = [
  {
    icon: Building2,
    title: "Company Scale & Capital",
    text: "Registered capital, establishment year, headcount band, and company nature to separate established exporters from newly formed shells.",
  },
  {
    icon: Layers,
    title: "Business & Trade Modes",
    text: "Identify whether an exporter lists manufacturer or trading capabilities and supports OEM, ODM, or OBM cooperation.",
  },
  {
    icon: Award,
    title: "Exhibition Track & Signals",
    text: "Multi-session exhibition continuity alongside public signals such as brand exhibitor status, customs certification, and high-tech recognition.",
  },
  {
    icon: Search,
    title: "Products & Export Keywords",
    text: "Search structured product lines and export keywords across 54 industry verticals to pinpoint specialized producers.",
  },
  {
    icon: MapPin,
    title: "Province & Industrial Cluster",
    text: "Verify whether a supplier sits inside China's true manufacturing belt (Shenzhen, Ningbo, Foshan, Yongkang, Quanzhou) or an unrelated city.",
  },
  {
    icon: Globe,
    title: "Official Website & Shortlist",
    text: "Inspect corporate domain links directly and sign in free to save shortlisted candidates for side-by-side review.",
  },
] as const;

export default async function HomePage() {
  const [stats, industries, cities] = await Promise.all([
    getHomeStatsCached().catch(() => ({ supplierCount: 0, industryCount: 0, provinceCount: 0 })),
    listIndustryPagesCached(8).catch(() => []),
    listCityPagesCached(8).catch(() => []),
  ]);

  const orgSchema = organizationJsonLd();
  const searchSchema = websiteSearchJsonLd();
  const supplierCount = (stats.supplierCount || 20291).toLocaleString("en-US");
  const industryCount = (stats.industryCount || 54).toLocaleString("en-US");
  const provinceCount = (stats.provinceCount || 34).toLocaleString("en-US");

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 py-16 text-white lg:py-24">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="container-page relative z-10 grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="flex flex-col space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-1 text-xs sm:text-sm text-teal-300 font-semibold tracking-wide w-fit">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span>100% Buyer-Side Intelligence · Zero Supplier Commissions</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-white leading-[1.08] text-balance">
              Search 20,000+ China Exporters Free. Verify Before You Wire $1.
            </h1>
            <p className="max-w-2xl text-base md:text-lg leading-relaxed text-slate-300">
              Screen Chinese exhibitor profiles by product, industrial cluster, trade mode, and scale with zero paywall.
              Before you pay for samples, tooling, or a 30% deposit, our analysts cross-check Chinese GSXT, court, CNCA,
              and IP records in 24-48 hours.
            </p>

            {/* Direct Free Database Search Box */}
            <form action="/database" method="get" className="w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-xl">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search products, company names, or cities (e.g. Luggage, LED, Ningbo)..."
                    className="h-11 w-full rounded-lg bg-slate-950/70 pl-10 pr-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-500 px-5 text-sm font-bold text-slate-950 hover:bg-teal-400 transition-colors cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  Search Free
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Popular:</span>
                {["Hardware", "Home Textiles", "Kitchen & Tableware", "Lighting Products", "Bags & Luggage"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/database?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-slate-300 hover:border-teal-500/60 hover:text-teal-300 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </form>

            <div className="flex flex-wrap gap-3 pt-1">
              <ButtonLink href="/database" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all duration-300">
                Open Full Free Database <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <a
                href="#human-verification"
                className="inline-flex h-10 items-center justify-center rounded-md border border-teal-500/40 bg-teal-500/10 px-4 text-sm font-semibold text-teal-200 hover:bg-teal-500/20 transition-colors"
              >
                <UserCheck className="mr-2 h-4 w-4" /> Verify a Supplier ($149–$249)
              </a>
              <Link
                href="/sample-report"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-700 px-4 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <FileCheck2 className="mr-2 h-4 w-4 text-teal-400" /> Sample Report
              </Link>
            </div>
          </div>

          {/* Right side: 4-metric overview + Sample Record Preview */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/85 backdrop-blur-md p-6 shadow-2xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{supplierCount}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Exhibitor records</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{industryCount}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Industries</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{provinceCount}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Provinces &amp; Regions</p>
              </div>
              <div className="rounded-xl border border-teal-800/50 bg-teal-950/30 p-4">
                <p className="text-2xl sm:text-3xl font-bold text-teal-300 tracking-tight">$0</p>
                <p className="mt-1 text-[11px] font-semibold text-teal-200/80 uppercase tracking-wide">Database Paywall</p>
              </div>
            </div>

            {/* Sample Record Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-teal-400">Free Preliminary Screening Layer</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">Lighting Cluster</span>
              </div>
              <p className="mt-2 text-sm font-bold text-white">Ningbo Precision Lighting Co., Ltd.</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">Zhejiang · Ningbo</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">Est. 2011</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">OEM / ODM</span>
                <span className="rounded bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-teal-300">Multi-session Exhibitor</span>
              </div>
            </div>

            <div className="rounded-lg bg-teal-950/25 border border-teal-800/30 p-3.5 text-xs leading-normal text-teal-300/90 flex items-start space-x-2">
              <ShieldCheck className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
              <span>
                Company-level public registry data only (private phone numbers and emails are never published). Use the
                free database for initial discovery, then verify legal identity before payment.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Buyer-Side Independence Strip (Why Not Just Trust B2B Badges?) */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INDEPENDENCE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-950">{pillar.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{pillar.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Built for Every Sourcing Scale (3 Buyer Personas) */}
      <section className="container-page py-16 lg:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Tailored Sourcing Workflows</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            How overseas buyers use GoCNScout at every order size
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Whether you are testing a 300-unit SKU or locking in a multi-container OEM partner, match the right free
            tools and verification depth to your risk exposure.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {BUYER_PERSONAS.map((persona) => {
            const Icon = persona.icon;
            return (
              <Card key={persona.audience} className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-teal-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3 text-lg font-extrabold text-slate-950">{persona.audience}</CardTitle>
                  <p className="text-xs font-semibold text-teal-700">{persona.subtitle}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4 text-xs leading-relaxed">
                  <div className="rounded-xl bg-rose-50/70 border border-rose-100 p-3 text-slate-700">
                    <strong className="text-rose-900 block mb-0.5">Core Exposure:</strong>
                    {persona.pain}
                  </div>
                  <p className="text-slate-600 flex-1">
                    <strong className="text-slate-900">Recommended Path: </strong>
                    {persona.path}
                  </p>
                  <Link
                    href={persona.href}
                    className="inline-flex items-center font-bold text-teal-700 hover:text-teal-800 pt-1"
                  >
                    {persona.ctaLabel} <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. Free Preliminary Screening vs Official Chinese Registry Due Diligence (Gap Matrix) */}
      <section className="bg-white border-y border-slate-200 py-16 lg:py-20">
        <div className="container-page">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Closing the Information Gap</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Free Exhibitor Screening vs. Official Chinese Registry Verification
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
              Our free database solves <strong>supplier discovery</strong>. Because public exhibition directories do not
              expose legal representatives, court defaults, or certificate authenticity, our human analysts bridge the
              last mile across Chinese government registries.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Layer 1: Free Exhibitor DB */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 md:p-8 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-extrabold text-teal-900">
                  Layer 1 · Free Self-Serve Tool
                </span>
                <span className="text-sm font-black text-teal-700">$0 Forever</span>
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-slate-950">
                20,000+ Exhibitor Database (Initial Discovery)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Ideal for building an initial candidate list by product category and industrial cluster:
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 flex-1">
                {PROFILE_DIMENSIONS.map((dim) => {
                  const Icon = dim.icon;
                  return (
                    <div key={dim.title} className="rounded-xl border border-slate-200 bg-white p-3.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-950">
                        <Icon className="h-4 w-4 text-teal-600 shrink-0" />
                        <span>{dim.title}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{dim.text}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6">
                <ButtonLink href="/database" variant="outline" className="w-full justify-center font-semibold text-xs">
                  <Database className="mr-2 h-4 w-4" /> Search {supplierCount} Free Profiles
                </ButtonLink>
              </div>
            </div>

            {/* Layer 2: Paid Official Chinese Sources */}
            <div className="rounded-2xl border-2 border-teal-600 bg-slate-950 text-white p-6 md:p-8 flex flex-col shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-teal-500/20 border border-teal-500/40 px-3 py-1 text-xs font-extrabold text-teal-300">
                  Layer 2 · Human Analyst Penetration
                </span>
                <span className="text-sm font-black text-teal-300">From $149 · 24-48h</span>
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-white">
                4 Chinese Official Systems Public English Tools Miss
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                What our bilingual analysts verify manually before you sign a contract or wire a deposit:
              </p>

              <div className="mt-5 space-y-3 flex-1 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="font-bold text-teal-300">1. GSXT (National Enterprise Credit Publicity System)</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Exact Chinese legal name, Unified Social Credit Code (USCC), active vs. deregistration notices,
                    paid-in vs. subscribed capital, legal representative, shareholder chain, related entities sharing
                    phone/email, and manufacturing vs. trading-only business scope.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="font-bold text-teal-300">2. China Judgments, Enforcement &amp; Debt Records</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Supply-contract &amp; bank-loan lawsuits, current and historical dishonest judgment debtors
                    (&ldquo;Laolai&rdquo;), chattel mortgages, guarantees, equity pledges, labor arbitrations, and
                    administrative penalties.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="font-bold text-teal-300">3. Domestic Certificates, Customs &amp; Insured Headcount</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Domestic Chinese certificate status (ISO valid vs. revoked/expired), customs exporter registration,
                    tax/environmental credit ratings, and annual-report insured employee count.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="font-bold text-teal-300">4. CNIPA Patents/Trademarks, Standards &amp; Domestic Platforms</div>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Trademark validity, active vs. fee-terminated patents, website ICP filings (when listed), national
                    standards, and manual reputation checks on Xiaohongshu, Douyin, and Zhihu.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#human-review"
                  className="inline-flex flex-1 h-10 items-center justify-center rounded-xl bg-teal-500 px-4 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-colors"
                >
                  Request Scope Confirmation <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </a>
                <Link
                  href="/sample-report"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-700 px-4 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Read Sample Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Industry & Sourcing City Directory Browser */}
      <section className="container-page py-16 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">China Sourcing Atlas</span>
            <h2 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">
              Browse by Industry Category &amp; Manufacturing Cluster
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Suppliers located inside established industrial hubs enjoy stronger upstream component supply and lower
            disruption risk.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <DirectoryBlock
            title="Browse by Industry Category"
            href="/industries"
            image={mediaAssets.directoryIndustryMatrix}
            items={industries.map((item) => ({
              label: item.industryName,
              count: item.supplierCount,
              href: `/industries/${item.slug}`,
            }))}
          />
          <DirectoryBlock
            title="Browse by Sourcing City"
            href="/cities"
            image={mediaAssets.directoryCityHeatmap}
            items={cities.map((item) => ({
              label: [item.city, item.province].filter(Boolean).join(", "),
              count: item.supplierCount,
              href: `/cities/${item.slug}`,
            }))}
          />
        </div>
      </section>

      {/* 6. 4 Costly Sourcing Traps + 5-Stage Procurement Risk Map */}
      <section className="bg-slate-950 text-white py-16 lg:py-20 border-y border-slate-800">
        <div className="container-page space-y-14">
          <div>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" /> Real Cross-Border Failure Modes
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                4 supplier traps that swallow overseas deposits
              </h2>
              <p className="mt-3 text-base text-slate-300 leading-relaxed">
                Most sourcing losses happen because buyers skip Chinese registry verification and rely solely on B2B
                chat promises or PDF scans.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {RED_FLAGS.map((flag) => {
                const Icon = flag.icon;
                return (
                  <div
                    key={flag.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6 flex flex-col"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">{flag.tag}</span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-white">{flag.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{flag.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5-Stage Procurement Trigger Strip */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">When to Verify</span>
              <h3 className="mt-1 text-xl md:text-2xl font-bold text-white">
                What to check at each stage of your China order
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              {PROCUREMENT_STAGES.map((item) => (
                <div key={item.stage} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-black text-teal-400">{item.stage}</div>
                    <div className="mt-1 text-xs font-bold text-white">{item.trigger}</div>
                    <p className="mt-2 text-[11px] text-amber-300/90 leading-relaxed">
                      <strong>Risk:</strong> {item.risk}
                    </p>
                  </div>
                  <p className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-teal-300">Defense:</strong> {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Inside a Human Verification Report (Sample Report Anatomy + Full Sample Link) */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Deliverable Preview</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">
                See exactly what our 24-48h verification uncovers
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                We don&apos;t hand you raw machine-translated Chinese tables. Every report gives you a clear executive
                verdict, cross-verified registry evidence, and exact contract/bank safeguards before you wire funds.
              </p>

              <div className="space-y-3 pt-1 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span><strong>Legal Status &amp; Scale Reality Check:</strong> Spots deregistration notices, 0-staff annual reports, capital reductions, and revoked domestic ISO certificates before you commit.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span><strong>Debt, Litigation &amp; Shell-Migration Trace:</strong> Uncovers court enforcements, chattel mortgages, labor arbitrations, and related trading companies sharing phone/email.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span><strong>Actionable Pre-Deposit Playbook:</strong> Clear <em>Proceed / Caution / Pause</em> verdict, tailored RFQ questions, and exact documents to request from the supplier (license scan, bank proof, overseas test reports).</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-3">
                <ButtonLink href="/sample-report" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  <FileCheck2 className="mr-2 h-4 w-4 text-teal-400" /> Read Full Redacted Sample Report
                </ButtonLink>
                <a
                  href="#human-review"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Submit Your Supplier <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Real Case Redacted Snapshot + Actual Rendered PDF Preview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-950 text-white p-6 md:p-7 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400">Real Redacted Case Snapshot</p>
                  <h3 className="mt-1 text-base md:text-lg font-bold text-white">
                    &ldquo;Zhejiang [Redacted] Knitting Co.&rdquo; · $249 Review (14 Pages)
                  </h3>
                </div>
                <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-[11px] font-extrabold text-rose-300">
                  PAUSE DEPOSIT
                </span>
              </div>

              {/* Actual Rendered PDF Page Thumbnails */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/sample-report"
                  className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-md hover:border-teal-400 transition-colors"
                >
                  <img
                    src="/samples/previews/decision-249-p01.webp"
                    alt="GoCNScout $249 Buyer Decision Review Cover Page"
                    loading="lazy"
                    className="aspect-[210/270] w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 rounded bg-slate-950/85 px-2 py-0.5 text-[10px] font-bold text-slate-100">
                    Cover · Verdict
                  </span>
                </Link>
                <Link
                  href="/sample-report"
                  className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-md hover:border-teal-400 transition-colors"
                >
                  <img
                    src="/samples/previews/decision-249-p03.webp"
                    alt="GoCNScout $249 6-Dimension Radar Scorecard Page"
                    loading="lazy"
                    className="aspect-[210/270] w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 rounded bg-slate-950/85 px-2 py-0.5 text-[10px] font-bold text-slate-100">
                    Page 03 · 6-Dim Radar
                  </span>
                </Link>
              </div>

              <div className="mt-5 space-y-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">1. Surface Prestige vs. Registry Reality</span>
                    <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300">Deregistering</span>
                  </div>
                  <p className="mt-1.5 text-slate-400 leading-relaxed">
                    Looked like a 25-year-old manufacturer (est. 2001, 58 patents, ISO), yet records revealed an active
                    simplified deregistration notice, 0 insured employees, and all 58 patents terminated for unpaid fees.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">2. Debt, Revoked ISO &amp; Related Shells</span>
                    <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">High Distress</span>
                  </div>
                  <p className="mt-1.5 text-slate-400 leading-relaxed">
                    40.5M RMB resumed court enforcement, 83.1M RMB in active chattel mortgages, revoked ISO 9001
                    certificates, and 3 newly formed related trading/printing entities sharing phone &amp; email.
                  </p>
                </div>

                <div className="rounded-xl border border-teal-500/30 bg-teal-950/35 p-4">
                  <div className="flex items-center gap-2 font-bold text-teal-300">
                    <ClipboardCheck className="h-4 w-4 shrink-0" />
                    <span>3. Buyer Decision Guidance Delivered</span>
                  </div>
                  <p className="mt-1.5 text-slate-200 leading-relaxed">
                    Advised buyer to pause all payments to the winding-down entity, identify the active contracting
                    successor, and verify that entity before signing or sending a deposit.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">Turnaround: 28 hours · Supplier never notified</span>
                <Link
                  href="/sample-report"
                  className="inline-flex items-center text-xs font-bold text-teal-300 hover:text-teal-200"
                >
                  Inspect Full Redacted Report <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Human Verification Packages (100% synced with /pricing) */}
      <section id="human-verification" className="bg-slate-50 py-16 lg:py-20 scroll-mt-20">
        <div className="container-page">
          <HumanVerificationPackages
            eyebrow="Human Verification Services"
            heading="Choose the right verification depth before you pay"
            subtitle="Identical pricing to our full services page. Select a package to request free scope confirmation — you only pay via Stripe once we confirm record availability."
            inPageAnchor
          />
        </div>
      </section>

      {/* 9. $149 vs $249 Comparison Table + 4-Step Process + Direct Inline Request Form */}
      <section className="bg-white border-y border-slate-200 py-16 lg:py-20">
        <div className="container-page space-y-16">
          <HumanVerificationComparison />

          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Zero Upfront Risk</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Scope confirmed first. Payment second.
              </h2>
            </div>
            <HumanVerificationProcess />
          </div>

          {/* Direct Inline Inquiry Request Form */}
          <div id="human-review" className="max-w-2xl mx-auto scroll-mt-24">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Start Here — Free Scope Check</span>
              <h2 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">
                Have a Chinese supplier you want checked?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Send us their English/Chinese name, B2B storefront, or website. We reply by email to confirm what public
                records exist and the exact price before any payment.
              </p>
            </div>
            <InquiryRequestForm redirectTo="/pricing#human-review" />
          </div>
        </div>
      </section>

      {/* 10. Discord Community + Expanded FAQ + Bottom CTA */}
      <section className="container-page py-16 lg:py-20 space-y-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-10 shadow-sm grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Free Sourcing Community</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Ask general sourcing questions on Discord</h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Not ready for a paid company check yet? Join other importers and Amazon/DTC buyers in our Discord to ask
              process questions, learn how to read Chinese business licenses, and grab our free pre-contact checklist.
            </p>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-md bg-teal-600 px-5 text-sm font-semibold !text-white hover:bg-teal-700 transition-colors"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Join the Discord community
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border border-teal-200 bg-teal-50/40">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-950">Free in the community</h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                  {COMMUNITY_SCOPE.free.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-slate-50">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-950">Paid human services</h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                  {COMMUNITY_SCOPE.paid.map((item) => (
                    <li key={item} className="flex gap-2">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <FaqSection
          title="Frequently Asked Questions"
          items={[
            {
              question: "Is the China exporter database really 100% free?",
              answer:
                "Yes. You can search, filter, and open all 20,000+ exhibitor profiles without signing up or hitting a paywall. Signing in free lets you save shortlisted companies. Visitor CSV downloads are disabled to prevent spam.",
            },
            {
              question: "How is GoCNScout different from B2B marketplace 'Verified' badges?",
              answer:
                "B2B marketplaces earn revenue from Chinese suppliers through memberships and ad placements. GoCNScout is 100% independent and buyer-funded — we never accept supplier fees, never take order commissions, and never alert the supplier that you are checking them.",
            },
            {
              question: "Are companies in the free database already verified factories?",
              answer:
                "No. Free database profiles come from public exhibitor registry records and are meant for initial discovery only. They do not expose Unified Social Credit Codes, shareholder chains, lawsuits, or certificate validity — always verify a finalist before wiring samples or deposits.",
            },
            {
              question: "What if I only have an English name, WeChat quote, or Alibaba store URL?",
              answer:
                "Send us whatever you have — an English company name, Alibaba / Made-in-China store link, website, or Proforma Invoice. During our free scope check, we confirm whether we can trace the underlying Chinese legal entity before you pay anything.",
            },
            {
              question: "Will the supplier know I ordered a verification on them?",
              answer:
                "Never. Our reviews are 100% silent desk investigations across official Chinese registries and public platforms. We do not call, email, or tip off the supplier.",
            },
            {
              question: "How do desk reviews ($149–$249) work alongside physical QC agencies like SGS or TÜV?",
              answer:
                "Use our $149–$249 desk review BEFORE paying deposits or booking costly $800–$1,500 on-site audits — it exposes deregistration notices, lawsuits, chattel mortgages, revoked domestic ISO certificates, lapsed patents, and related-entity shell risks upfront. We do not verify private bank accounts, audit overseas CE/FCC/FDA lab reports, or visit physical factories; instead, we give you the exact checklist of documents to request from the supplier and recommend pairing large orders with sample testing and pre-shipment QC.",
            },
            {
              question: "Do I pay upfront before you confirm what can be checked?",
              answer:
                "No. Submit the request form first, receive our email confirming exact scope and price, and pay via a secure Stripe link only after you approve.",
            },
            {
              question: "Do you publish or sell personal phone numbers or private emails?",
              answer:
                "No. Contact persons, mobile numbers, and personal emails are never published or sold on GoCNScout.",
            },
          ]}
        />
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-slate-950 to-teal-950 text-white py-16 border-t border-slate-800">
        <div className="container-page text-center flex flex-col items-center space-y-5">
          <h2 className="text-3xl font-bold tracking-tight">Eliminate supplier blind spots before you wire a deposit</h2>
          <p className="max-w-xl text-slate-300 text-sm md:text-base leading-relaxed">
            Screen {supplierCount} exporter profiles for free, inspect our redacted $249 sample report, or submit a
            supplier for free scope confirmation today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <ButtonLink href="/database" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-lg">
              Search Companies Free <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/sample-report"
              variant="outline"
              className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white font-semibold"
            >
              Read Sample Report
            </ButtonLink>
            <a
              href="#human-review"
              className="inline-flex h-10 items-center justify-center rounded-md bg-white/10 border border-teal-400/40 px-4 text-sm font-semibold text-teal-200 hover:bg-white/15 transition-colors"
            >
              Request Supplier Verification
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function DirectoryBlock({
  title,
  href,
  image,
  items,
}: {
  title: string;
  href: string;
  image: string;
  items: Array<{ label: string; count: number; href: string }>;
}) {
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
          {items.length ? (
            items.map((item) => (
              <div key={item.href} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                <Link href={item.href} className="text-slate-700 hover:text-teal-600 transition-colors font-medium flex items-center">
                  <ChevronRight className="h-3 w-3 text-slate-400 mr-1" />
                  {item.label}
                </Link>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-500 font-semibold">
                  {item.count.toLocaleString("en-US")}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500 italic">Browse list will populate dynamically upon live data sync.</div>
          )}
        </div>
        <ButtonLink href={href} className="w-full justify-center text-xs font-semibold" variant="outline">
          View All
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
