import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Building2, Factory, ArrowRight, Globe, ShieldCheck, Users, HelpCircle, CheckCircle2 } from "lucide-react";
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
    title: `${cityEn} Exporters | Verified Manufacturers & Suppliers List`,
    description: data.city.metaDescription,
    path: `/cities/${slug}`,
    noindex: !data.city.isIndexable,
  });
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCityPage(slug).catch(() => null);
  if (!data) notFound();

  const { city, suppliers, industryGroups, companyTypeGroups, relatedCities } = data;
  const cityEn = city.cityEn || city.city;
  const provinceEn = city.provinceEn || city.province;
  const totalCount = suppliers.total;

  // 获取前3个大行业用于文案叙述
  const topIndustries = industryGroups.slice(0, 3).map(g => g.industryName).join(", ");

  // 构造 FAQ 结构化数据 (JSON-LD FAQ Schema)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How many verified export manufacturers are located in ${cityEn}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `According to the latest China Exporter Database, there are currently ${city.supplierCount.toLocaleString("en-US")} verified exporters and factories registered in ${cityEn}, ${provinceEn}. Sourcing managers can browse or search the full directory on gocnscout.`
        }
      },
      {
        "@type": "Question",
        "name": `What are the dominant manufacturing industries in ${cityEn}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Manufacturing in ${cityEn} is highly diverse, with major industrial clusters including ${topIndustries || "various heavy and light industries"}. The city features specialized industrial parks with strong supply chain density, reducing local logistics costs and production lead times.`
        }
      },
      {
        "@type": "Question",
        "name": `Are the listed suppliers in ${cityEn} direct factories or trading companies?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The exporter directory contains a healthy mix of direct manufacturing plants (OEM/ODM), group corporations, and export-oriented trading firms. You can filter suppliers by registration capital, trade modes, and company size to narrow down direct manufacturing partners.`
        }
      },
      {
        "@type": "Question",
        "name": `How can I safely contact and verify suppliers from ${cityEn}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `gocnscout verifies companies using official exhibition registration histories, registered capital, and domain ownership records. To proceed with procurement, it is recommended to request a direct factory audit or use third-party inspection services before signing purchasing agreements.`
        }
      }
    ]
  };

  return (
    <>
      {/* 注入 FAQ Schema (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cities", href: "/database" },
          { label: cityEn },
        ]}
      />

      <section className="container-page pb-20">
        {/* H1: 城市标题 */}
        <div className="max-w-4xl py-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">
            <MapPin className="h-3.5 w-3.5" />
            {provinceEn} · China Sourcing Atlas
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">
            {cityEn} Export Manufacturers &amp; B2B Suppliers List
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
              <p className="text-xs text-slate-500 mt-1 font-medium">Dominant Supplier Scale</p>
            </div>
          </div>

          {/* 数据安全性与边际说明 */}
          <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-teal-50/60 border border-teal-100/80 px-4 py-3 text-xs text-teal-800 max-w-4xl leading-relaxed">
            <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-teal-600 mt-0.5" />
            <span>
              <strong>Compliance Notice:</strong> Exporter list complies strictly with international security standards and local data regulations. Personal direct coordinates (phone, direct emails) are kept secure behind auth walls, while public domain checks and exhibitor history are indexed here to support initial screening.
            </span>
          </div>
        </div>

        {/* 深度内容：制造业概览 (Manufacturing Overview) */}
        <section className="mt-10 border-t border-slate-200 pt-10 max-w-4xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-950 tracking-tight">
            {cityEn} Sourcing &amp; Industrial Manufacturing Overview
          </h2>
          <div className="mt-4 text-sm text-slate-600 leading-relaxed space-y-4">
            <p>
              Located in <strong>{provinceEn} Province</strong>, a powerhouse of China&apos;s global manufacturing chain, <strong>{cityEn}</strong> serves as a critical strategic node for international sourcing managers. The local industrial ecosystem in {cityEn} is built on decades of supply chain maturation, robust cluster logistics, and state-of-the-art engineering networks.
            </p>
            <p>
              Exporters based here operate within highly specialized industrial parks. The close geographic proximity of raw material vendors, hardware molders, electronic assembly plants, and international logistics agencies drives down overhead sourcing margins and optimizes lead times. This integrated setup makes {cityEn} highly competitive for international OEM, ODM, and contract manufacturing projects.
            </p>
            {topIndustries && (
              <p>
                Major product sectors originating from this region include <strong>{topIndustries}</strong>. Sourcing organizations looking to optimize vendor pipelines or identify backup manufacturers frequently target {cityEn} to negotiate directly with scaled exporters that hold solid compliance certifications and established quality management standards.
              </p>
            )}
          </div>
        </section>

        {/* H2: 行业与链接交叉矩阵 (Industry Keyword Interlinking Grid) */}
        {industryGroups.length > 0 && (
          <section className="mt-12 max-w-4xl">
            <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
              <Factory className="h-5 w-5 text-teal-600" />
              Sourcing Categories in {cityEn} (Click to Filter)
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Browse exporter profiles categorized by specific manufacturing segments in {cityEn}.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {industryGroups.map((item, i) => {
                const searchUrl = `/database?province=${encodeURIComponent(city.province)}&city=${encodeURIComponent(city.city)}&industry=${encodeURIComponent(item.industryName)}`;
                return (
                  <Link
                    key={item.industryName}
                    href={searchUrl}
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
                      <span className={`text-xs font-bold ${i === 0 ? "text-teal-600" : "text-slate-500"}`}>
                        {item._count.id}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* H2: 企业类型与外贸模式分布 */}
        {companyTypeGroups.length > 0 && (
          <section className="mt-12 max-w-4xl">
            <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
              <Building2 className="h-5 w-5 text-teal-600" />
              Supplier Corporate Types &amp; Scale Distribution
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Analysis of registered exporter entities and trade profile scales based in {cityEn}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {companyTypeGroups.map((item) => (
                <div
                  key={item.companyTypeEn}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium"
                >
                  <span className="text-slate-800">{item.companyTypeEn}</span>
                  <span className="ml-2 text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded font-bold">
                    {item._count.id}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* H2: 样本供应商 (展示 30 家，模糊隐私数据并促进转化) */}
        {suppliers.suppliers.length > 0 && (
          <section className="mt-12 max-w-4xl">
            <div className="flex items-end justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
                  <Users className="h-5 w-5 text-teal-600" />
                  Verified Exporters Directory ({cityEn})
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

        {/* FAQ UI Section */}
        <section className="mt-16 max-w-4xl border-t border-slate-200 pt-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-950 flex items-center gap-2 tracking-tight">
            <HelpCircle className="h-5.5 w-5.5 text-teal-600" />
            Frequently Asked Questions (FAQ) - Sourcing from {cityEn}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                How many export manufacturers are in {cityEn}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-5.5">
                Currently, there are {city.supplierCount.toLocaleString("en-US")} verified exporters and manufacturing hubs cataloged in the database for {cityEn}, {provinceEn}. Sourcing networks are frequently refreshed based on recent registration audits.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                What are the main export industries in {cityEn}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-5.5">
                {cityEn} is specialized in several global sectors, with major clusters focusing on {topIndustries || "various consumer and machinery categories"}. The regional proximity of parts suppliers and assembly centers optimizes lead times significantly.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                Are these entities manufacturers or trading companies?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-5.5">
                Our index lists direct industrial factories (OEM/ODM/OBM), registered export conglomerates, and general B2B trading agencies. Sourcing departments can filter by capital size and trade mode to prioritize direct production partners.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                How is this supplier directory data compiled?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-5.5">
                gocnscout cross-references company details from premium exhibition databases, official corporate registries, and active corporate domains. Sourcing teams are advised to conduct standard quality checks and factory compliance reviews before closing purchase orders.
              </p>
            </div>
          </div>
        </section>

        {/* H2: 采购指南 (Bento layout) */}
        <section className="mt-12 max-w-4xl grid gap-4 md:grid-cols-3">
          <h2 className="sr-only">Procurement Sourcing Guidelines</h2>
          <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardContent className="pt-5">
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider text-teal-600">Supplier Discovery</h3>
              <h4 className="text-sm font-bold text-slate-900 mt-1">1. Narrow Down Categories</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Filter by specific industry brackets first. Cross-reference company size tags to gauge production scales.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardContent className="pt-5">
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider text-teal-600">Verification Steps</h3>
              <h4 className="text-sm font-bold text-slate-900 mt-1">2. Audit Operating Bases</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Review website domain checks. Initiate direct contact to request sample batches and export registry certifications.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardContent className="pt-5">
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider text-teal-600">Disclaimer &amp; Bounds</h3>
              <h4 className="text-sm font-bold text-slate-900 mt-1">3. Research Limitations</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Data acts as discovery assistance only. Sourcing managers assume liability for compliance checks and quality reviews.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* H2: 同省份相关城市 */}
        {relatedCities.length > 0 && (
          <section className="mt-12 max-w-4xl">
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">
              Related Exporter Cities in {provinceEn}
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
