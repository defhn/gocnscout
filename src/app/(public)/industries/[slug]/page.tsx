import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ArrowRight, Globe, Users, HelpCircle, CheckCircle2, Calendar, Database, Sparkles, Award } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { getIndustryPage } from "@/server/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getIndustryPage(slug).catch(() => null);
  if (!data) return createMetadata({ title: "Industry suppliers", description: "Industry supplier page.", noindex: true });
  return createMetadata({
    title: `${data.industry.industryName} Manufacturers & Export Suppliers Database (2026)`,
    description: data.industry.metaDescription,
    path: `/industries/${slug}`,
    noindex: !data.industry.isIndexable,
  });
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getIndustryPage(slug).catch(() => null);
  if (!data) notFound();

  const {
    industry,
    suppliers,
    hasWebsiteCount,
    hasCapitalCount,
    stableExhibitorCount,
    topCities
  } = data;

  const totalCount = industry.supplierCount;
  const industryName = industry.industryName;
  const industryNameCn = industry.industryNameCn || "";

  // 构造 FAQ 结构化数据 (JSON-LD FAQ Schema)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where can I find verified ${industryName} manufacturers?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can search and verify active ${industryName} exporters directly on the gocnscout platform. Our database indexes ${totalCount.toLocaleString("en-US")} suppliers in this category, allowing you to filter by location, capital scale, and web DNS status.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I check if a ${industryName} exporter is a direct factory?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `To verify direct manufacturing setups in the ${industryName} sector, examine the registered capital levels and trade mode variables (OEM/ODM). Factories typically hold higher capital allocations compared to standard wholesale agencies.`
        }
      }
    ]
  };

  // 构造 Dataset Schema (JSON-LD Dataset)
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${industryName} Exporters Dataset`,
    "description": `Verified B2B exporter registry for ${industryName} manufacturers in China. Includes capital scale, website availability, and stand session histories.`,
    "license": "https://gocnscout.com/data-license",
    "temporalCoverage": "2026",
    "creator": {
      "@type": "Organization",
      "name": "GoCNScout",
      "url": "https://gocnscout.com"
    }
  };

  // 构造 Organization Schema (JSON-LD Organization)
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GoCNScout",
    "url": "https://gocnscout.com",
    "logo": "https://gocnscout.com/logo.png",
    "description": "Premium China Supplier Intelligence and B2B Exporter Cluster Database."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Industries", href: "/database" },
          { label: industryName },
        ]}
      />

      <section className="container-page pb-20">
        {/* Banner Section */}
        <div className="max-w-4xl py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">
            <span className="flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              China Sourcing Atlas · B2B Category
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Last Updated: July 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">
            {industryName} Manufacturers &amp; B2B Suppliers
          </h1>
          {industryNameCn && (
            <p className="text-sm font-semibold text-slate-400 mt-1">Category Registry: {industryNameCn}</p>
          )}
          <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-4xl">
            Analyze verified export manufacturers and wholesale suppliers specializing in the <strong>{industryName}</strong> sector. Vetting is supported by registered capital audits, web domain checks, and historical exhibition stand session analysis.
          </p>

          {/* Quick Stats Panel */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-2xl font-bold text-slate-950">{totalCount.toLocaleString("en-US")}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Verified Exporters</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-2xl font-bold text-slate-950">{topCities.length}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Major Manufacturing Hubs</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 col-span-2">
              <p className="text-base font-bold text-slate-950 leading-snug">
                Verified Sourcing Records
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Database Coverage Mode</p>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#directory"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              Browse All {industryName} Exporters
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/custom-shortlist"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Request Custom Sourcing RFP
            </Link>
          </div>
        </div>

        {/* Industry Sourcing Overview */}
        <section className="mt-6 border-t border-slate-200 pt-10 max-w-4xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-950 tracking-tight">
            China {industryName} Sourcing &amp; Manufacturing Overview
          </h2>
          {industry.intro ? (
            <div
              className="mt-4 text-sm text-slate-600 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: industry.intro }}
            />
          ) : (
            <div className="mt-4 text-sm text-slate-600 leading-relaxed space-y-4">
              <p>
                The <strong>{industryName}</strong> sector represents a core pillar of China&apos;s trade footprint. Our database registers <strong>{totalCount.toLocaleString("en-US")} active export suppliers</strong> operating in this category. Out of these targets, <strong>{hasWebsiteCount.toLocaleString("en-US")} exporters</strong> maintain active online domains for verification, and <strong>{hasCapitalCount.toLocaleString("en-US")} entities</strong> have registered capital filings open for due diligence checks.
              </p>
              <p>
                Sourcing managers target specific manufacturing zones to leverage regional cluster dynamics. By placing raw material suppliers, assembly lines, and specialized customs brokers in close geographic clusters, local factories can minimize production overheads and logistical delays. Standard supplier verification via on-site audits or sample checking is recommended prior to wire transfers.
              </p>
            </div>
          )}
        </section>

        {/* Quality Signals */}
        <section className="mt-12 max-w-4xl">
          <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
            <Sparkles className="h-5 w-5 text-teal-600" />
            {industryName} Quality Signals (Database Diagnostics)
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Fidelity index diagnostics calculated across the active {industryName} directory.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5 text-center">
                <Globe className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-slate-950">
                  {totalCount > 0 ? Math.round((hasWebsiteCount / totalCount) * 100) : 0}%
                </p>
                <h3 className="text-xs font-bold text-slate-800 mt-1">Website Verification Rate</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {hasWebsiteCount.toLocaleString("en-US")} suppliers with active corporate domains.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5 text-center">
                <Database className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-slate-950">
                  {totalCount > 0 ? Math.round((hasCapitalCount / totalCount) * 100) : 0}%
                </p>
                <h3 className="text-xs font-bold text-slate-800 mt-1">Capital Registration Rate</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {hasCapitalCount.toLocaleString("en-US")} exporters with officially documented capital.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5 text-center">
                <Award className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-slate-950">
                  {totalCount > 0 ? Math.round((stableExhibitorCount / totalCount) * 100) : 0}%
                </p>
                <h3 className="text-xs font-bold text-slate-800 mt-1">Consecutive Exhibit Rate</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {stableExhibitorCount.toLocaleString("en-US")} suppliers registered for 3+ consecutive sessions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Top Cities (Cross Grid) - Double-linking spiders grid */}
        {topCities.length > 0 && (
          <section className="mt-12 max-w-4xl">
            <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
              <MapPin className="h-5 w-5 text-teal-600" />
              Top Sourcing Cities for {industryName} in China
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Browse localized {industryName} export factories based in China&apos;s primary manufacturing zones.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topCities.map((c) => {
                // 如果该城市页面具有 slug，则跳转到我们新构筑的专属二级路由 cities/[slug]/[industrySlug]，实现完美的网格闭环！
                // 如果没有城市页面，跳转到 database 过滤页作为 fallback
                const targetUrl = c.slug 
                  ? `/cities/${c.slug}/${industry.slug}` 
                  : `/database?province=${encodeURIComponent(c.province)}&city=${encodeURIComponent(c.city)}&industry=${encodeURIComponent(industryName)}`;
                
                return (
                  <Link
                    key={c.city}
                    href={targetUrl}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-teal-500 hover:shadow-sm hover:bg-teal-50/10 transition-all group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                        {c.cityEn} {industryName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.province} province</p>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-50 group-hover:bg-teal-50 group-hover:text-teal-700 px-1.5 py-0.5 rounded font-bold transition-all shrink-0">
                      {c.supplierCount} Exporters
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Directory List */}
        {suppliers.suppliers.length > 0 && (
          <section id="directory" className="mt-12 max-w-4xl scroll-mt-6">
            <div className="flex items-end justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
                  <Users className="h-5 w-5 text-teal-600" />
                  Verified Supplier Records Directory ({industryName})
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Preview list of the first 30 exporter profiles. Log in to unlock contact info, factory sizes, and digital footprints.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Showing 30 of {totalCount.toLocaleString("en-US")}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {suppliers.suppliers.map((supplier) => (
                <article
                  key={supplier.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-500/30 hover:shadow-sm transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-950 text-sm truncate">{supplier.exhibitorName}</h3>
                      {supplier.websiteUrl && (
                        <span className="bg-teal-50 text-teal-700 border border-teal-100 rounded px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-0.5">
                          <Globe className="h-2.5 w-2.5" /> Web Verified
                        </span>
                      )}
                    </div>
                    {supplier.city && (
                      <p className="mt-0.5 text-[10px] text-slate-400 font-medium">
                        Location: {supplier.city}, {supplier.province}
                      </p>
                    )}
                    
                    {(supplier.productsText || supplier.keywordsText) && (
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        <strong className="text-slate-700">Products: </strong>
                        {supplier.productsText || supplier.keywordsText}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-400 font-medium">
                      {supplier.companySize && <span className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{supplier.companySize}</span>}
                      {supplier.companyType && <span className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{supplier.companyType}</span>}
                      <span className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-slate-400/80 italic font-mono select-none">
                        Email: [Sign in to view]
                      </span>
                      <span className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-slate-400/80 italic font-mono select-none">
                        Tel: [Sign in to view]
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/database/${supplier.slug}`}
                    className="shrink-0 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-0.5 whitespace-nowrap mt-1"
                  >
                    View Exporter <ArrowRight className="h-3 w-3" />
                  </Link>
                </article>
              ))}
            </div>

            {totalCount > suppliers.suppliers.length && (
              <div className="mt-6 text-center">
                <Link
                  href={`/database?industry=${encodeURIComponent(industryName)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Unlock All {totalCount.toLocaleString("en-US")} {industryName} Exporters
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* FAQ UI Section */}
        <section className="mt-16 max-w-4xl border-t border-slate-200 pt-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
            <HelpCircle className="h-5.5 w-5.5 text-teal-600" />
            Frequently Asked Questions
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                Where can I find verified {industryName} manufacturers?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                You can search and filter verified export manufacturers in the {industryName} sector directly on the gocnscout platform. Our database registers raw registry details, stand records, and domain status to support procurement diagnostics.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                How do I check if an exporter is a direct factory?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                Verify target manufacturers by screening their registered capital thresholds and trade mode flags (OEM/ODM). True manufacturing plants typically hold larger capital backing to support intensive production machinery lines.
              </p>
            </div>
          </div>
        </section>

        {/* E-E-A-T metadata block */}
        <section className="mt-12 max-w-4xl">
          <Card className="border border-slate-200 bg-slate-50/40 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-teal-600" />
                About This Exporters Database
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-slate-600">
                <div>
                  <h4 className="font-bold text-slate-900">Data Collection &amp; Sources</h4>
                  <p className="mt-1">
                    Compiled from trade exhibition registries, checks on corporate DNS resolution statuses, and official corporate registration filings.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Coverage &amp; Reach</h4>
                  <p className="mt-1">
                    Indexes {totalCount.toLocaleString("en-US")} verified exporters specializing in {industryName} in China.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Update Cadence</h4>
                  <p className="mt-1">
                    Refreshed quarterly to audit website availability pings and check recent company filings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </>
  );
}
