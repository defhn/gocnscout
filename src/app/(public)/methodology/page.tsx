import { FileText, Cpu, Search, Filter, ShieldCheck, Database, Server, RefreshCw } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";

export const metadata = createMetadata({
  title: "Methodology | Sourcing Intelligence & Vetting Algorithms | gocnscout",
  description: "Learn how gocnscout normalizes manufacturer exhibition files, applies compliance filters, and aggregates market stats.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Methodology" }
      ]} />
      
      <section className="container-page pb-20 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="py-6 mb-8 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Sourcing Data Governance</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Data Methodology &amp; Compliance
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            This guide outlines how gocnscout normalizes raw trade exhibition catalogs, structures exporter parameters, and filters personal details to align with international digital safety frameworks.
          </p>
        </div>

        {/* Introduction to Methodology */}
        <section className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">Our Data Ingestion Architecture</h2>
          <p>
            Operating a high-utility B2B sourcing directory requires rigorous data governance. The information indexed on gocnscout undergoes a comprehensive multi-stage ingestion, cleansing, normalization, and validation pipeline. This methodology page details the exact data operations our engineering team performs to convert raw trade catalogs into a clean, searchable database of verified Chinese exporters.
          </p>
          <p>
            By documenting our data practices, we provide transparency to global procurement departments, ensuring they understand the capabilities, boundaries, and compliance parameters of the intelligence they leverage for supplier discovery.
          </p>
        </section>

        {/* Two Column details: Data Ingestion Steps */}
        <section className="grid gap-6 md:grid-cols-2 items-stretch mt-10">
          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-slate-950">Data Normalization Pipeline</h2>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                  Ortho-Typographical Correction
                </h3>
                <p className="mt-1 text-slate-500 leading-relaxed">
                  We resolve spelling duplicates, standardize corporate naming schemes, and unify translation gaps between English-facing B2B portfolios and local registry records.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                  Geographical Alignment
                </h3>
                <p className="mt-1 text-slate-500 leading-relaxed">
                  Provinces and cities are structured into standardized regional keys. Obsolete administrative names are corrected to match official geographical directories.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-slate-950">Compliance Filtration</h2>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                  Regulatory Redaction
                </h3>
                <p className="mt-1 text-slate-500 leading-relaxed">
                  Names of sales representatives, mobile numbers, and personal emails are completely pruned. Sourcing teams access official corporate web presence to secure compliance.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                  Zero Subjective Rankings
                </h3>
                <p className="mt-1 text-slate-500 leading-relaxed">
                  gocnscout indexes raw database facts (capital, history, website). We do not invent arbitrary reviews or charge suppliers for &quot;top ranked&quot; spots.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* In-Depth: The Ingestion Process */}
        <section className="mt-12 space-y-6 text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
            <Server className="h-5 w-5 text-teal-600" />
            Detailed Data Lifecycle
          </h2>
          <p>
            Our data operations team manages a rigorous three-step ingestion pipeline designed to ensure directory hygiene:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-950 text-sm">1. Sourcing and Ingestion</h3>
              <p className="mt-1 text-xs text-slate-500">
                Raw company files, historical trade listings, and public exhibition directory catalogs are ingested. Our system filters out non-manufacturing entities (such as domestic retailers or non-export agencies) to preserve database relevance.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-950 text-sm">2. Classification and Tagging</h3>
              <p className="mt-1 text-xs text-slate-500">
                A custom classification model parses company descriptions, categorizing records into 54 standardized industries and extracting primary product keywords. This allows B2B buyers to execute targeted searches without sifting through unrelated listings.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-950 text-sm">3. Verification and Enrichment</h3>
              <p className="mt-1 text-xs text-slate-500">
                Corporate domains are verified programmatically. If a supplier website is offline, fails DNS resolution, or redirects to expired hosting pages, the domain status is marked as unverified. Capital metrics are mapped against local public registries.
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic Search Mechanics Bento */}
        <section className="mt-12 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Directory Search Engine Mechanics</h2>
            <p className="text-xs text-slate-500 mt-1">Under the hood of the gocnscout search dashboard.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-slate-200 bg-white hover:shadow-sm">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Full-Text Sourcing Queries</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Enables matching against company names, category terms, and product description fields. Sourcing agents locate specific export factories with granular keyword indexing.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white hover:shadow-sm">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Filter className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Multifaceted Query Filters</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Sourcing teams filter listings using multi-variable parameters, narrowing results to specific provinces, capital sizes, and trade models (OEM/ODM).
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Database Integrity & Accuracy SLA */}
        <section className="mt-12 bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-xs text-slate-500 leading-relaxed">
          <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1">
            <RefreshCw className="h-4 w-4 text-teal-600" />
            Database Refresh SLA &amp; Sourcing Disclaimer
          </h3>
          <p className="mb-2">
            The supplier records displayed reflect registrations from major historical trade exhibitions. While gocnscout performs periodic digital domain updates and corporate capital cross-checks, corporate operations can change dynamically. Listings represent historical activity and do not constitute an endorsement, compliance certification, or operating status guarantee by gocnscout.
          </p>
          <p>
            Importers and sourcing departments are solely responsible for executing secondary validation, requesting physical samples, and arranging professional factory audits before entering binding trade agreements.
          </p>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <FaqSection
            title="Methodology FAQ"
            items={[
              {
                question: "How does the database classify geographic manufacturing clusters?",
                answer: "We map municipal records directly to local industrial zones (e.g., standardizing electronics to Shenzhen, hardware to Jinhua, and furniture to Foshan), allowing sourcing teams to target high-efficiency regional clusters.",
              },
              {
                question: "Why are some supplier domains marked as unverified?",
                answer: "We run periodic DNS ping checks. If a corporate homepage is offline, returns standard hosting errors, or lacks DNS settings, it is flagged as unverified to help buyers filter active suppliers.",
              },
              {
                question: "What is the update frequency of the dataset?",
                answer: "The directory database undergoes a validation refresh twice annually, aligning with seasonal trade catalogs and updating registration stand metrics.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
