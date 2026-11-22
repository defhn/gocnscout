import { ArrowRight, BookOpen, ChevronRight, Database, ListChecks, MessageCircle, Search, ShieldCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaqSection } from "@/components/marketing/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNITY_SCOPE, DISCORD_INVITE_URL } from "@/config/community";
import { getManualReviewPackage } from "@/config/manual-review";
import { mediaAssets } from "@/config/media";
import { STRIPE_CATALOG } from "@/config/pricing";
import { createMetadata, organizationJsonLd, websiteSearchJsonLd } from "@/config/seo";
import { formatUsd } from "@/lib/utils";
import { getHomeStatsCached, listCityPagesCached, listIndustryPagesCached } from "@/server/suppliers";

export const revalidate = 604800;

export const metadata = createMetadata({
  title: "Free China Exhibitor Database and Sourcing Resources",
  description:
    "Search about 20,000 China exhibitor records for free, read sourcing guides, and ask sourcing questions in our Discord community. Human supplier research is available when you need it.",
});

const identityPackage = getManualReviewPackage("IDENTITY_SINGLE");
const decisionPackage = getManualReviewPackage("DECISION_SINGLE");
const decisionBundlePackage = getManualReviewPackage("DECISION_BUNDLE");

export default async function HomePage() {
  const [stats, industries, cities] = await Promise.all([
    getHomeStatsCached().catch(() => ({ supplierCount: 0, industryCount: 0, provinceCount: 0 })),
    listIndustryPagesCached(8).catch(() => []),
    listCityPagesCached(8).catch(() => []),
  ]);

  const orgSchema = organizationJsonLd();
  const searchSchema = websiteSearchJsonLd();

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 py-20 text-white lg:py-28">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="container-page relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-1 text-sm text-teal-300 font-semibold tracking-wide w-fit">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Free China sourcing resources</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
              Free China Company Database: Search 20,000+ Exhibitor Records
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
              Search and filter Chinese exporters by product, industry, province, city and company type completely free — no
              sign-up, no paywall. Ask sourcing questions in our Discord community anytime.
            </p>

            {/* Direct Free Database Search Box */}
            <form action="/database" method="get" className="w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-xl">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search products, company names, or cities (e.g. Luggage, LED, Ningbo)..."
                    className="h-11 w-full rounded-lg bg-slate-950/70 pl-10 pr-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-500 px-5 text-sm font-bold text-slate-950 hover:bg-teal-400 transition-colors cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  Search Free
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Popular:</span>
                {["Hardware", "Home Textiles", "Kitchen & Tableware", "Lighting Products", "Bags & Luggage"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/database?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-slate-300 hover:border-teal-500/60 hover:text-teal-300 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </form>

            <div className="flex flex-wrap gap-3 pt-1">
              <ButtonLink href="/database" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all duration-300">
                Open Full Free Database <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-600 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Join Discord
              </a>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md p-6 shadow-2xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-3xl font-bold text-white tracking-tight">{(stats.supplierCount || 20291).toLocaleString("en-US")}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Exhibitor records</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-3xl font-bold text-white tracking-tight">{(stats.industryCount || 54).toLocaleString("en-US")}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Industries</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-teal-950/20 border border-teal-800/30 p-3.5 text-xs leading-normal text-teal-300/90 flex items-start space-x-2">
              <ShieldCheck className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
              <span>
                Company-level information only. Contact persons, phone numbers and personal emails are never published.
                Records come from exhibitor registry data and are not individually verified, so confirm any company
                before you pay.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Discord community */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Community</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Ask your sourcing questions on Discord</h2>
            <p className="text-slate-600 leading-relaxed">
              Stuck on a field, a supplier answer, or what to ask before paying a deposit? Ask in the community for free.
              When you need hands-on research, our human services take over.
            </p>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-md bg-teal-600 px-4 text-sm font-semibold !text-white hover:bg-teal-700 transition-colors"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Join the Discord community
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border border-teal-200 bg-teal-50/40">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-950">Free in the community</h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                  {COMMUNITY_SCOPE.free.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-slate-50">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-950">Paid human services</h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                  {COMMUNITY_SCOPE.paid.map((item) => (
                    <li key={item} className="flex gap-2">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Free resources */}
      <section className="container-page py-16 lg:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">Everything you need to start researching</h2>
          <p className="mt-3 text-lg text-slate-600">All of this is free to use.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <ResourceCard icon={<Database className="h-6 w-6" />} title="Company database" text="Filter exhibitor records by industry, province, city, product keywords, company size and type." href="/database" cta="Search companies" />
          <ResourceCard icon={<ListChecks className="h-6 w-6" />} title="Industries and cities" text="Browse industry and city pages to see where suppliers cluster and what they make." href="/industries" cta="Browse industries" />
          <ResourceCard icon={<BookOpen className="h-6 w-6" />} title="Sourcing guides" text="Practical articles on finding, checking and working with Chinese suppliers." href="/blog" cta="Read the guides" />
        </div>
      </section>

      {/* Directory browser */}
      <section className="container-page pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <DirectoryBlock title="Browse by Industry Category" href="/industries" image={mediaAssets.directoryIndustryMatrix} items={industries.map((item) => ({ label: item.industryName, count: item.supplierCount, href: `/industries/${item.slug}` }))} />
          <DirectoryBlock title="Browse by Sourcing City" href="/cities" image={mediaAssets.directoryCityHeatmap} items={cities.map((item) => ({ label: [item.city, item.province].filter(Boolean).join(", "), count: item.supplierCount, href: `/cities/${item.slug}` }))} />
        </div>
      </section>

      {/* Human services */}
      <section className="bg-white border-y border-slate-200 py-16 lg:py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Human services</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 mt-2">When you need someone to do the research</h2>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Prices below are references. Tell us what you need, we confirm scope and price with you, and you only pay after that.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <ServiceCard title={identityPackage.name} price={formatUsd(identityPackage.amountUsdCents)} text="Desk research on one supplier: registration identity, website and store consistency, and an obvious-risk screen." />
            <ServiceCard title={decisionPackage.name} price={formatUsd(decisionPackage.amountUsdCents)} text="A deeper review of one supplier with ownership, legal-risk interpretation, operating signals and buyer advice." />
            <ServiceCard title={decisionBundlePackage.name} price={formatUsd(decisionBundlePackage.amountUsdCents)} text="Compare up to three supplier candidates with full Buyer Decision Reviews before sampling or payment." />
            <ServiceCard title="Custom Supplier Shortlist" price={formatUsd(STRIPE_CATALOG.customShortlist.amountUsdCents)} text="Candidate suppliers matched to your product, region and requirements, with a buyer checklist." />
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/pricing#human-review" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Request a human service <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-16">
        <FaqSection
          title="Frequently Asked Questions"
          items={[
            {
              question: "Is the company database really free?",
              answer: "Yes. You can search, filter and open company profiles without signing up. CSV downloads of the database are not offered to visitors.",
            },
            {
              question: "Are these companies verified factories?",
              answer: "No. The records are compiled from exhibitor registry data and have not been individually verified, and a listing does not mean the company is a factory. Always confirm company identity before samples or payment, or ask us for a human review.",
            },
            {
              question: "Do you publish contact names, phone numbers or emails?",
              answer: "No. Contact persons, phone numbers and personal emails are never published on this site.",
            },
            {
              question: "What can I ask in Discord, and what costs money?",
              answer: "Simple questions about fields, the sourcing process and what to check next are free. Research on a specific company, supplier searching and comparisons are paid human services.",
            },
          ]}
        />
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-slate-950 to-teal-950 text-white py-16 border-t border-slate-800">
        <div className="container-page text-center flex flex-col items-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Start with the free database</h2>
          <p className="max-w-xl text-slate-300 text-sm md:text-base leading-relaxed">
            Search companies, read our sourcing guides, and bring your questions to the community.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <ButtonLink href="/database" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-lg">
              Search Companies Free
            </ButtonLink>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-600 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Join Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResourceCard({ icon, title, text, href, cta }: { icon: React.ReactNode; title: string; text: string; href: string; cta: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">{icon}</div>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
      <Link href={href} className="inline-flex items-center text-xs font-bold text-teal-600 mt-4 group-hover:text-teal-700">
        {cta} <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function ServiceCard({ title, price, text }: { title: string; price: string; text: string }) {
  return (
    <Card className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-base font-extrabold text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6 pt-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">From</div>
        <div className="text-3xl font-black tracking-tight text-slate-950">{price}</div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{text}</p>
      </CardContent>
    </Card>
  );
}

function DirectoryBlock({ title, href, image, items }: { title: string; href: string; image: string; items: Array<{ label: string; count: number; href: string }> }) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-teal-500/20">
      <div className="relative aspect-[16/9] bg-slate-100">
        <Image src={image} alt={`${title} visual`} fill sizes="(min-width: 1024px) 50vw, 100vw" quality={58} className="object-cover" />
      </div>
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-base font-bold text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid gap-2 mb-4">
          {items.length ? items.map((item) => (
            <div key={item.href} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
              <Link href={item.href} className="text-slate-700 hover:text-teal-600 transition-colors font-medium flex items-center">
                <ChevronRight className="h-3 w-3 text-slate-400 mr-1" />
                {item.label}
              </Link>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-500 font-semibold">{item.count.toLocaleString("en-US")}</span>
            </div>
          )) : <div className="text-sm text-slate-500 italic">Browse list will populate dynamically upon live data sync.</div>}
        </div>
        <ButtonLink href={href} className="w-full justify-center text-xs font-semibold" variant="outline">
          View All
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
