import { Check, HelpCircle, X, ShieldAlert, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_DEFINITIONS } from "@/config/plans";
import { STRIPE_CATALOG } from "@/config/pricing";
import { createMetadata, productJsonLd } from "@/config/seo";
import { formatUsd } from "@/lib/utils";
import { PricingGrid } from "@/components/pricing/pricing-grid";

export const metadata = createMetadata({
  title: "Pricing for Supplier Database, Reports and Shortlists",
  description: "Compare plans for China supplier research, CSV exports, industry PDF reports, custom shortlists, and annual data licensing.",
  path: "/pricing",
});

const plans = [PLAN_DEFINITIONS.FREE, PLAN_DEFINITIONS.STARTER, PLAN_DEFINITIONS.PRO, PLAN_DEFINITIONS.TEAM];

const comparisonRows = [
  ["Public SEO pages", "Yes", "Yes", "Yes", "Yes"],
  ["Search result pages", "2 pages", "Unlimited", "Unlimited", "Unlimited"],
  ["Results per page", "10", "25", "50", "100"],
  ["Supplier profile views", "5/month", "Unlimited", "Unlimited", "Unlimited"],
  ["Advanced filters", "Industry, province, city", "Yes", "Yes", "Yes"],
  ["Trade mode access", "No", "Yes", "Yes", "Yes"],
  ["Official website access", "No", "Yes", "Yes", "Yes"],
  ["Exhibition tier label", "No", "Yes", "Yes", "Yes"],
  ["Exhibition count", "No", "No", "Yes", "Yes"],
  ["Sourcing signals (awards)", "No", "No", "Yes", "Yes"],
  ["Saved lists", "No", "5", "Unlimited", "Unlimited"],
  ["Saved suppliers", "No", "200", "3,000", "Unlimited"],
  ["Supplier comparison", "No", "5 suppliers", "10 suppliers", "20 suppliers"],
  ["CSV export", "No", "Yes", "Yes", "Yes"],
  ["Export rows/month", "0", "200", "1,600", "8,000"],
  ["Included PDF reports", "0", "1/month", "3/month", "10/month"],
  ["Team seats", "1", "1", "1", "5"],
  ["Team notes", "No", "No", "No", "Yes"],
  ["Custom fields", "No", "No", "No", "Yes"],
  ["API", "No", "No", "No", "No"],
  ["Data license rights", "No", "No", "No", "No"],
  ["Private contacts (phone/email)", "Not included", "Not included", "Not included", "Not included"],
];

export default function PricingPage() {
  const pricingSchema = productJsonLd({
    name: "gocnscout Database Subscriptions",
    description: "Compare subscriptions, PDF reports, and data license options for verified China suppliers.",
    lowPrice: "29.00",
    highPrice: "199.00",
    offerCount: "3",
  });

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />
      
      <section className="container-page pb-20">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center py-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Simple, Transparent Sourcing Pricing
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            Choose database access, standalone intelligence PDF reports, or a custom manufacturer shortlist. 
            All subscriptions exclude sensitive personal contacts in compliance with privacy regulations.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <PricingGrid plans={plans} />

        {/* Feature Comparison Table */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Detailed Feature Comparison</h2>
            <p className="text-sm text-slate-600 mt-1">Every parameter you need to map out your sourcing research workflow.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[920px] w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="px-5 py-4">Feature Capacity</th>
                  <th className="px-5 py-4">Free</th>
                  <th className="px-5 py-4">Starter</th>
                  <th className="px-5 py-4">Pro</th>
                  <th className="px-5 py-4">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonRows.map((row) => (
                  <tr key={row[0]} className="hover:bg-slate-50/50 transition-colors">
                    {row.map((cell, index) => {
                      const isHeader = index === 0;
                      return (
                        <td 
                          key={`${row[0]}-${index}`} 
                          className={`px-5 py-3.5 ${isHeader ? "font-bold text-slate-900 bg-slate-50/30" : "text-slate-600"}`}
                        >
                          {isHeader ? (
                            cell
                          ) : cell === "Yes" ? (
                            <span className="inline-flex items-center text-teal-600 font-semibold">
                              <Check className="h-4 w-4 mr-1 text-teal-500" /> Yes
                            </span>
                          ) : cell === "No" ? (
                            <span className="inline-flex items-center text-slate-400 font-medium">
                              <X className="h-3.5 w-3.5 mr-1 text-slate-300" /> No
                            </span>
                          ) : cell === "Not included" ? (
                            <span className="inline-flex items-center text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide">
                              Compliance Safe
                            </span>
                          ) : (
                            cell
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feature Descriptions Grid */}
        <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950 mb-6 text-center">Which sourcing tier aligns with your targets?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <PlanFit title="Free" text="Excellent for inspecting the database structure, verifying specific categories, and reviewing SEO guidelines." />
            <PlanFit title="Starter" text="Tailored for individual buyers and niche importers conducting low-volume research and direct contacts." />
            <PlanFit title="Pro" text="Designed for professional sourcing consultants and agencies needing recurring datasets and multiple industry PDFs." />
            <PlanFit title="Team" text="Built for wholesale sourcing offices requiring multi-user logins, shared lists, internal remarks, and higher CSV export limits." />
          </div>
        </section>

        {/* Standalone Offerings Grid */}
        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {/* PDF Reports Card */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-950">Standalone PDF Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pricing structures</h4>
              <div className="mt-3.5 space-y-2 text-xs">
                <PriceLine label="Basic Category Analysis" cents={STRIPE_CATALOG.reports.BASIC.amountUsdCents} />
                <PriceLine label="Full Category Report" cents={STRIPE_CATALOG.reports.FULL.amountUsdCents} />
                <PriceLine label="Premium Industry Report" cents={STRIPE_CATALOG.reports.PREMIUM.amountUsdCents} />
                <PriceLine label="Exhibitor Sourcing Intelligence Special" cents={STRIPE_CATALOG.reports.CANTON_FAIR_INTELLIGENCE.amountUsdCents} />
              </div>
              <div className="mt-6 flex items-start space-x-2 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs leading-normal text-slate-500">
                <ShieldAlert className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <span>Reports map regional clusters and manufacturer distribution. They do not sell list files of private contacts.</span>
              </div>
            </CardContent>
          </Card>

          {/* Shortlist Card */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-950">Custom Supplier Shortlist</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-0">
              <div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {formatUsd(STRIPE_CATALOG.customShortlist.amountUsdCents)}
                  </span>
                  <span className="text-xs ml-1 font-semibold text-slate-500">/request</span>
                </div>
                <h4 className="mt-4 text-xs font-bold text-slate-900">Curated procurement vetting</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Receive up to 50 vetted manufacturer candidates hand-selected by our sourcing consultants matching your specific tech parameters and locations.
                </p>
              </div>
              <ButtonLink href="/custom-shortlist" className="mt-6 w-full text-xs font-bold" variant="outline">
                Request Sourcing Shortlist
              </ButtonLink>
            </CardContent>
          </Card>

          {/* Data License Card */}
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-950">Enterprise Data License</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-0">
              <div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {formatUsd(STRIPE_CATALOG.dataLicenseAnnualUsdCents)}
                  </span>
                  <span className="text-xs ml-1 font-semibold text-slate-500">/year</span>
                </div>
                <h4 className="mt-4 text-xs font-bold text-slate-900">Custom local integration</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Integrate our raw, non-sensitive manufacturer exhibition records into your local corporate ERP, sourcing applications, or supply chain tools.
                </p>
              </div>
              <ButtonLink href="/data-license" className="mt-6 w-full text-xs font-bold" variant="outline">
                Consult Data Experts
              </ButtonLink>
            </CardContent>
          </Card>
        </section>

        {/* Global Compliance Framework */}
        <section className="mt-16 rounded-2xl border border-slate-200 bg-teal-950 text-white p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-xl font-bold">Comprehensive Data Compliance Framework</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 text-xs">
            <div>
              <h3 className="font-bold text-teal-400">Exclusion of Private Sourcing Contacts</h3>
              <p className="mt-2 leading-relaxed text-slate-300">
                To guarantee zero regulatory issues for your importing entities, we block names of contact representatives, personal mobile numbers, emails, and full postcodes. We supply clean company registries.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-teal-400">Zero Procurement Guarantees</h3>
              <p className="mt-2 leading-relaxed text-slate-300">
                gocnscout serves as a high-fidelity intelligence platform. We catalog active exhibitors but do not underwrite transaction safety, supplier delivery liability, or material defects.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing FAQ Section */}
        <FaqSection
          title="Pricing FAQ"
          items={[
            {
              question: "Will I find personal cell numbers or direct emails on paid plans?",
              answer: "No. gocnscout strictly complies with GDPR, CCPA, and regional laws. Paid subscriptions unlock search capabilities, website directories, comparisons, and exports of public corporate data fields.",
            },
            {
              question: "Can I cancel my monthly subscription anytime?",
              answer: "Yes. You can manage and terminate your subscription directly via the billing console. Cancellation requests take effect at the end of the billing period.",
            },
            {
              question: "What is the difference between reports and the database?",
              answer: "Category reports offer aggregated structural reviews (densities, exporter hubs, product groupings). The database allows interactive multi-field search query filtering, sorting, list compilation, and CSV downloading.",
            },
            {
              question: "How is the enterprise annual data license delivered?",
              answer: "Licenses are processed through custom consults. We outline scope requirements, update frequencies, internal redistribution rules, and deliver secure custom CSV datasets.",
            },
          ]}
        />
      </section>
    </>
  );
}


function PriceLine({ label, cents }: { label: string; cents: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-slate-600 border-b border-slate-50 py-1 last:border-0">
      <span>{label}</span>
      <span className="font-bold text-slate-900">{formatUsd(cents)}</span>
    </div>
  );
}

function PlanFit({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}
