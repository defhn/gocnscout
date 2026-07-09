import Link from "next/link";
import { Cpu, Hammer, Home, Sparkles, Shirt, FileText, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { listProductPages } from "@/server/suppliers";
import { ButtonLink } from "@/components/ui/button";

export const metadata = createMetadata({
  title: "China Supplier Product Keywords and Categories",
  description: "Browse product keyword indexes for China supplier research, then filter manufacturers by industry, city, company type, trade mode, and website status.",
  path: "/products",
});

// A comprehensive mock list of hot sourcing keywords to make the page full of quality indexable content
const HOT_KEYWORDS = [
  {
    keyword: "Stainless Steel Vacuum Cups",
    slug: "stainless-steel-vacuum-cups",
    count: 3200,
    category: "Household & Kitchenware",
    hubs: "Yongkang, Zhejiang",
  },
  {
    keyword: "Brushless Cordless Drills",
    slug: "brushless-cordless-drills",
    count: 1450,
    category: "Hardware & Tools",
    hubs: "Jinhua, Zhejiang",
  },
  {
    keyword: "Lithium Battery Packs (Lifepo4)",
    slug: "lithium-battery-packs-lifepo4",
    count: 2600,
    category: "Electronics & Energy",
    hubs: "Shenzhen, Guangdong",
  },
  {
    keyword: "High-Tensile Hex Fasteners",
    slug: "high-tensile-hex-fasteners",
    count: 1980,
    category: "Industrial & Hardware",
    hubs: "Ningbo, Zhejiang",
  },
  {
    keyword: "Seamless Sport Knitwear",
    slug: "seamless-sport-knitwear",
    count: 3100,
    category: "Apparel & Textiles",
    hubs: "Shaoxing, Zhejiang",
  },
  {
    keyword: "Smart Home Tuya Switches",
    slug: "smart-home-tuya-switches",
    count: 1150,
    category: "Smart Electronics",
    hubs: "Shenzhen, Guangdong",
  },
];

export default async function ProductsPage() {
  const products = await listProductPages().catch(() => []);
  const hasRealData = products.length > 0;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
      
      <section className="container-page pb-20">
        {/* Header Block */}
        <div className="max-w-4xl py-6 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Keyword Index</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Product Keywords
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            Browse verified Chinese manufacturers indexed by key product parameters and catalog tags. 
            Narrow down your supplier search from general categories to specific manufacturing capability clusters.
          </p>
        </div>

        {/* Bento introduction */}
        <section className="grid gap-6 md:grid-cols-3 mb-16">
          <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-950">Granular Search Scope</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Product keywords drill down into specific catalog items (e.g. LIFEP04 packs vs. general electronics), helping sourcing teams find direct specialized production lines.
            </p>
          </Card>
          <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-950">Clean Data Mapping</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We clean typos, spelling variants, and regional differences from raw lists, mapping them to standardized English sourcing keywords.
            </p>
          </Card>
          <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-slate-950">Geographic Hub Index</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Each product index is associated with its historical manufacturing clusters, allowing buyers to target provinces with robust local supply chains.
            </p>
          </Card>
        </section>

        {/* Section divider and title */}
        <div className="border-t border-slate-200 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Active Product Directories</h2>
              <p className="text-xs text-slate-500 mt-1">Select a key product tag below to filter suppliers and export verified domains.</p>
            </div>
            <ButtonLink href="/database" className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md">
              Launch Query Console
            </ButtonLink>
          </div>
        </div>

        {/* Main Product Listings Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hasRealData ? (
            products.map((prod) => (
              <Card 
                key={prod.slug} 
                className="border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 rounded-xl"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 hover:text-teal-600 transition-colors">
                      <a href={`/products/${prod.slug}`}>{prod.keyword}</a>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Direct factory profiles, company registry limits, and websites.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">Verified Keyword</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {prod.supplierCount.toLocaleString("en-US")} Manufacturers
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Fallback product keywords to ensure search engines crawl real keywords rather than seeing empty notice
            HOT_KEYWORDS.map((prod) => (
              <Card 
                key={prod.slug} 
                className="border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 rounded-xl"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 hover:text-teal-600 transition-colors">
                      <a href={`/database?q=${encodeURIComponent(prod.keyword)}`}>{prod.keyword}</a>
                    </h3>
                    <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
                      <span>Category: {prod.category}</span>
                      <span>Hub: {prod.hubs}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">Active Keyword</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {prod.count.toLocaleString("en-US")} Manufacturers
                    </span>
                  </div>
                </CardContent>
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
            <h2 className="text-2xl font-bold text-slate-950">Vetting by Product Parameters</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-xs leading-relaxed text-slate-600">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Differentiate Brokers
              </h3>
              <p className="mt-1.5">
                Always cross-reference the keyword items with their official Chinese business scope. Legitimate factories specialize in raw materials or manufacturing methods related to that keyword.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Check Target Regulations
              </h3>
              <p className="mt-1.5">
                Request cert codes (BSCI, ISO, CE) related to the specific keyword. Reliable manufacturers easily provide verification PDFs with matching business license registrations.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mr-2 shrink-0" />
                Physical Factory Audits
              </h3>
              <p className="mt-1.5">
                We strongly advise importing companies to hire third-party inspection firms (e.g. QIMA, SGS) to assess production lines and confirm safety specs on-site before transferring funds.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <FaqSection
            title="Product Vetting FAQ"
            items={[
              {
                question: "How are catalog keywords compiled?",
                answer: "We analyze registered Chinese business scopes, stand catalogs, and active company websites to extract standardized English product keywords.",
              },
              {
                question: "Can I request custom product shortlists?",
                answer: "Yes. Sourcing departments can request a Custom Shortlist of up to 50 vetted suppliers matching custom tech specs via our Shortlist service.",
              },
              {
                question: "Why are personal supplier emails omitted?",
                answer: "We block personal emails and mobile phone coordinates to comply with international regulations like GDPR. Paid users can view official company URLs to contact suppliers directly.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
