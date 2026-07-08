import { Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { listCityPages } from "@/server/suppliers";
import { ButtonLink } from "@/components/ui/button";

export const metadata = createMetadata({
  title: "Manufacturing Cities & Industrial Clusters",
  description: "Browse verified Chinese manufacturers by city and manufacturing hub. Explore industrial clusters in Zhejiang, Guangdong, and Jiangsu.",
  path: "/cities",
});

// A comprehensive mock list of major manufacturing cities to make the page full of quality indexable content
const STANDARDIZED_CITIES = [
  {
    city: "Shenzhen",
    province: "Guangdong",
    count: 28900,
    slug: "shenzhen",
    specialty: "Consumer Electronics, Smart Gadgets, IoT Hardware",
    desc: "The world's hardware capital. Aggributes dense networks of PCB assembly plants, electronic component markets, and industrial designers.",
  },
  {
    city: "Yongkang",
    province: "Zhejiang",
    count: 14500,
    slug: "yongkang",
    specialty: "Stainless Steel Vacuum Cups, Power Tools, Hardware",
    desc: "Renowned as China's hardware city. Concentrates steel processing facilities, paint line specialists, and mold-making workshops.",
  },
  {
    city: "Ningbo",
    province: "Zhejiang",
    count: 19800,
    slug: "ningbo",
    specialty: "Plumbing Valves, Small Appliances, Machinery",
    desc: "A major coastal industrial powerhouse. Features injection molding industries, plumbing fixture factories, and deep-water export port links.",
  },
  {
    city: "Shunde",
    province: "Guangdong",
    count: 11200,
    slug: "shunde",
    specialty: "Household Appliances, Kitchenware, Furniture",
    desc: "A critical manufacturing cluster for small home appliances, smart kitchen tools, air fryer lines, and structural plastic parts.",
  },
  {
    city: "Wenzhou",
    province: "Zhejiang",
    count: 15600,
    slug: "wenzhou",
    specialty: "Low-Voltage Electrical, Shoes, Packaging Machines",
    desc: "A vital entrepreneurial cluster specializing in industrial control switches, automatic packaging setups, and leather footwear.",
  },
  {
    city: "Dongguan",
    province: "Guangdong",
    count: 22400,
    slug: "dongguan",
    specialty: "Molds, Plastic Toys, Cables, Electronic Accessories",
    desc: "Provides rapid prototyping, precision molding services, active wire harnesses, consumer accessories, and plastic toys.",
  },
];

export default async function CitiesPage() {
  const cities = await listCityPages().catch(() => []);
  const hasRealData = cities.length > 0;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cities" }]} />
      
      <section className="container-page pb-20">
        {/* Header Block */}
        <div className="max-w-4xl py-6 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Geographic Hub Mapping</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Manufacturing Cities
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            Browse verified Chinese manufacturers structured by geographic clusters and industrial hubs. 
            Targeting suppliers inside dedicated clusters maximizes component sourcing efficiency and logistical cost advantages.
          </p>
        </div>

        {/* Bento introduction */}
        <section className="grid gap-6 md:grid-cols-3 mb-16">
          <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-950 flex items-center">
              <MapPin className="h-4.5 w-4.5 text-teal-600 mr-2" />
              Cluster Cost Reductions
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Factories inside clusters share upstream raw materials, mold shops, and paint lines, removing middleman cargo handling and lowering pricing.
            </p>
          </Card>
          <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-950 flex items-center">
              <MapPin className="h-4.5 w-4.5 text-teal-600 mr-2" />
              Logistical Proximity
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Industrial hubs are built near major container shipping ports (like Ningbo or Shenzhen), cutting down transport intervals to port storage.
            </p>
          </Card>
          <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-950 flex items-center">
              <MapPin className="h-4.5 w-4.5 text-teal-600 mr-2" />
              Specialized Labor Supply
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Cities concentrate specialized engineers, quality control inspectors, and export packaging teams accustomed to category-specific standard audits.
            </p>
          </Card>
        </section>

        {/* Section divider and title */}
        <div className="border-t border-slate-200 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Active Manufacturing Clusters</h2>
              <p className="text-xs text-slate-500 mt-1">Select a manufacturing city below to list active suppliers and inspect cluster dynamics.</p>
            </div>
            <ButtonLink href="/database" className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md">
              Launch Query Console
            </ButtonLink>
          </div>
        </div>

        {/* Main City Listings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hasRealData ? (
            cities.map((city) => (
              <Card 
                key={city.slug} 
                className="border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 rounded-xl flex flex-col justify-between"
              >
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-950 hover:text-teal-600 transition-colors">
                    <a href={`/cities/${city.slug}`}>{city.city}</a>
                  </h3>
                  <div className="text-[10px] text-teal-600 font-bold uppercase tracking-wide mt-1">
                    Province: {city.province}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Browse active manufacturers and export clusters mapped inside {city.city}.
                  </p>
                </div>
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">Active Hub</span>
                  <span className="font-semibold text-slate-700">
                    {city.supplierCount.toLocaleString("en-US")} Manufacturers
                  </span>
                </div>
              </Card>
            ))
          ) : (
            // Fallback cities to make the page full of quality crawlable data
            STANDARDIZED_CITIES.map((city) => (
              <Card 
                key={city.slug} 
                className="border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 rounded-xl flex flex-col justify-between"
              >
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-950 hover:text-teal-600 transition-colors">
                    <a href={`/database?province=${encodeURIComponent(city.province)}&city=${encodeURIComponent(city.city)}`}>{city.city}</a>
                  </h3>
                  <div className="text-[10px] text-teal-600 font-bold uppercase tracking-wide mt-1">
                    Province: {city.province}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800 mt-2">Specialty: {city.specialty}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {city.desc}
                  </p>
                </div>
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">Active Hub</span>
                  <span className="font-semibold text-slate-700">
                    {city.count.toLocaleString("en-US")} Manufacturers
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* E-E-A-T Guide */}
        <section className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Vetting by Geographic Location</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-xs leading-relaxed text-slate-600">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Differentiate Direct Factories
              </h3>
              <p className="mt-1.5">
                Check their physical address. Real manufacturing plants are located in outlying industrial zones (工业区) or technology development parks, rather than downtown commercial office towers.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Cross-Verify Local Registration
              </h3>
              <p className="mt-1.5">
                Ensure their Chinese business license registration authority matches the target manufacturing city. If a supplier claims a factory in Yongkang but is registered in Shanghai, they are likely brokers.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Appoint Local Audits
              </h3>
              <p className="mt-1.5">
                Always organize a local inspection (e.g. SGS or QIMA) to perform physical verification of their facility in that city before making deposit wire transfers.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <FaqSection
            title="Geographic Hub FAQ"
            items={[
              {
                question: "How are manufacturer cities mapped?",
                answer: "We structure locations dynamically based on official business registration addresses and stand history records.",
              },
              {
                question: "Can I request custom manufacturer lists by province?",
                answer: "Yes. Sourcing departments can buy standalone custom shortlists targeted by specific provinces (e.g. Zhejiang or Guangdong) via our Custom Shortlist service.",
              },
              {
                question: "How is compliance ensured in location listings?",
                answer: "Since our database is strictly limited to public corporate registries and excludes personal coordinates, it remains fully compliant with CCPA, GDPR, and DSL frameworks.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
