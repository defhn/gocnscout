import { ShieldCheck, Database, Award, Users, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata, SITE } from "@/config/seo";

export const metadata = createMetadata({
  title: "About Us | Sourcing Database Pioneers",
  description: "Discover our mission at gocnscout. We provide compliance-safe, high-integrity manufacturer mapping tools for international buyers.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      
      <section className="container-page pb-20">
        {/* Header Block */}
        <div className="max-w-4xl py-6 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Our Sourcing Vision</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            About gocnscout
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            gocnscout is an independent intelligence platform engineered to streamline manufacturer vetting and cluster mapping. We assist global procurement departments in sourcing securely from verified Canton Fair exhibitors.
          </p>
        </div>

        {/* Two-Column Focus */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 flex items-center">
                <Database className="h-5 w-5 text-teal-600 mr-2" />
                What We Build
              </h2>
              <div className="space-y-4 mt-6 text-xs text-slate-600 leading-relaxed">
                <div>
                  <h3 className="font-bold text-slate-900">Compliance Directories</h3>
                  <p className="mt-0.5">We normalize raw company registries into structured fields, making categories, locations, and scales searchable offline or online.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Macro Intelligence Reports</h3>
                  <p className="mt-0.5">We analyze regional clusters and distribution metrics, delivering presentation-ready PDFs to help teams plan sourcing campaigns.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950 flex items-center">
                <ShieldCheck className="h-5 w-5 text-teal-600 mr-2" />
                Data Protection Boundaries
              </h2>
              <div className="space-y-4 mt-6 text-xs text-slate-600 leading-relaxed">
                <div>
                  <h3 className="font-bold text-slate-900">GDPR & CCPA Compliant</h3>
                  <p className="mt-0.5">To prevent spam lists, we omit private mobile numbers, direct emails, names of sales representatives, and domestic postal codes.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Verified Raw Listings</h3>
                  <p className="mt-0.5">All details align with registered business licenses, stand history metrics, and public company domains.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Product Values Grid */}
        <section className="mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Core Product Values</h2>
            <p className="text-xs text-slate-500 mt-1">The values that guide our database engineering processes.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">High-Integrity Data</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  We verify websites, statuses, and capitals against local Chinese corporate systems, eliminating shell entities before database publication.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Support Buyers First</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  We assist importers and agencies in building qualified vendor shortlists, optimizing category and cluster discovery workflows.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white transition-all duration-300 hover:shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950">Promote Vetting Checks</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  gocnscout provides the discovery records. We encourage sourcing teams to order gold samples and execute direct third-party factory audits.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <FaqSection
            title="About FAQ"
            items={[
              {
                question: "What is gocnscout's main capability?",
                answer: "We structure public Canton Fair exhibitor records to make categories, locations, capitals, and domains filterable for B2B buyers.",
              },
              {
                question: "Is gocnscout a middleman or trading firm?",
                answer: "No. gocnscout is a digital intelligence directory. We charge subscription fees for search and export access and do not charge commissions on transactions.",
              },
              {
                question: "How can I request support or billing reviews?",
                answer: "You can submit inquiries directly via our contact form or contact our billing desk at: " + SITE.supportEmail,
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
