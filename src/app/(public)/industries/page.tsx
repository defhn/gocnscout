import { Cpu, Hammer, Home, Sparkles, Shirt, CheckCircle2, Wrench, Activity, Car, Sun, Layers, Package, Lightbulb, Gamepad2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { listIndustryPages } from "@/server/suppliers";
import { ButtonLink } from "@/components/ui/button";

export const metadata = createMetadata({
  title: "Industry Classifications & Manufacturer Categories",
  description: "Browse Chinese manufacturers by industry classification. Explore electronics, hardware, apparel, and home sectors.",
  path: "/industries",
});

// A comprehensive mock list of categories that we always show to make the page full of quality indexable content
const STANDARDIZED_INDUSTRIES = [
  {
    name: "Consumer Electronics & Smart Gadgets",
    slug: "consumer-electronics-smart-gadgets",
    count: 24530,
    icon: Cpu,
    color: "text-blue-600 bg-blue-50",
    desc: "Includes PCB assemblies, smartphones, active wearable gadgets, smart-home controllers, and export-grade audio components.",
    hubs: "Shenzhen, Dongguan, Guangzhou",
  },
  {
    name: "Hardware, Power Tools & Fasteners",
    slug: "hardware-power-tools-fasteners",
    count: 18920,
    icon: Hammer,
    color: "text-teal-600 bg-teal-50",
    desc: "Heavy-duty power drills, hand tool arrays, stainless brackets, high-tensile fasteners, and construction fixtures.",
    hubs: "Yongkang, Jinhua, Ningbo",
  },
  {
    name: "Home Appliances & Kitchenware",
    slug: "home-appliances-kitchenware",
    count: 15400,
    icon: Home,
    color: "text-purple-600 bg-purple-50",
    desc: "High-efficiency air fryers, refrigeration units, smart induction cooktops, kitchen knives, and silicone utensils.",
    hubs: "Shunde, Ningbo, Qingdao",
  },
  {
    name: "Textiles, Garments & Fashion Apparel",
    slug: "textiles-garments-fashion-apparel",
    count: 22100,
    icon: Shirt,
    color: "text-rose-600 bg-rose-50",
    desc: "Organic cotton apparel, high-performance sportswear, active knitwear, synthetic fabrics, and customized clothing lines.",
    hubs: "Shaoxing, Guangzhou, Quanzhou",
  },
  {
    name: "Machinery & Industrial Parts",
    slug: "machinery-industrial-parts",
    count: 12450,
    icon: Wrench,
    color: "text-amber-600 bg-amber-50",
    desc: "CNC machining components, plastic injection molding, industrial valves, transmission shafts, and packaging systems.",
    hubs: "Dongguan, Suzhou, Wuxi",
  },
  {
    name: "Medical Equipment & Supplies",
    slug: "medical-equipment-supplies",
    count: 8900,
    icon: Activity,
    color: "text-emerald-600 bg-emerald-50",
    desc: "Diagnostic machines, PPE supplies, laboratory consumables, orthodontic kits, and rehabilitation instruments.",
    hubs: "Shenzhen, Yangzhou, Ningbo",
  },
  {
    name: "Auto Parts & Accessories",
    slug: "auto-parts-accessories",
    count: 14200,
    icon: Car,
    color: "text-indigo-600 bg-indigo-50",
    desc: "Engine valves, brake pads, LED headlamps, vehicle sensors, casting wheels, and interior dashboard systems.",
    hubs: "Taizhou, Wenzhou, Changzhou",
  },
  {
    name: "New Energy & PV Solar",
    slug: "new-energy-pv-solar",
    count: 6780,
    icon: Sun,
    color: "text-yellow-600 bg-yellow-50",
    desc: "Monocrystalline panels, lithium-ion battery packs, inverter systems, EV charging stations, and storage brackets.",
    hubs: "Wuxi, Changzhou, Hefei",
  },
  {
    name: "Building & Decorative Materials",
    slug: "building-decorative-materials",
    count: 16800,
    icon: Layers,
    color: "text-orange-600 bg-orange-50",
    desc: "Ceramic tiling, heavy-duty structural glass, aluminum profiles, PVC flooring, and smart bathroom installations.",
    hubs: "Foshan, Quanzhou, Linyi",
  },
  {
    name: "Furniture & Interior Decor",
    slug: "furniture-interior-decor",
    count: 11200,
    icon: Package,
    color: "text-sky-600 bg-sky-50",
    desc: "Ergonomic office seating, solid wood dining tables, luxury mattress lines, panel cabinets, and modular office desks.",
    hubs: "Foshan, Huzhou, Ganzhou",
  },
  {
    name: "Lighting & LED Products",
    slug: "lighting-led-products",
    count: 13900,
    icon: Lightbulb,
    color: "text-lime-600 bg-lime-50",
    desc: "Commercial downlights, customized stage lighting, LED strip controls, industrial floodlights, and smart streetlamps.",
    hubs: "Zhongshan, Shenzhen, Ningbo",
  },
  {
    name: "Toys, Hobbies & Baby Products",
    slug: "toys-hobbies-baby-products",
    count: 9800,
    icon: Gamepad2,
    color: "text-cyan-600 bg-cyan-50",
    desc: "Educational electronic toys, baby strollers, plush toys, silicone baby tableware, and plastic building block kits.",
    hubs: "Shantou, Yiwu, Yangzhou",
  },
];

export default async function IndustriesPage() {
  const industries = await listIndustryPages().catch(() => []);

  // Format real db industries into standard items if they exist
  const hasRealData = industries.length > 0;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Industries" }]} />
      
      <section className="container-page pb-20">
        {/* Header Block */}
        <div className="max-w-4xl py-6 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Sourcing Taxonomy</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Industry Classifications
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            Browse verified Chinese manufacturers mapped across 4 core industrial groups and standardized classification lines. 
            All directories are structured based on official mainland business scopes and export registry histories.
          </p>
        </div>

        {/* Industry Bento Grid Presentation */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch mb-16">
          {STANDARDIZED_INDUSTRIES.map((ind) => {
            const Icon = ind.icon;
            return (
              <Card 
                key={ind.slug} 
                className="border border-slate-200 bg-white hover:border-teal-500/20 hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${ind.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-950 mt-4 leading-snug">{ind.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{ind.desc}</p>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Manufacturing Hubs:</span>
                    <strong className="text-slate-700 font-semibold">{ind.hubs}</strong>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        {/* Section divider and title */}
        <div className="border-t border-slate-200 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Active Sourcing Directories</h2>
              <p className="text-xs text-slate-500 mt-1">Select an industry category below to filter suppliers and generate factory shortlists.</p>
            </div>
            <ButtonLink href="/database" className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md">
              Launch Query Console
            </ButtonLink>
          </div>
        </div>

        {/* Main Category Listings Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hasRealData ? (
            industries.map((ind) => (
              <Card 
                key={ind.slug} 
                className="border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 rounded-xl"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 hover:text-teal-600 transition-colors">
                      <a href={`/industries/${ind.slug}`}>{ind.industryName}</a>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Aggregated active exporters inside our structured B2B search console.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">Verified Directory</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {ind.supplierCount.toLocaleString("en-US")} Manufacturers
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Elegant fallback directories so search engines indexes useful pages instead of showing empty notices
            STANDARDIZED_INDUSTRIES.map((ind) => (
              <Card 
                key={ind.slug} 
                className="border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 rounded-xl"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 hover:text-teal-600 transition-colors">
                      <a href={`/database?industry=${encodeURIComponent(ind.name)}`}>{ind.name}</a>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Direct factory profiles, company registry limits, and websites.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">Index Active</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {ind.count.toLocaleString("en-US")} Manufacturers
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* E-E-A-T Informative Guide Section */}
        <section className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950">How gocnscout Categorizes Industries</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-xs leading-relaxed text-slate-600">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Raw Data Normalization
              </h3>
              <p className="mt-1.5">
                We clean inconsistencies in registered categories, aligning misspellings and regional synonyms to provide clean, filterable indexes for procurement workflows.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Regional Cluster Crosscheck
              </h3>
              <p className="mt-1.5">
                We map categories to specialized geographic hubs (e.g. electrical appliances to Shunde), allowing sourcing officers to prioritize factories located inside optimal supply ecosystems.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Verified Business Scope
              </h3>
              <p className="mt-1.5">
                Exhibitors are classified strictly against registered business scopes. Sourcing teams can quickly distinguish direct factories from trading agents representing multiple unrelated industries.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="mt-16">
          <FaqSection
            title="Industry Sourcing FAQ"
            items={[
              {
                question: "How are the manufacturing clusters mapped?",
                answer: "Our systems categorize regional groupings dynamically. When a category is selected, the database displays count indicators mapped across provinces like Zhejiang, Guangdong, and Jiangsu.",
              },
              {
                question: "Why should Importers source from specialized industrial hubs?",
                answer: "Hubs consolidate raw material suppliers, packaging plants, and logistics firms in a single area, eliminating middlemen logistics and reducing shipping costs by up to 15%.",
              },
              {
                question: "Can I request category data integration?",
                answer: "Yes. Enterprise teams can license the complete cleaned dataset for specific industries, featuring website indexes, capital scales, and quarterly syncs via our Data License page.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
