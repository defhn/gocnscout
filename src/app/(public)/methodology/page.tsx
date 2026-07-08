import { FileText, Cpu, Search, Filter, ShieldCheck, Database } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";

export const metadata = createMetadata({
  title: "Methodology | Sourcing Intelligence & Vetting Algorithms",
  description: "Learn how gocnscout normalizes manufacturer exhibition files, applies compliance filters, and aggregates market stats.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Methodology" }]} />
      
      <section className="container-page pb-20">
        {/* Header Section */}
        <div className="max-w-4xl py-6 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Sourcing Data Governance</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Data Methodology & Compliance
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            This guide outlines how gocnscout normalizes raw exhibitor catalogs, structures industry parameters, and filters personal details to align with international safety criteria.
          </p>
        </div>

        {/* Two Column details: Data ingestion */}
        <section className="grid gap-8 lg:grid-cols-2 items-stretch">
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Cpu className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-950">Data Normalization Pipeline</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                    Clean Mapping Processes
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    We parse raw exhibitors using advanced mapping algorithms to standardize spelling variants, group categories, and index production regions into clear, discoverable lists.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                    Field Extraction & Structuring
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Industry directories, registered capital brackets, locations, product descriptions, founded years, and exhibition stand histories are systematically parsed for quick filtering.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-950">Regulatory Scopes & Filters</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                    Data Pruning Principles
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    We deliberately redact names of sales representatives, phone numbers, domestic postcodes, and fax catalogs. This prevents marketing spam lists and protects global buyers.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mr-2" />
                    Zero Invented Rankings
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    We display verified exhibitor logs. We do not invent supplier rankings, fake transactions, or performance scores, guaranteeing objective trade metrics.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Dynamic Search Capacity Bento */}
        <section className="mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Search Engine Mechanics</h2>
            <p className="text-xs text-slate-500 mt-1">Under the hood of the gocnscout search dashboard.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Full-Text Sourcing Queries</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Allows direct matching against registered supplier business names, industrial classifications, product description keywords, and cluster cities, ensuring high precision.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Filter className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Multifaceted Query Filters</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Filters records based on multi-variable inputs, allowing buyers to narrow down lists by registered capital scales, exporter types, and active stand histories.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <FaqSection
            title="Methodology FAQ"
            items={[
              {
                question: "How does the database verify China's manufacturing clusters?",
                answer: "We categorize records dynamically based on manufacturing hubs: matching hardware to Yongkang, toys to Shantou, and electronics to Shenzhen. This gives buyers reliable geographical insights.",
              },
              {
                question: "Why does the platform scrub contact emails?",
                answer: "To ensure safety under international data frameworks like GDPR and CCPA. We build business research resources, not list brokers for spam outreach.",
              },
              {
                question: "How are the PDF intelligence reports compiled?",
                answer: "Reports analyze total statistics from current exhibition datasets. Content outlines are confirmed by our sourcing advisors prior to publishing pdf files.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
