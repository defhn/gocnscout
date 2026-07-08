import { Check, FileText, Settings, Calendar, Database } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { STRIPE_CATALOG } from "@/config/pricing";
import { createMetadata } from "@/config/seo";
import { formatUsd } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Annual Data License | Bulk Supplier Records | gocnscout",
  description: "Request an annual license for the raw non-sensitive China export manufacturer dataset. Custom integrations and quarterly refreshes.",
  path: "/data-license",
});

export default function DataLicensePage() {
  return (
    <>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Data License" }
      ]} />
      
      <section className="container-page pb-20 max-w-4xl mx-auto">
        {/* Header section */}
        <div className="py-6 mb-8 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Enterprise Dataset Integration</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Annual Sourcing Data License
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Integrate our raw, verified supplier exhibition records directly into your corporate ERP, sourcing applications, or market analysis pipelines. Custom scopes and licensing agreements.
          </p>
        </div>

        {/* Pricing & Form layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
          {/* Included Features Card */}
          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-50/60 p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">Annual Rate</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {formatUsd(STRIPE_CATALOG.dataLicenseAnnualUsdCents)}<span className="text-sm font-semibold text-slate-500">/year</span>
                </h2>
              </div>
              <div className="text-xs text-slate-400 font-mono">licensing_specs.json</div>
            </div>

            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-950 mb-3 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-teal-500 mr-2" />
                    Included in Sourcing License
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {[
                      "Annual raw supplier dataset",
                      "Quarterly catalog updates",
                      "Secure CSV/JSON delivery",
                      "Internal enterprise use rights",
                      "Dedicated onboarding support",
                      "Priority support desk access"
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2 rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                        <Check className="h-4 w-4 text-teal-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <h3 className="text-xs font-bold text-slate-950 mb-2 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                    Excluded Sourcing Elements
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Contact names, representative cell numbers, private emails, domestic addresses, postal codes, public reselling rights, and real-time query API integrations are excluded to align with digital safety regulations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Consultation Form Card */}
          <Card className="border border-slate-200 bg-slate-950 text-white shadow-xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="p-6 border-b border-slate-800 bg-slate-900/40">
              <CardTitle className="text-base font-bold">Request Sourcing Consult</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Our database engineers will reach out to outline integration terms.</p>
            </CardHeader>
            <CardContent className="p-6">
              <form action="/api/inquiries" method="post" className="grid gap-4 text-slate-900">
                <input type="hidden" name="type" value="DATA_LICENSE" />
                <input type="hidden" name="redirectTo" value="/data-license" />
                
                <Input name="name" placeholder="Your Full Name" required className="bg-slate-900/50 border-slate-800 text-white placeholder-slate-500 focus:border-teal-500 focus:bg-slate-900 h-10 rounded-xl text-xs" />
                <Input name="email" type="email" placeholder="Corporate Sourcing Email" required className="bg-slate-900/50 border-slate-800 text-white placeholder-slate-500 focus:border-teal-500 focus:bg-slate-900 h-10 rounded-xl text-xs" />
                <Input name="companyName" placeholder="Company Name / Sourcing Agency" className="bg-slate-900/50 border-slate-800 text-white placeholder-slate-500 focus:border-teal-500 focus:bg-slate-900 h-10 rounded-xl text-xs" />
                <Textarea name="message" placeholder="Please outline your specific dataset parameters and planned internal integration use case..." required className="bg-slate-900/50 border-slate-800 text-white placeholder-slate-500 focus:border-teal-500 focus:bg-slate-900 rounded-xl min-h-[120px] text-xs" />
                
                <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md">
                  Submit Request Details
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights Grid */}
        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <Card className="border border-slate-200 bg-white hover:shadow-sm rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Who This Is Designed For</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Importers, market intelligence agencies, and global procurement departments requiring large-scale supplier records offline to run local analysis patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white hover:shadow-sm rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Settings className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Vetting Process</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                1. Submit your sourcing parameters.<br />
                2. Sourcing engineers verify scope and clean datasets.<br />
                3. We configure secure delivery paths and update frequency intervals.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white hover:shadow-sm rounded-2xl p-6">
            <CardContent className="p-0">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950">Standard Formats</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                We deliver databases in secure CSV or JSON schema structures, updating files following spring and autumn sessions to prune inactive URLs.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Dataset Schema Specification (EEAT Detail) */}
        <section className="mt-12 space-y-6 text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
            <Database className="h-5 w-5 text-teal-600" />
            Standard Sourcing Dataset Schema &amp; Fields
          </h2>
          <p>
            The licensed bulk exporter database contains structured records formatted for programmatic ingestion. Sourcing professionals can inspect the typical dataset schema columns listed below:
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Column Field Name</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Data Type</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">Attribute Definition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-600">
                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">exhibitor_name</td>
                  <td className="px-4 py-2.5">String</td>
                  <td className="px-4 py-2.5">Official registered business name of the export entity.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">industry_name_en</td>
                  <td className="px-4 py-2.5">String</td>
                  <td className="px-4 py-2.5">Standardized English category name mapped across 54 sectors.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">province / city</td>
                  <td className="px-4 py-2.5">String</td>
                  <td className="px-4 py-2.5">Normalised administrative region locating the manufacturing cluster.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">registered_capital</td>
                  <td className="px-4 py-2.5">Decimal</td>
                  <td className="px-4 py-2.5">Stated registered capital in local currency (RMB) to evaluate scale.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">website_url</td>
                  <td className="px-4 py-2.5">String</td>
                  <td className="px-4 py-2.5">Verified digital homepage of the exporter. Checked for DNS status.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">session_count</td>
                  <td className="px-4 py-2.5">Integer</td>
                  <td className="px-4 py-2.5">Number of consecutive exhibition registrations to measure stability.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Security & Regulatory Safeguards */}
        <section className="mt-12 bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-xs text-slate-500 leading-relaxed">
          <h3 className="font-bold text-slate-900 text-sm mb-2">Security, Regulatory, &amp; Usage Boundaries</h3>
          <p className="mb-2">
            All database licensing agreements strictly prohibit the use of bulk data for mass cold spamming, personal harassment, or public reverse engineering. Importers purchase and license raw datasets solely for internal profiling, custom query construction, market share modeling, and vendor pre-qualification research.
          </p>
          <p>
            In alignment with the Personal Information Protection Law (PIPL) and international data frameworks (GDPR), direct personal communication channels, mobile numbers, and personal identifiers have been completely scrubbed from all licensed packages. For secure direct verification workflows, sourcing teams are instructed to utilize official public domain sites or initiate direct request protocols.
          </p>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <FaqSection
            title="Data License FAQ"
            items={[
              {
                question: "Why does dataset licensing require a consultation?",
                answer: "Different enterprise clients require unique columns, location filters, update cadences, and integration configurations. We outline terms to secure legal compliance before any transaction is authorized.",
              },
              {
                question: "Are API integrations included under this license?",
                answer: "The current annual package delivers offline database dumps (CSV/JSON). Live REST API access keys require separate enterprise consultation agreements.",
              },
              {
                question: "Can I resell or republish this supplier dataset?",
                answer: "No. Sourcing licenses are granted strictly for internal commercial research. Redistribution, public hosting, or reselling records violates agreement terms and cancels licensing.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
