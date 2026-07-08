import { Check, XCircle, ShieldAlert, ArrowRight, ShieldCheck, Database, FileText, Download } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { EXPORT_SUPPLIER_FIELDS, PRIVATE_SUPPLIER_FIELDS } from "@/config/field-policy";
import { createMetadata } from "@/config/seo";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createMetadata({
  title: "Data Policy & Compliance Safety Standards | gocnscout",
  description: "Examine gocnscout's compliance-focused data policies. Learn which supplier fields are public, exportable, and excluded.",
  path: "/data-policy",
});

export default function DataPolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Data Policy" }]} />
      
      <section className="container-page pb-20">
        {/* Header Block */}
        <div className="max-w-4xl py-6 text-center mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Compliance Framework</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Supplier Data & Policy Governance
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            gocnscout structures global trade intelligence for search, regional cluster mapping, and capability analysis. 
            We maintain rigid safeguards protecting compliance bounds under data protection frameworks.
          </p>
        </div>

        {/* Side-by-Side Field Policy Breakdown */}
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {/* Public & Exportable */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6 border-b border-slate-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Exportable Public Fields</h2>
                  <p className="text-[10px] text-slate-400">Available in lists and CSV downloads</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                These non-sensitive, public registry variables represent manufacturer identity structures. They can be freely searched, compared, and exported:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {EXPORT_SUPPLIER_FIELDS.map((field) => (
                  <div key={field} className="flex items-center space-x-2 rounded-xl bg-slate-50 border border-slate-100 p-3 hover:bg-slate-100/50 transition-all duration-150">
                    <Check className="h-4 w-4 text-teal-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 tracking-tight">{field}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Excluded / Protected */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6 border-b border-slate-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Never Exported or Sold</h2>
                  <p className="text-[10px] text-slate-400">Redacted for compliance & safety</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                To guarantee zero regulatory violations under GDPR/CCPA and prevent unsolicited email spam, these parameters are actively filtered out from user-facing layers:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRIVATE_SUPPLIER_FIELDS.map((field) => (
                  <div key={field} className="flex items-center space-x-2 rounded-xl bg-red-50/30 border border-red-100/50 p-3 hover:bg-red-50/50 transition-all duration-150">
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="text-xs font-semibold text-red-800 tracking-tight">{field}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Grid: Data Application Workflow */}
        <section className="mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Data Integration Across Platform</h2>
            <p className="text-xs text-slate-500 mt-1">How public and cleaned fields operate in real user workflows.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Search Engine Listings</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Search results display normalized profile variables like supplier names, cluster regions, website existence, and years of fair exhibits, omitting personal identifiers.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">CSV Dataset Downloads</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  CSV downloads adhere rigidly to the authorized Exportable Fields schema. All automated downloads are bound to your active plan export allowances.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">PDF Analytics Reports</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  PDF documents provide macro category density, export mapping percentages, and location trends. Individual records are anonymized to protect vendor integrity.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dynamic FAQ */}
        <section className="mt-16">
          <FaqSection
            title="Data Privacy & Policy FAQ"
            items={[
              {
                question: "Why does gocnscout exclude direct phone numbers and representative emails?",
                answer: "We focus strictly on procurement mapping and cluster discovery. Contact person email harvesting lists violate international privacy regulations (GDPR/CCPA) and lead to compliance risks for importing firms.",
              },
              {
                question: "Are private details stored anywhere in the gocnscout system?",
                answer: "Minimal private parameters may reside in restricted databases for data cleaning and duplicate detection. These parameters are strictly blocked from all public facing files, user tables, and CSV exports.",
              },
              {
                question: "Does the platform process awards or buyer reviews?",
                answer: "No. Our database structures are limited strictly to official registry fields and catalog categories to maintain data consistency and objective auditing standards.",
              },
              {
                question: "Can listed manufacturing businesses modify or remove their records?",
                answer: "Yes. Listed entities can submit a data removal request directly via our contact form. Compliance requests are reviewed within 48 business hours.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
