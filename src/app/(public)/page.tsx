import {
  AlertTriangle,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileSearch,
  Globe,
  Layers,
  MapPin,
  MessageCircle,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
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
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNITY_SCOPE, DISCORD_INVITE_URL } from "@/config/community";
import { mediaAssets } from "@/config/media";
import { createMetadata, organizationJsonLd, websiteSearchJsonLd } from "@/config/seo";
import { getHomeStatsCached, listCityPagesCached, listIndustryPagesCached } from "@/server/suppliers";

export const revalidate = 604800;

export const metadata = createMetadata({
  title: "Free China Exhibitor Database & Human Supplier Verification",
  description:
    "Search 20,000+ China exhibitor records for free, ask sourcing questions in our Discord community, and order 24-48h human supplier verification before paying a deposit.",
});

const WORKFLOW_STEPS = [
  {
    step: "Step 1",
    badge: "100% Free",
    title: "Discover & Shortlist Exporters",
    text: "Filter 20,000+ Chinese exhibitor profiles by product keywords, sourcing city, OEM/ODM trade mode, registered capital, and founding year — no paywall.",
    image: mediaAssets.workflowApplyFilters,
    ctaLabel: "Open Free Database",
    href: "/database",
  },
  {
    step: "Step 2",
    badge: "Free Community",
    title: "Sanity-Check in Discord",
    text: "Unsure how to interpret a company field, a supplier quote, or what documents to request first? Ask in our sourcing community for free.",
    image: mediaAssets.workflowInspectProfile,
    ctaLabel: "Join Discord",
    href: DISCORD_INVITE_URL,
    external: true,
  },
  {
    step: "Step 3",
    badge: "24-48h Human Review",
    title: "Verify Before You Pay a Deposit",
    text: "Once you narrow down 1-3 finalists, our human analysts cross-check Chinese registration, ownership, litigation, IP, and store consistency.",
    image: mediaAssets.workflowDirectVetting,
    ctaLabel: "Compare Verification Plans",
    href: "#human-verification",
  },
] as const;

const PROFILE_DIMENSIONS = [
  {
    icon: Building2,
    title: "Company Scale & Capital",
    text: "Registered capital, establishment year, headcount band, and company nature to separate established factories from newly registered shells.",
  },
  {
    icon: Layers,
    title: "Business & Trade Modes",
    text: "Identify whether an exporter operates as a manufacturer or trading company and supports OEM, ODM, or OBM cooperation.",
  },
  {
    icon: Award,
    title: "Exhibition Track & Signals",
    text: "Multi-session exhibitor history alongside public signals such as brand exhibitor status, customs certification, and high-tech recognition.",
  },
  {
    icon: Search,
    title: "Products & Export Keywords",
    text: "Search across structured product lines and export keywords to find niche factories across 54 industry verticals.",
  },
  {
    icon: MapPin,
    title: "Province & Industrial Cluster",
    text: "Pinpoint whether a supplier sits inside a core manufacturing hub (e.g. Shenzhen, Ningbo, Foshan, Quanzhou) or an unrelated city.",
  },
  {
    icon: Globe,
    title: "Official Website & Shortlist",
    text: "Visit published corporate websites directly and sign in to save shortlisted suppliers to your personal workspace.",
  },
] as const;

const RED_FLAGS = [
  {
    icon: ShieldAlert,
    title: "Trading Shell Disguised as Factory",
    text: "Many B2B storefronts showcase borrowed workshop videos while their Chinese registry shows zero insured staff and a trading-only business scope.",
  },
  {
    icon: FileSearch,
    title: "Entity & Beneficiary Mismatch",
    text: "The English brand name, B2B storefront, corporate website filing, and invoice or wire beneficiary belong to completely different legal entities.",
  },
  {
    icon: Scale,
    title: "Hidden Lawsuits & Dishonest Debtors",
    text: "Active supply-contract litigation, dishonest judgment debtor records, equity pledges, or business abnormalities rarely appear on English listings.",
  },
  {
    icon: AlertTriangle,
    title: "Unverified Patents & Certificates",
    text: "Suppliers frequently claim proprietary molds, patents, or export certifications that have no matching record in Chinese public registries.",
  },
] as const;

const REPORT_MODULES = [
  {
    code: "01",
    title: "Legal Entity & Ownership Trace",
    detail: "Chinese legal name, Unified Social Credit Code, registered address, shareholder control, and historical changes to legal rep or address.",
  },
  {
    code: "02",
    title: "Storefront & Website Consistency",
    detail: "Cross-check between Alibaba / B2B store, official website ICP/owner signals, stated product lines, and actual registered business scope.",
  },
  {
    code: "03",
    title: "Litigation, Enforcement & Penalties",
    detail: "Human interpretation of contract lawsuits, hearing trends, dishonest debtor records, administrative penalties, and equity pledges.",
  },
  {
    code: "04",
    title: "Operating Scale, IP & Social Signals",
    detail: "Insured employee count, administrative licenses, trademarks, patents, and manual checks across Xiaohongshu, Douyin, and Zhihu.",
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
              <span>Free China Exporter Database + Human Verification</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-white leading-[1.08] text-balance">
              Search 20,000+ China Exporters Free. Verify Before You Pay.
            </h1>
            <p className="max-w-2xl text-base md:text-lg leading-relaxed text-slate-300">
              Filter Chinese exhibitors by product, industry, city, trade mode, and company scale completely free — no
              sign-up, no paywall. When you are ready to sample or pay a deposit, our analysts verify the supplier in
              24-48 hours.
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
                <UserCheck className="mr-2 h-4 w-4" /> Verify a Supplier
              </a>
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
                <p className="mt-1 text-[11px] font-semibold text-teal-200/80 uppercase tracking-wide">Database Search</p>
              </div>
            </div>

            {/* Sample Record Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-teal-400">Sample Free Profile</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">Lighting Products</span>
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
                Company-level public information only. Personal phone numbers and private emails are never published.
                Always verify company identity before samples or payment.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 3-Step Buyer Workflow */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-20">
        <div className="container-page">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">How buyers use gocnscout</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              From free supplier discovery to confident deposit decisions
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Start with our open exhibitor database, ask quick questions in Discord, and use human due diligence only
              on the finalists that matter.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {WORKFLOW_STEPS.map((item) => (
              <Card key={item.step} className="overflow-hidden flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] bg-slate-100 border-b border-slate-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    quality={65}
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6 flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{item.step}</span>
                    <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 flex-1">{item.text}</p>
                  {"external" in item && item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-800"
                    >
                      {item.ctaLabel} <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="mt-5 inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-800"
                    >
                      {item.ctaLabel} <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Inside Every Free Company Profile */}
      <section className="container-page py-16 lg:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Free Company Database</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            What&apos;s inside every free exporter profile
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Structured company-level fields designed to help you screen out mismatches before spending hours emailing
            unqualified contacts.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROFILE_DIMENSIONS.map((dim) => {
            const Icon = dim.icon;
            return (
              <div
                key={dim.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-500/30 transition-colors"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-950">{dim.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{dim.text}</p>
              </div>
            );
          })}
        </div>

        {/* Visual Signal Strip */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { image: mediaAssets.signalCapitalRegistration, label: "Registered Capital & Founding Signals" },
            { image: mediaAssets.signalExhibitionStability, label: "Exhibition Stability & Certifications" },
            { image: mediaAssets.signalWebsiteVerification, label: "Corporate Website & Product Footprint" },
          ].map((signal) => (
            <div key={signal.label} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="relative aspect-[16/9] bg-slate-100">
                <Image
                  src={signal.image}
                  alt={signal.label}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  quality={60}
                  className="object-cover"
                />
              </div>
              <div className="px-4 py-3 text-xs font-bold text-slate-800">{signal.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <ButtonLink href="/database" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
            <Database className="mr-2 h-4 w-4" /> Explore All {supplierCount} Free Profiles
          </ButtonLink>
        </div>
      </section>

      {/* 4. Industry & Sourcing City Directory Browser */}
      <section className="container-page pb-16 lg:pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">China Sourcing Atlas</span>
            <h2 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">
              Browse by Industry Category &amp; Manufacturing Hub
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Jump straight into China&apos;s regional industrial clusters to see where real exporters concentrate.
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

      {/* 5. Why Public Directories Aren't Enough (4 Red Flags) */}
      <section className="bg-slate-950 text-white py-16 lg:py-20 border-y border-slate-800">
        <div className="container-page">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" /> Before You Pay a Deposit
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              4 supplier risks public directories cannot catch
            </h2>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              A polished English catalog or exhibition listing proves marketing presence — not legal safety, factory
              ownership, or financial reliability.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {RED_FLAGS.map((flag) => {
              const Icon = flag.icon;
              return (
                <div
                  key={flag.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{flag.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{flag.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Inside a Human Verification Report (Sample Report Anatomy) */}
      <section className="bg-white border-b border-slate-200 py-16 lg:py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">What You Actually Receive</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">
                Inside a 24-48h Human Verification Report
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                No automated scraping dump. Every review is researched manually by an analyst who reads Chinese
                corporate registries, court records, IP databases, and domestic platforms — then translates the findings
                into clear buyer decisions.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                {REPORT_MODULES.map((mod) => (
                  <div key={mod.code} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <span className="text-[11px] font-black tracking-wider text-teal-700">SECTION {mod.code}</span>
                    <h3 className="mt-1 text-sm font-bold text-slate-950">{mod.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{mod.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Sample Deliverable Preview Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-950 text-white p-6 md:p-7 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400">Sample Deliverable Preview</p>
                  <h3 className="mt-1 text-lg font-bold text-white">Buyer Decision Review ($249)</h3>
                </div>
                <span className="rounded-full bg-teal-500/15 border border-teal-500/30 px-3 py-1 text-xs font-bold text-teal-300">
                  Delivered in 24-48h
                </span>
              </div>

              <div className="mt-5 space-y-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">1. Legal Identity &amp; Ownership</span>
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Verified Match</span>
                  </div>
                  <p className="mt-1.5 text-slate-400 leading-relaxed">
                    Active limited company founded 2014 · 10M RMB registered capital · Majority shareholder unchanged for 8+ years · Business scope includes manufacturing &amp; export.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">2. Risk &amp; Litigation Interpretation</span>
                    <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">1 Note Flagged</span>
                  </div>
                  <p className="mt-1.5 text-slate-400 leading-relaxed">
                    No dishonest debtor or enforcement records. One minor domestic delivery dispute settled in 2023. Insured headcount aligns with mid-size workshop claims.
                  </p>
                </div>

                <div className="rounded-xl border border-teal-500/30 bg-teal-950/35 p-4">
                  <div className="flex items-center gap-2 font-bold text-teal-300">
                    <ClipboardCheck className="h-4 w-4 shrink-0" />
                    <span>3. Buyer Action Verdict &amp; Pre-Payment Checklist</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-slate-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                      <span><strong>Verdict:</strong> Proceed to paid sample — verify wire beneficiary matches Chinese entity name.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                      <span><strong>Includes:</strong> Tailored RFQ questions + required business license &amp; bank letter checklist.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">Pure online desk research · Scope confirmed before payment</span>
                <Link
                  href="/pricing?service=DECISION_SINGLE#human-review"
                  className="inline-flex items-center text-xs font-bold text-teal-300 hover:text-teal-200"
                >
                  Request This Review <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Human Verification Packages (100% synced with /pricing) */}
      <section id="human-verification" className="bg-slate-50 py-16 lg:py-20 scroll-mt-20">
        <div className="container-page">
          <HumanVerificationPackages
            eyebrow="Human Verification Services"
            heading="Services and reference prices"
            subtitle="Prices below match our full pricing page. Tell us what you need, we confirm scope and final price by email, and you only pay via Stripe after confirming."
          />
        </div>
      </section>

      {/* 8. $149 vs $249 Comparison Table + 4-Step Scope-First Process (100% synced with /pricing) */}
      <section className="bg-white border-y border-slate-200 py-16 lg:py-20">
        <div className="container-page space-y-14">
          <HumanVerificationComparison />

          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Zero Upfront Guessing</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                How our scope-first payment process works
              </h2>
            </div>
            <HumanVerificationProcess />
          </div>
        </div>
      </section>

      {/* 9. Discord Community & Clear Free vs Paid Scope */}
      <section className="container-page py-16 lg:py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-10 shadow-sm grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Sourcing Community</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Ask your sourcing questions on Discord</h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Stuck on a database field, a supplier reply, or what to ask before paying a deposit? Ask in our Discord
              community for free. When you need hands-on research on a specific company, our human verification services
              take over.
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
      </section>

      {/* 10. Expanded FAQ + Bottom Dual CTA */}
      <section className="container-page pb-16 lg:pb-20">
        <FaqSection
          title="Frequently Asked Questions"
          items={[
            {
              question: "Is the China company database really free?",
              answer:
                "Yes. You can search, filter, and open all 20,000+ exhibitor profiles without signing up or paying. Creating a free account lets you save suppliers to your personal shortlist. Visitor CSV exports are not offered.",
            },
            {
              question: "Are companies in the database already verified factories?",
              answer:
                "No. The records are compiled from public exhibitor registry data and are not individually verified, and a listing does not prove a company is a direct factory. Always confirm identity before samples or payment, or request a human review.",
            },
            {
              question: "Do you publish contact names, phone numbers, or personal emails?",
              answer:
                "No. Contact persons, personal phone numbers, and private emails are never published or sold on this site.",
            },
            {
              question: "What if I only have an English company name or an Alibaba store link?",
              answer:
                "That is completely fine. Send us whatever you have — an English name, Alibaba / Made-in-China store URL, website, or invoice draft — and we will confirm whether we can trace the underlying Chinese legal entity before you pay.",
            },
            {
              question: "Do I pay upfront before you confirm what can be checked?",
              answer:
                "No. You submit your request first, we review what public records are available and confirm exact scope and price by email, and only then do we send a secure Stripe payment link.",
            },
            {
              question: "How should I choose between the $149 Identity Check and $249 Buyer Decision Review?",
              answer:
                "Choose the $149 Identity Check for basic registration verification and obvious-risk screening before first contact. Choose the $249 Buyer Decision Review when you are preparing for samples, negotiation, or a deposit and want ownership, litigation interpretation, operating scale, IP, social signals, and actionable buyer advice.",
            },
            {
              question: "How long does a human supplier verification take?",
              answer:
                "Most single-supplier and 3-supplier reviews are delivered within 24-48 hours after scope confirmation and payment.",
            },
            {
              question: "What can I ask in Discord, and what costs money?",
              answer:
                "General sourcing process questions, help reading database fields, and generic pre-contact checklists are free in Discord. Hands-on desk research on a specific supplier ($149 / $249) and 3-supplier decision comparisons ($499) are paid human services.",
            },
          ]}
        />
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-slate-950 to-teal-950 text-white py-16 border-t border-slate-800">
        <div className="container-page text-center flex flex-col items-center space-y-5">
          <h2 className="text-3xl font-bold tracking-tight">Ready to source smarter in China?</h2>
          <p className="max-w-xl text-slate-300 text-sm md:text-base leading-relaxed">
            Explore {supplierCount} exporter profiles for free, or send us a supplier you are evaluating for a 24-48h
            human verification before sending a deposit.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <ButtonLink href="/database" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-lg">
              Search Companies Free <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/pricing#human-review"
              variant="outline"
              className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white font-semibold"
            >
              Request Supplier Verification
            </ButtonLink>
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
