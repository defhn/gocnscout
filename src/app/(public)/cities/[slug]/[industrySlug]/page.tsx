import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ArrowRight, Globe, Users, HelpCircle, CheckCircle2, Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { createMetadata } from "@/config/seo";
import { searchSuppliers } from "@/server/suppliers";
import { prisma } from "@/lib/db";

interface Params {
  slug: string;
  industrySlug: string;
}

async function getCityIndustryData(citySlug: string, industrySlug: string) {
  const city = await prisma.cityPage.findUnique({ where: { slug: citySlug } });
  if (!city) return null;

  // 查询行业信息，支持从 industryPage 或 supplier 记录反查
  let industryName = "";
  let industryNameCn = "";
  
  const industryPage = await prisma.industryPage.findUnique({ where: { slug: industrySlug } });
  if (industryPage) {
    industryName = industryPage.industryName;
    industryNameCn = industryPage.industryNameCn || "";
  } else {
    const sampleSupplier = await prisma.supplier.findFirst({
      where: { isPublished: true, industrySlug }
    });
    if (!sampleSupplier) return null;
    industryName = sampleSupplier.industryName || "";
    industryNameCn = sampleSupplier.industryNameCn || "";
  }

  const suppliers = await searchSuppliers({
    province: city.province,
    city: city.city,
    industry: industryName,
    pageSize: 30
  });

  return { city, industryName, industryNameCn, suppliers, industrySlug };
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, industrySlug } = await params;
  const data = await getCityIndustryData(slug, industrySlug).catch(() => null);
  if (!data) return createMetadata({ title: "Sourcing Database", description: "Supplier directory.", noindex: true });
  const cityEn = data.city.cityEn || data.city.city;
  return createMetadata({
    title: `${data.industryName} Manufacturers in ${cityEn} Database (2026)`,
    description: `Browse verified ${data.industryName} export suppliers and factories in ${cityEn}, ${data.city.provinceEn || data.city.province}. capital scale and website verification status.`,
    path: `/cities/${slug}/${industrySlug}`,
  });
}

export default async function CityIndustryPage({ params }: { params: Promise<Params> }) {
  const { slug, industrySlug } = await params;
  const data = await getCityIndustryData(slug, industrySlug).catch(() => null);
  if (!data) notFound();

  const { city, industryName, industryNameCn, suppliers } = data;
  const cityEn = city.cityEn || city.city;
  const provinceEn = city.provinceEn || city.province;
  const totalCount = suppliers.total;

  // 构造 FAQ 结构化数据 (JSON-LD FAQ Schema)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How many verified ${industryName} exporters are in ${cityEn}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our database indexes ${totalCount} verified ${industryName} export manufacturers and trade suppliers in ${cityEn}, ${provinceEn}. Sourcing managers can browse target factory profiles on gocnscout.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I verify a ${industryName} factory in ${cityEn}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `To verify a ${industryName} supplier in ${cityEn}, screen their registered capital, check official website domain availability, and inspect how many sessions they exhibited. Direct OEM/ODM factories typically hold higher capital ratings.`
        }
      }
    ]
  };

  // 构造 Dataset Schema (JSON-LD Dataset)
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${cityEn} ${industryName} Manufacturers Database`,
    "description": `Verified exporter list of ${industryName} manufacturers based in ${cityEn}, ${provinceEn} province. Features capital scales and domain status.`,
    "license": "https://gocnscout.com/data-license",
    "temporalCoverage": "2026",
    "creator": {
      "@type": "Organization",
      "name": "GoCNScout",
      "url": "https://gocnscout.com"
    }
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

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cities", href: "/database" },
          { label: cityEn, href: `/cities/${slug}` },
          { label: industryName },
        ]}
      />

      <section className="container-page pb-20 max-w-4xl mx-auto">
        {/* Banner Section */}
        <div className="py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {cityEn} · {provinceEn}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Last Updated: July 2026
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">
            {cityEn} {industryName} Manufacturers &amp; Suppliers Database
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Access target supplier records specializing in <strong>{industryName}</strong> ({industryNameCn}) located in the active manufacturing clusters of <strong>{cityEn}</strong>. Verify capital scales and domain configurations.
          </p>

          {/* Quick Stats Panel */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-3">
              <p className="text-2xl font-bold text-slate-950">{totalCount.toLocaleString("en-US")}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Niche Exporters</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-3">
              <p className="text-sm font-bold text-slate-950 leading-tight">
                {cityEn} Manufacturing Cluster
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Regional Hub Location</p>
            </div>
          </div>
        </div>

        {/* Manufacturing Niche Overview */}
        <section className="mt-6 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">
            {cityEn} {industryName} Cluster Sourcing Insights
          </h2>
          <div className="mt-4 text-sm text-slate-600 leading-relaxed space-y-4">
            <p>
              The industrial landscape of <strong>{cityEn}</strong> has nurtured deep expertise in the <strong>{industryName}</strong> bracket. By concentrating raw supply lines, molding workshops, and digital shipping forwarders in unified suburban zones, export factories in {cityEn} maintain rapid lead times and highly competitive pricing curves.
            </p>
            <p>
              Sourcing managers evaluating {cityEn} factories typically look to coordinate direct OEM or ODM sample checks. The dataset lists <strong>{totalCount} active exporters</strong> verified through historical exhibition stands and corporate registry cross-checks. Standard due diligence is recommended before executing bank transfers.
            </p>
          </div>
        </section>

        {/* Directory List */}
        {suppliers.suppliers.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                Verified Supplier Records Directory
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                Showing 30 of {totalCount.toLocaleString("en-US")}
              </span>
            </div>

            <div className="grid gap-3">
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
                  href={`/database?province=${encodeURIComponent(city.province)}&city=${encodeURIComponent(city.city)}&industry=${encodeURIComponent(industryName)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Unlock All {totalCount.toLocaleString("en-US")} {industryName} Exporters
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* FAQs */}
        <section className="mt-12 max-w-4xl border-t border-slate-200 pt-10">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 tracking-tight">
            <HelpCircle className="h-5.5 w-5.5 text-teal-600" />
            Frequently Asked Questions
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                How many export manufacturers are in this directory?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                Our directory catalogs {totalCount.toLocaleString("en-US")} verified exporters and factories registered in {cityEn} for the {industryName} bracket. This catalog is refreshed quarterly.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                How is the data compiled and verified?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">
                gocnscout cross-references company details from premium exhibition databases, official corporate registries, and active corporate domains. Sourcing teams are advised to conduct standard quality checks and factory compliance reviews before closing purchase orders.
              </p>
            </div>
          </div>
        </section>

        {/* Back Link to City */}
        <div className="mt-12 text-center border-t border-slate-100 pt-8">
          <Link
            href={`/cities/${slug}`}
            className="text-xs font-semibold text-slate-500 hover:text-teal-600 flex items-center justify-center gap-1"
          >
            <ArrowRight className="h-3 w-3 rotate-180" />
            Back to Full {cityEn} Sourcing Database Page
          </Link>
        </div>
      </section>
    </>
  );
}
