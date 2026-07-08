import Link from "next/link";
import { ArrowRight, Database, FileText, ListChecks, Search, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqSection } from "@/components/marketing/faq-section";
import { createMetadata, organizationJsonLd, websiteSearchJsonLd } from "@/config/seo";
import { getHomeStats, listCityPages, listIndustryPages } from "@/server/suppliers";

export const metadata = createMetadata({
  title: "China Supplier Database | Search & Verify Export Manufacturers",
  description:
    "Unlock 20,000+ verified export exhibitors. Search by industry, product keywords, and location. Built for compliant B2B sourcing research.",
});

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
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
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

          {/* Card 2: PDF Reports */}
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
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

          {/* Card 3: Custom Shortlist */}
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
              <ListChecks className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950">Custom Supplier Shortlists</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Need niche criteria? Submit specifications to receive custom shortlists with curated manufacturer profiles matching your criteria.
            </p>
            <Link href="/custom-shortlist" className="inline-flex items-center text-xs font-bold text-purple-600 mt-4 group-hover:text-purple-700">
              Request shortlist <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Link>
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
            <WorkflowStep num="01" title="Select Category" text="Filter suppliers by industry classifications or raw product description keywords." />
            <WorkflowStep num="02" title="Apply Scale Filters" text="Narrow candidates down using company registration sizes, trade modes, and locations." />
            <WorkflowStep num="03" title="Inspect Public Profiles" text="Review exhibition history, export focus areas, and verified website links." />
            <WorkflowStep num="04" title="Perform Direct Vetting" text="Conduct standard verification audits before placing sample orders or agreements." />
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
          <DirectoryBlock title="Browse by Industry Category" href="/industries" items={industries.map((item) => ({ label: item.industryName, count: item.supplierCount, href: `/industries/${item.slug}` }))} />
          <DirectoryBlock title="Browse by Sourcing City" href="/cities" items={cities.map((item) => ({ label: [item.city, item.province].filter(Boolean).join(", "), count: item.supplierCount, href: `/cities/${item.slug}` }))} />
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

function WorkflowStep({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm">
      <CardContent className="p-6 relative overflow-hidden">
        <span className="absolute right-6 top-2 text-5xl font-extrabold text-slate-200/40 font-mono tracking-tighter select-none">{num}</span>
        <h3 className="text-base font-bold text-slate-950 relative z-10">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 relative z-10">{text}</p>
      </CardContent>
    </Card>
  );
}

function DirectoryBlock({ title, href, items }: { title: string; href: string; items: Array<{ label: string; count: number; href: string }> }) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-teal-500/20">
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
