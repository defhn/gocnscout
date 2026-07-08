import { Check, XCircle, ShieldCheck, Database, FileText, Download } from "lucide-react";
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
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Data Policy" }
      ]} />
      
      <section className="container-page pb-20 max-w-4xl mx-auto">
        {/* Header Block */}
        <div className="py-6 mb-8 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Compliance Framework</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Supplier Data &amp; Policy Governance
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            gocnscout structures global trade intelligence for search, regional cluster mapping, and capability analysis. We maintain rigid safeguards protecting compliance bounds under international data protection frameworks.
          </p>
        </div>

        {/* Global Compliance Framework alignment */}
        <section className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">Our Global Regulatory Standards</h2>
          <p>
            When indexing, verifying, and publishing B2B trade supplier listings, gocnscout operates under a strict compliance first architecture. We actively align our data policies with major global privacy and security frameworks, including the <strong>General Data Protection Regulation (GDPR)</strong> of the EU, the <strong>California Consumer Privacy Act (CCPA)</strong>, and the <strong>Personal Information Protection Law (PIPL)</strong> of the People&apos;s Republic of China.
          </p>
          <p>
            Our core priority is to facilitate legitimate commercial supplier discovery and industrial research without violating individual data boundaries or enabling abusive marketing workflows.
          </p>
        </section>

        {/* Side-by-Side Field Policy Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch mt-10">
          {/* Public & Exportable */}
          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6 border-b border-slate-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950">Exportable Public Fields</h2>
                  <p className="text-[10px] text-slate-400">Available in lists and CSV downloads</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                These non-sensitive, public registry variables represent manufacturer identity structures. They can be searched, compared, and exported:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {EXPORT_SUPPLIER_FIELDS.map((field) => (
                  <div key={field} className="flex items-center space-x-2 rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                    <Check className="h-4 w-4 text-teal-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 tracking-tight">{field}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Excluded / Protected */}
          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6 border-b border-slate-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950">Never Exported or Sold</h2>
                  <p className="text-[10px] text-slate-400">Redacted for compliance &amp; safety</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                To guarantee zero regulatory violations under GDPR/CCPA and prevent unsolicited email spam, these parameters are actively filtered out from user-facing layers:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRIVATE_SUPPLIER_FIELDS.map((field) => (
                  <div key={field} className="flex items-center space-x-2 rounded-xl bg-red-50/30 border border-red-100/50 p-2.5">
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="text-xs font-semibold text-red-800 tracking-tight">{field}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Redaction and Opt-Out Policy (EEAT Expansion) */}
        <section className="mt-12 space-y-6 text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            Supplier Opt-Out &amp; Redaction Protocol
          </h2>
          <p>
            gocnscout respects the right of listed entities to manage their business intelligence directory footprints. If you represent an exporter cataloged in our database and wish to request profile updates, record correction, or complete data redaction, please review our standardized protocol:
          </p>
          <ul className="space-y-3 text-xs text-slate-600 pl-4 list-disc">
            <li>
              <strong>Verification Requirement:</strong> To prevent unauthorized listings removal, all redaction requests must originate from an official corporate email address associated with the target supplier&apos;s verified domain (e.g., info@company.com), or be accompanied by a copy of the company&apos;s official business registry license.
            </li>
            <li>
              <strong>Review Timeline:</strong> Requests submitted via our contact page under the &quot;Directory Correction/Removal&quot; department are routed directly to our compliance officers. We review and process valid verification requests within 48 business hours.
            </li>
            <li>
              <strong>No-Fee Redaction:</strong> gocnscout does not charge suppliers, manufacturers, or trade entities fees to modify, correct, or redact their information.
            </li>
          </ul>
        </section>

        {/* Bento Grid: Data Application Workflow */}
        <section className="mt-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Data Integration Across Platform</h2>
            <p className="text-xs text-slate-500 mt-1">How public and cleaned fields operate in real user workflows.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-slate-200 bg-white hover:shadow-sm">
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-950">Search Engine Listings</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  Search results display normalized profile variables like supplier names, cluster regions, website existence, and years of fair exhibits, omitting personal identifiers.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white hover:shadow-sm">
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-950">CSV Dataset Downloads</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  CSV downloads adhere rigidly to the authorized Exportable Fields schema. All automated downloads are bound to your active plan export allowances.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white hover:shadow-sm">
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-950">PDF Analytics Reports</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  PDF documents provide macro category density, export mapping percentages, and location trends. Individual records are anonymized to protect vendor integrity.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <FaqSection
            title="Data Privacy &amp; Policy FAQ"
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
