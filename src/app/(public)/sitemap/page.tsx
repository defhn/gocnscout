import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata, datasetJsonLd, faqJsonLd } from "@/config/seo";
import { absoluteUrl } from "@/lib/utils";
import { prisma } from "@/lib/db";

export const metadata = createMetadata({
  title: "HTML Sitemap for gocnscout",
  description:
    "Browse the main public pages, supplier database indexes, industry reports, city pages, supplier categories, and legal pages on gocnscout.",
  path: "/sitemap",
});

const corePages = [
  { href: "/", label: "Home", note: "Overview of the China supplier database." },
  { href: "/database", label: "Supplier Database", note: "Search public supplier profiles and filters." },
  { href: "/industries", label: "Industries", note: "Browse supplier categories and industry hubs." },
  { href: "/cities", label: "Cities", note: "Browse manufacturing cities and supplier clusters." },
  { href: "/reports", label: "Reports", note: "Industry PDF reports and sourcing analysis." },
  { href: "/pricing", label: "Pricing", note: "Subscription, report, shortlist, and data license pricing." },
  { href: "/contact", label: "Contact", note: "Support and inquiry form." },
];

const servicePages = [
  { href: "/china-exporter-database", label: "China Exporter Database" },
  { href: "/exhibitor-intelligence-report", label: "Exhibitor Intelligence Report" },
  { href: "/custom-shortlist", label: "Custom Supplier Shortlist" },
  { href: "/data-license", label: "Data License" },
  { href: "/methodology", label: "Methodology" },
  { href: "/data-policy", label: "Data Policy" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

const legalPages = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/refund-policy", label: "Refund Policy" },
  { href: "/legal/acceptable-use", label: "Acceptable Use Policy" },
];

const machineReadablePages = [
  { href: "/sitemap.xml", label: "XML Sitemap" },
  { href: "/robots.txt", label: "Robots.txt" },
  { href: "/llms.txt", label: "LLMs.txt" },
  { href: "/pricing.md", label: "Machine-readable pricing" },
];

export default async function HtmlSitemapPage() {
  const [industries, cities, reports] = await Promise.all([
    prisma.industryPage
      .findMany({
        where: { isIndexable: true },
        orderBy: [{ supplierCount: "desc" }, { industryName: "asc" }],
        select: { slug: true, industryName: true, supplierCount: true },
        take: 80,
      })
      .catch(() => []),
    prisma.cityPage
      .findMany({
        where: { isIndexable: true },
        orderBy: [{ supplierCount: "desc" }, { city: "asc" }],
        select: { slug: true, city: true, province: true, supplierCount: true },
        take: 80,
      })
      .catch(() => []),
    prisma.report
      .findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
        select: { slug: true, title: true, type: true },
        take: 40,
      })
      .catch(() => []),
  ]);

  const faqs = [
    {
      question: "Does this HTML sitemap list every supplier profile?",
      answer:
        "No. The HTML sitemap focuses on human-readable discovery paths. The XML sitemap lists indexable supplier, industry, city, and report URLs for search engines.",
    },
    {
      question: "Can search engines crawl gocnscout pages?",
      answer:
        "Yes. Public pages, industry pages, city pages, supplier profiles, reports, policy pages, llms.txt, and pricing.md are crawlable. Private app, admin, API, and filtered database query URLs are restricted.",
    },
  ];

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      datasetJsonLd({
        name: "gocnscout Public Supplier Research Sitemap",
        description:
          "A public sitemap for gocnscout pages covering China supplier database sections, industries, manufacturing cities, reports, and compliance pages.",
        url: "/sitemap",
      }),
      faqJsonLd(faqs),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sitemap" }]} />
      <section className="container-page pb-16">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Crawlable public index</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">gocnscout HTML Sitemap</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Use this page to browse the public sections of gocnscout. Search engines should use the XML sitemap for full
            URL discovery, while AI systems can also read <Link className="font-semibold text-teal-700" href="/llms.txt">llms.txt</Link> and{" "}
            <Link className="font-semibold text-teal-700" href="/pricing.md">pricing.md</Link> for concise context.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SitemapCard title="Core Pages" items={corePages} />
          <SitemapCard title="Services and Trust Pages" items={servicePages} />
          <SitemapCard title="Legal Pages" items={legalPages} />
          <SitemapCard title="Machine-readable Files" items={machineReadablePages} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold text-slate-950">Industry Pages</h2>
              <p className="mt-2 text-sm text-slate-600">
                Indexable industry pages are generated from supplier category data. Product keyword detail pages are not listed until keyword quality is reviewed.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {industries.map((item) => (
                  <SitemapLink
                    key={item.slug}
                    href={`/industries/${item.slug}`}
                    label={item.industryName}
                    note={`${item.supplierCount.toLocaleString("en-US")} suppliers`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold text-slate-950">City Pages</h2>
              <p className="mt-2 text-sm text-slate-600">
                City pages focus on manufacturing cluster discovery. City detail content is based on supplier counts and public company profile fields.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {cities.map((item) => (
                  <SitemapLink
                    key={item.slug}
                    href={`/cities/${item.slug}`}
                    label={`${item.city}, ${item.province}`}
                    note={`${item.supplierCount.toLocaleString("en-US")} suppliers`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardContent>
            <h2 className="text-xl font-semibold text-slate-950">Published Reports</h2>
            {reports.length ? (
              <div className="mt-5 grid gap-2 md:grid-cols-3">
                {reports.map((report) => (
                  <SitemapLink key={report.slug} href={`/reports/${report.slug}`} label={report.title} note={report.type.replaceAll("_", " ")} />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                No public report detail pages are listed until the admin publishes real PDF reports. The report hub remains available for pricing and workflow information.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardContent>
            <h2 className="text-xl font-semibold text-slate-950">Search Engine Discovery Notes</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {faqs.map((item) => (
                <div key={item.question}>
                  <h3 className="text-sm font-semibold text-slate-950">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Canonical domain: {absoluteUrl("/")}. Public support email: gerry@gocnscout.com.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function SitemapCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ href: string; label: string; note?: string }>;
}) {
  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <div className="mt-5 grid gap-2">
          {items.map((item) => (
            <SitemapLink key={item.href} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SitemapLink({ href, label, note }: { href: string; label: string; note?: string }) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 bg-white px-3 py-2 hover:border-teal-200 hover:bg-teal-50/40">
      <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </Link>
  );
}
