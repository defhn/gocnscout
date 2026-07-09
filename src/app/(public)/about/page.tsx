import { ShieldCheck, Database, Award, Users, BookOpen, CheckCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata, SITE } from "@/config/seo";

export const metadata = createMetadata({
  title: "About gocnscout and China Supplier Data",
  description: "Learn how gocnscout structures public supplier data for compliant China manufacturer research, industry reports, and custom shortlists.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "About" }
      ]} />
      
      <section className="container-page pb-20 max-w-4xl">
        {/* Header Block */}
        <div className="py-6 mb-8 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Our Sourcing Vision</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            About gocnscout
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            gocnscout is an independent intelligence platform engineered to streamline manufacturer vetting and cluster mapping. We assist global procurement departments and sourcing agencies in mapping, filtering, and validating active Chinese exporters.
          </p>
        </div>

        {/* Vision Section */}
        <section className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">Our Mission &amp; Sourcing Philosophy</h2>
          <p>
            In the rapidly evolving landscape of international trade, identifying reliable manufacturing partners is one of the most critical challenges faced by B2B buyers, global sourcing agents, and procurement professionals. Traditionally, buyers relied on massive offline directories, high-friction trade shows, or standard online portals flooded with thousands of middleman agencies posing as direct factories.
          </p>
          <p>
            gocnscout was founded with a single mission: to eliminate information asymmetry in跨境采购 (cross-border sourcing) by providing a clean, structured, and compliance-safe directory of verified exporters. Rather than acting as a transactional broker, we empower sourcing teams with structured digital tools, geographic cluster maps, and domain validation metrics to construct robust supplier pipelines.
          </p>
        </section>

        {/* Two-Column Focus */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch mt-10">
          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Database className="h-5 w-5 text-teal-600" />
              What We Build &amp; Index
            </h2>
            <div className="space-y-4 mt-6 text-xs text-slate-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-900">Compliance Directories</h3>
                <p className="mt-0.5">We normalize raw company registries into structured, query-ready fields. This allows buyers to filter by registration capital, trade modes, region, and target product keywords.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Regional Cluster Heatmaps</h3>
                <p className="mt-0.5">By aggregating coordinates at the city level, we map China&apos;s famous industrial manufacturing hubs, helping sourcing teams discover geographic cluster savings.</p>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl p-6 md:p-8">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              Data Protection Boundaries
            </h2>
            <div className="space-y-4 mt-6 text-xs text-slate-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-900">Compliance First (GDPR / CCPA)</h3>
                <p className="mt-0.5">We prune individual contact coordinates, personal email indexes, and mobile numbers from public views, preventing spam harvesting and aligning with global privacy rules.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Verified Corporate Data</h3>
                <p className="mt-0.5">Every exporter profile is mapped back to registered capital figures, official standalone corporate websites, and actual exhibition history tracking.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sourcing Vetting Pipeline Details */}
        <section className="mt-12 space-y-6 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">Our Four-Step Data Verification Pipeline</h2>
          <p>
            To maintain high-quality listings in the gocnscout directory, we run all imported records through a strict ingestion and cleaning pipeline. We do not accept self-submitted supplier profiles without verifying their official corporate indicators:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="font-bold text-slate-950 text-xs flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-teal-600" /> 1. Data Normalization
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Raw company names and location records are parsed. Variations in provincial naming schemes are unified (e.g., standardizing autonomous regions) to enable accurate geographic routing.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="font-bold text-slate-950 text-xs flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-teal-600" /> 2. Sector &amp; Category Mapping
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Product categories are grouped into 54 standardized industries, merging orthographic variants to ensure database clean queries.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="font-bold text-slate-950 text-xs flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-teal-600" /> 3. Domain Activity Checks
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Exporter website URLs are checked for availability, DNS resolutions, and active hosting state, helping filter out inactive corporate shells.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h3 className="font-bold text-slate-950 text-xs flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-teal-600" /> 4. Exhibition Stand History
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Stand histories are aggregated. Importers can verify how many consecutive sessions a supplier has maintained active registration.
              </p>
            </div>
          </div>
        </section>

        {/* E-E-A-T Core Product Values */}
        <section className="mt-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Core Product Values</h2>
            <p className="text-xs text-slate-500 mt-1">The values that guide our database engineering processes.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-slate-200 bg-white hover:shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-950">High-Integrity Data</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  We check corporate registries and registered capital brackets, helping filter shell suppliers before database publication.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white hover:shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-950">Support Buyers First</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  We design tools to assist buyers in constructing qualified candidate shortlists, saving weeks of manual web filtering.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white hover:shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-950">Promote Active Vetting</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  gocnscout provides the discovery index. We encourage purchasing teams to execute third-party factory audits.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust Statement */}
        <section className="mt-12 bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-xs text-slate-500 leading-relaxed">
          <h3 className="font-bold text-slate-900 text-sm mb-2">Transparency &amp; Independence</h3>
          <p className="mb-2">
            gocnscout is an independent digital intelligence provider. We are not affiliated with, sponsored by, or endorsed by official state-run trade fairs, municipal government offices, or any of the suppliers listed in our directories. All database records are curated from public registries and historical trade directories to assist in preliminary feasibility research.
          </p>
          <p>
            Our revenue is derived solely from premium digital subscriptions and customized B2B research reports. We do not receive commissions, transaction fees, or sponsorship funds from listed exporters, ensuring our data filtration rules remain completely objective.
          </p>
        </section>

        {/* FAQs */}
        <section className="mt-16">
          <FaqSection
            title="About FAQ"
            items={[
              {
                question: "What is gocnscout's primary function?",
                answer: "We organize public trade exhibitor listings into query-friendly B2B profiles, enabling buyers to filter candidates by sector, registered capital, region, and web activity.",
              },
              {
                question: "Is gocnscout a B2B marketplace or trading company?",
                answer: "No. gocnscout is a software-as-a-service database catalog. We do not participate in negotiations, logistics, or cargo inspection.",
              },
              {
                question: "How regularly is the database updated?",
                answer: "We perform automated domain validation and capital checks on a quarterly cycle, refreshing directories as new registration lists are published.",
              },
              {
                question: "How can I contact gocnscout for billing support?",
                answer: "Sourcing managers can submit support requests on our Contact form or reach out directly to: " + SITE.supportEmail,
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
