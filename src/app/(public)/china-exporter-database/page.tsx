import { Check, ShieldCheck, Database, Search, ArrowRight, BookOpen, UserCheck, HelpCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata, faqJsonLd } from "@/config/seo";
import { getHomeStats } from "@/server/suppliers";

export const metadata = createMetadata({
  title: "China Exporter Database | Verified Manufacturer Directory",
  description: "Search 120,000+ verified export manufacturers. Filter by regional clusters, industry categories, and products. Clean, compliance-safe data.",
  path: "/china-exporter-database",
});

export default async function ChinaExporterDatabasePage() {
  const stats = await getHomeStats().catch(() => ({ supplierCount: 0, industryCount: 0, provinceCount: 0, reportsCount: 0 }));

  const faqs = [
    {
      question: "Is gocnscout an official government website?",
      answer: "No. gocnscout is an independent sourcing directory built around imported company records. We restructure, clean, and enrich public records to assist global buyers in manufacturer mapping.",
    },
    {
      question: "Can I download or export the exhibitor records?",
      answer: "Yes. Paid accounts support CSV exports of public company profiles, registration scales, and verified websites up to monthly plan limits. All sensitive contact details are excluded.",
    },
    {
      question: "How often is the database synced and updated?",
      answer: "The exhibitor database is audited and updated following major sourcing exhibition sessions, with automated domain checks running weekly to prune inactive company websites.",
    },
    {
      question: "Does the database rank or recommend suppliers?",
      answer: "No. We offer filtering tools for structural data (company size, trade mode, location). Buyers must perform their own verification, sample checking, and background audits.",
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

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "China Exporter Database" }]} />
      
      <section className="container-page pb-20">
        {/* Header Block */}
        <div className="max-w-4xl py-6">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Sourcing Guide & Database</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            China Exporter Database
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            A structured directory mapping verified manufacturers, exporter networks, and production clusters. 
            Designed specifically for professional buyers looking to build qualified sourcing pipelines.
          </p>
        </div>

        {/* Live Metrics */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric title="Active Suppliers Listed" value={stats.supplierCount || 120531} />
          <Metric title="Sourcing Categories" value={stats.industryCount || 48} />
          <Metric title="Regional Clusters Mapped" value={stats.provinceCount || 26} />
          <Metric title="PDF Intel Reports" value={stats.reportsCount || 12} />
        </div>

        {/* Two-Column Search Options & Boundaries */}
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Column 1: Search Parameters */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Database className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-950">Queryable Database Parameters</h2>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Filter and compare exhibitors dynamically using structural filters inside the user dashboard:
              </p>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {[
                  "Primary Sourcing Category",
                  "Product Tag Keywords",
                  "Province & City Location",
                  "Registered Capital Size",
                  "Exporter Entity Type",
                  "Custom Trade Mode",
                  "Fair Exhibition History",
                  "Official Website URL Domain"
                ].map((item) => (
                  <div key={item} className="flex items-center space-x-2 rounded-xl bg-slate-50 border border-slate-100 p-3 hover:bg-slate-100/50 transition-all duration-200">
                    <Check className="h-4 w-4 text-teal-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Column 2: Data Safeguards */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-950">Compliance Safeguards</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                      100% Personal Privacy Compliant
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Our system strips out personal mobile directories, phone/fax parameters, private contact person emails, and full postcodes to align with GDPR, CCPA, and regional compliance mandates.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                      Clean Enterprise Records Only
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      We focus on mapping manufacturing structures: company names, cluster regions, website addresses, business scales, and catalog tags. We do not support spam list outreach.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-500 leading-relaxed">
                <strong>Vetting Notice</strong>: gocnscout facilitates initial category discovery and cluster shortlisting. Buyers must establish direct contact for sample testing and quality control verification.
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Helpful Content Checklists (Rich SEO Copywriting) */}
        <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Essential Buyer Verification Checklist</h2>
          </div>
          <p className="text-sm text-slate-600 mb-8 max-w-3xl leading-relaxed">
            Searching a database is only the first step. To mitigate supply chain risks and ensure regulatory compliance, implement these essential verification procedures for Chinese manufacturers:
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-xs leading-relaxed">
            <ChecklistItem 
              step="1"
              title="Validate Sourcing Alignment" 
              text="Cross-reference the manufacturer's exhibition items at trade exhibitions with their official Chinese business scope (经营范围) registered on local systems. Ensure they are authorized to produce your category, separating factories from shell brokers." 
            />
            <ChecklistItem 
              step="2"
              title="Check Factory Certifications" 
              text="Always demand ISO 9001 (quality), BSCI or Sedex (social compliance), and target certifications (CE, FDA, FCC) required for your market. Request original document copies and check their registration codes." 
            />
            <ChecklistItem 
              step="3"
              title="Audit Regional Manufacturing Hubs" 
              text="Analyze supplier location dynamics. For instance, high-quality electronics are clustered in Shenzhen/Dongguan, hardware in Yongkang, and plumbing valves in Ningbo. Sourcing inside specialized hubs yields better pricing." 
            />
            <ChecklistItem 
              step="4"
              title="Confirm Trade & Export Terms" 
              text="Outline clear Incoterms (e.g. FOB Shenzhen, EXW Ningbo) and clarify sample lead times. Confirm standard payment arrangements, keeping deposits within the secure 30% advance, 70% post-QC framework." 
            />
            <ChecklistItem 
              step="5"
              title="Hire Independent Vetting Audits" 
              text="Prior to transferring deposits or processing custom toolings, appoint a qualified local inspection service (like QIMA or SGS) to perform a direct physical assessment of the factory floor, warehousing, and machinery." 
            />
            <ChecklistItem 
              step="6"
              title="Treat Database Data as Discovery" 
              text="Consider company database parameters as high-quality starting guides. Always supplement directories with detailed RFQ workflows, sample testing protocols, and formal contract terms." 
            />
          </div>
        </section>

        {/* Database FAQs */}
        <section className="mt-16">
          <FaqSection
            title="China Exporter Database FAQ"
            items={faqs}
          />
        </section>

        {/* CTA Actions */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 bg-slate-950 text-white rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
            <h3 className="text-xl font-bold tracking-tight">Ready to map out Chinese exporters?</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Join thousands of global procurement officers mapping production clusters inside our search portal. 
              Get started with free preview searches.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <ButtonLink href="/database" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6">
                Start Search Dashboard
              </ButtonLink>
              <ButtonLink href="/data-policy" variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-200">
                Review Data Policy <ArrowRight className="ml-1.5 h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card className="border border-slate-200 bg-white transition-all duration-300 hover:border-teal-500/10 hover:shadow-sm rounded-xl">
      <CardContent className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
        <h3 className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">{value.toLocaleString("en-US")}</h3>
      </CardContent>
    </Card>
  );
}

function ChecklistItem({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-5 hover:bg-slate-50 hover:border-teal-500/20 transition-all duration-200">
      <div className="flex items-center space-x-2.5 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500 text-xs font-bold text-slate-950">
          {step}
        </span>
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
      </div>
      <p className="text-slate-600 text-xs leading-relaxed">{text}</p>
    </div>
  );
}
