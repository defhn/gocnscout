import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Factory, ArrowRight, Globe, Users, HelpCircle, CheckCircle2, Calendar, Database, Sparkles, Award } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { getCityPage } from "@/server/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCityPage(slug).catch(() => null);
  if (!data) return createMetadata({ title: "City suppliers", description: "City supplier page.", noindex: true });
  const cityEn = data.city.cityEn || data.city.city;
  return createMetadata({
    title: `${cityEn} Manufacturers Database (2026) | Verified Exporters & Suppliers`,
    description: data.city.metaDescription,
    path: `/cities/${slug}`,
    noindex: !data.city.isIndexable,
  });
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCityPage(slug).catch(() => null);
  if (!data) notFound();

  const {
    city,
    suppliers,
    industryGroups,
    companyTypeGroups,
    relatedCities,
    hasWebsiteCount,
    hasCapitalCount,
    stableExhibitorCount
  } = data;

  const cityEn = city.cityEn || city.city;
  const provinceEn = city.provinceEn || city.province;
  const totalCount = suppliers.total;

  // 获取前3个大行业用于文案叙述
  const topIndustries = industryGroups.slice(0, 3).map(g => g.industryName).join(", ");
  const topInd1 = industryGroups[0] ? `${industryGroups[0].industryName} (${industryGroups[0]._count.id} exporters)` : "";
  const topInd2 = industryGroups[1] ? `${industryGroups[1].industryName} (${industryGroups[1]._count.id} exporters)` : "";
  const topInd3 = industryGroups[2] ? `${industryGroups[2].industryName} (${industryGroups[2]._count.id} exporters)` : "";

  // 构造 FAQ 结构化数据 (JSON-LD FAQ Schema)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where can I find verified ${cityEn} manufacturers?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can search and filter verified export manufacturers in ${cityEn} directly on the gocnscout platform. Our database indexes ${city.supplierCount.toLocaleString("en-US")} exporters from ${cityEn}, allowing you to screen by industry, capital scale, and domain verification status.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I check if a ${cityEn} supplier is a real factory?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `To verify if a ${cityEn} supplier is a direct manufacturer, check their registered capital, trade modes, and exhibition stand history. Direct factories typically have higher registered capital and are registered for OEM/ODM trade modes rather than pure trading company classifications.`
        }
      },
      {
        "@type": "Question",
        "name": `What products are manufactured in ${cityEn}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Manufacturing clusters in ${cityEn} cover several key export sectors, including ${topIndustries || "various consumer and industrial categories"}. The city hosts robust supply chain parks specializing in these categories to reduce processing lead times.`
        }
      },
      {
        "@type": "Question",
        "name": `How many suppliers are listed in the ${cityEn} database?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `There are currently ${city.supplierCount.toLocaleString("en-US")} verified exporters and factories registered in ${cityEn} cataloged within our directory. This database is updated quarterly with fresh domain checks and stand session history.`
        }
      }
    ]
  };

  // 构造 Dataset Schema (JSON-LD Dataset)
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${cityEn} Exporters Database`,
    "description": `Verified B2B manufacturers and export suppliers registry for ${cityEn}, ${provinceEn} province, China. Includes capital scale and domain status.`,
    "license": "https://gocnscout.com/data-license",
    "temporalCoverage": "2026",
    "creator": {
      "@type": "Organization",
      "name": "GoCNScout",
      "url": "https://gocnscout.com"
    },
    "variableMeasured": [
      "Registered Capital",
      "Industry Classification",
      "Website URL DNS Status",
      "Exhibitor History Session Count",
      "Trade Mode"
    ]
  };

  // 构造 Organization Schema (JSON-LD Organization)
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GoCNScout",
    "url": "https://gocnscout.com",
    "logo": "https://gocnscout.com/logo.png",
    "description": "Premium China Supplier Intelligence and B2B Exporter Cluster Database.",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@gocnscout.com",
      "contactType": "customer service"
    }
  };

  return (
    <>
      {/* 注入 FAQ Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 注入 Dataset Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      {/* 注入 Organization Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cities", href: "/database" },
          { label: cityEn },
        ]}
      />

      <section className="container-page pb-20">
        {/* H1 & Banner Section */}
        <div className="max-w-4xl py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {provinceEn} · China
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Last Updated: July 2026
            </span>
          </div>
          
          {/* H1: 重点词强化 */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">
            {cityEn} Exporters Database: Verified Manufacturers &amp; Suppliers
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-4xl">
            Access verified database records of active export factories in {cityEn}. Optimize your sourcing strategies by locating regional supplier clusters, checking registered capital parameters, and filtering target products.
          </p>

          {/* 核心统计指标面板 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-2xl font-bold text-slate-950">{city.supplierCount.toLocaleString("en-US")}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Verified Exporters</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-2xl font-bold text-slate-950">{industryGroups.length}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Unique Sectors</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 col-span-2">
              <p className="text-base font-bold text-slate-950 leading-snug truncate">
                {companyTypeGroups.length > 0 ? companyTypeGroups[0].companyTypeEn : "OEM / ODM Exporters"}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Dominant Exporter Scale</p>
            </div>
          </div>

          {/* 首屏强 CTA 按钮 */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#directory"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              Browse {cityEn} Exporters Database
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/data-license"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Request Bulk Data License
            </Link>
          </div>
        </div>

        {/* 深度原创内容：Sourcing & Industrial Overview (融入真实数据) */}
        <section className="mt-6 border-t border-slate-200 pt-10 max-w-4xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-950 tracking-tight">
            {cityEn} Sourcing &amp; Industrial Manufacturing Overview
          </h2>
          {city.industrialCluster ? (
            <div
              className="mt-4 text-sm text-slate-600 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: city.industrialCluster }}
            />
          ) : (
            <div className="mt-4 text-sm text-slate-600 leading-relaxed space-y-4">
              <p>
                Sourcing statistics show that <strong>{cityEn}</strong> hosts <strong>{city.supplierCount.toLocaleString("en-US")} verified exporters</strong> with established production tracks. Out of this directory, <strong>{hasWebsiteCount.toLocaleString("en-US")} manufacturers</strong> maintain active online domains and digital homepages, and <strong>{hasCapitalCount.toLocaleString("en-US")} exporters</strong> have officially registered capital records available for vetting checks.
              </p>
              <p>
                Exporters based here operate within highly specialized industrial parks. The close geographic proximity of raw material vendors, hardware molders, electronic assembly plants, and international logistics agencies drives down overhead sourcing margins and optimizes lead times. This integrated setup makes {cityEn} highly competitive for international OEM, ODM, and contract manufacturing projects.
              </p>
              {(topInd1 || topInd2 || topInd3) && (
                <p>
                  The industrial composition in the region is led by key product sectors, notably: <strong>{topInd1}</strong>, followed by <strong>{topInd2}</strong> and <strong>{topInd3}</strong>. Sourcing organizations looking to optimize vendor pipelines or identify backup manufacturers frequently target {cityEn} to negotiate directly with scaled exporters that hold solid compliance certifications and established quality management standards.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Supplier Intelligence Signals (差异化特色数据分析) */}
        <section className="mt-12 max-w-4xl">
          <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
            <Sparkles className="h-5 w-5 text-teal-600" />
            {cityEn} Exporter Database Quality Signals (Signals Analysis)
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Real-time quality diagnostics extracted directly from our active {cityEn} supplier database.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5 text-center">
                <Globe className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-slate-950">
                  {city.supplierCount > 0 ? Math.round((hasWebsiteCount / city.supplierCount) * 100) : 0}%
                </p>
                <h3 className="text-xs font-bold text-slate-800 mt-1">Website Verification Rate</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {hasWebsiteCount.toLocaleString("en-US")} suppliers with verified, active corporate homepages.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5 text-center">
                <Database className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-slate-950">
                  {city.supplierCount > 0 ? Math.round((hasCapitalCount / city.supplierCount) * 100) : 0}%
                </p>
                <h3 className="text-xs font-bold text-slate-800 mt-1">Capital Registration Rate</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {hasCapitalCount.toLocaleString("en-US")} exporters with officially documented capital records.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
              <CardContent className="p-5 text-center">
                <Award className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-slate-950">
                  {city.supplierCount > 0 ? Math.round((stableExhibitorCount / city.supplierCount) * 100) : 0}%
                </p>
                <h3 className="text-xs font-bold text-slate-800 mt-1">Stand Session Stability</h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {stableExhibitorCount.toLocaleString("en-US")} suppliers registered for 3+ consecutive exhibition sessions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Supplier Distribution by Industry (比例占比条分析) */}
        {industryGroups.length > 0 && (
          <section className="mt-12 max-w-4xl">
            <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
              <Factory className="h-5 w-5 text-teal-600" />
              Supplier Distribution by Industry in {cityEn}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Visual proportion of active exporters in {cityEn} across the top 6 product divisions.
            </p>
            <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              {industryGroups.map((item) => {
                const percent = city.supplierCount > 0 ? Math.round((item._count.id / city.supplierCount) * 100) : 0;
                return (
                  <div key={item.industryName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.industryName}</span>
                      <span className="font-semibold text-slate-500">{percent}% ({item._count.id} suppliers)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(2, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* H2: 行业与链接交叉矩阵 (指向独立子路由 Landing Page - 蜘蛛网内链网格) */}
        {industryGroups.length > 0 && (
          <section className="mt-12 max-w-4xl">
            <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
              <Database className="h-5 w-5 text-teal-600" />
              Sourcing Categories in {cityEn} (Click to Filter)
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Browse exporter profiles categorized by specific manufacturing segments in {cityEn}.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {industryGroups.map((item) => {
                const lpUrl = `/cities/${slug}/${item.industrySlug}`;
                return (
                  <Link
                    key={item.industryName}
                    href={lpUrl}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-teal-500 hover:shadow-sm hover:bg-teal-50/10 transition-all group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                        {item.industryName} in {cityEn}
                      </p>
                      {item.industryNameCn && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.industryNameCn}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* H2: 样本供应商 (展示 30 家) */}
        {suppliers.suppliers.length > 0 && (
          <section id="directory" className="mt-12 max-w-4xl scroll-mt-6">
            <div className="flex items-end justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
                  <Users className="h-5 w-5 text-teal-600" />
                  Verified Supplier Records Directory ({cityEn})
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
                    <p className="mt-0.5 text-[11px] text-teal-700 font-semibold">{supplier.industryName}</p>
                    
                    {/* 产品关键词预览 */}
                    {(supplier.productsText || supplier.keywordsText) && (
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        <strong className="text-slate-700">Products: </strong>
                        {supplier.productsText || supplier.keywordsText}
                      </p>
                    )}

                    {/* 虚实结合的细节：已锁定部分以提高注册转化率 */}
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
                  href={`/database?province=${encodeURIComponent(city.province)}&city=${encodeURIComponent(city.city)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Unlock All {totalCount.toLocaleString("en-US")} {cityEn} Exporters
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* H2: FAQ UI Section (采购意图优化) */}
        <section className="mt-16 max-w-4xl border-t border-slate-200 pt-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
            <HelpCircle className="h-5.5 w-5.5 text-teal-600" />
            Frequently Asked Questions (FAQ) - Sourcing from {cityEn}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                Where can I find verified {cityEn} manufacturers?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                You can browse and search verified export manufacturers in {cityEn} directly on the gocnscout B2B search console. We index raw corporate registration records, website availability status, and stand details to support buyer discovery workflows.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                How do I check if a {cityEn} supplier is a real factory?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                Check the company&apos;s registered capital and trade mode. Direct export factories typically exhibit higher registered capital levels and support OEM/ODM contract production, whereas trading companies focus on multi-category wholesale.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                What products are manufactured in {cityEn}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                {cityEn} is specialized in several global sectors, with major clusters focusing on {topIndustries || "various consumer and machinery categories"}. The regional proximity of parts suppliers and assembly centers optimizes lead times significantly.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                How many suppliers are listed in the {cityEn} database?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                Our directory catalogs {city.supplierCount.toLocaleString("en-US")} verified exporters and factories located in {cityEn}. You can configure custom filters to profile supplier scales and check active web domains.
              </p>
            </div>
          </div>
        </section>

        {/* About This Supplier Database (E-E-A-T metadata block) */}
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
                    Compiled from standard trade exhibition registrations, checked corporate DNS records, and verified public capital filings.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Coverage &amp; Reach</h4>
                  <p className="mt-1">
                    Indexes {city.supplierCount.toLocaleString("en-US")} verified exporters across {industryGroups.length} manufacturing sectors in {cityEn}.
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

        {/* H2: Related Cities (Nearby Manufacturing Hubs) */}
        {relatedCities.length > 0 && (
          <section className="mt-12 max-w-4xl">
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">
              Nearby Manufacturing Hubs in {provinceEn}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Other major industrial exporter hubs in {provinceEn} province with verified supplier directory listings.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {relatedCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cities/${c.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs hover:border-teal-500 hover:bg-teal-50/5 transition-all group"
                >
                  <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  <span className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                    {c.cityEn || c.city}
                  </span>
                  <span className="text-slate-400 bg-slate-50 px-1 rounded font-bold">
                    {c.supplierCount}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </>
  );
}
