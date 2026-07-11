import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { createMetadata } from "@/config/seo";
import { absoluteUrl } from "@/lib/utils";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

export const metadata = createMetadata({
  title: "Vetting Suppliers from China: The Complete Step-by-Step Guide",
  description: "A practical series on how to vet Chinese suppliers before you pay — covering company name history, registration dates, capital, legal records, and 20+ more verification signals.",
  path: "/blog/vetting-suppliers-china",
});

const SERIES_JSONLD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Vetting Suppliers from China: The Complete Step-by-Step Guide",
  description: "A step-by-step series covering every signal importers should check before wiring money to a Chinese supplier.",
  url: absoluteUrl("/blog/vetting-suppliers-china"),
  publisher: {
    "@type": "Organization",
    name: "gocnscout",
    url: absoluteUrl("/"),
  },
};

// All planned articles in this series — slug="" means not published yet
const PLANNED_SERIES = [
  {
    slug: "verify-china-business-license",
    title: "How to Verify a China Business License Online (Step-by-Step)",
    excerpt: "The exact fields to check on a Chinese business license — and how to cross-reference them against the SAMR national registry in under 5 minutes.",
  },
  {
    slug: "",
    title: "What Chinese Company Name Changes Really Tell You",
    excerpt: "A supplier that changed its name twice in 3 years is waving a red flag. Here's how to find a company's full name history and what each change means.",
  },
  {
    slug: "",
    title: "How to Use Registration Date to Judge Supplier Reliability",
    excerpt: "A factory registered 6 months ago quoting 50,000 MOQ? Learn how to interpret registration age and what counts as a warning sign for your order size.",
  },
  {
    slug: "",
    title: "Registered Capital in China: What the Number Actually Means",
    excerpt: "China switched to a subscribed-capital system — meaning a ¥100M registered capital company might have zero actual cash. We break down what to look for.",
  },
  {
    slug: "",
    title: "How to Check a Chinese Supplier's Legal Representative History",
    excerpt: "Multiple legal rep changes in quick succession is a serious red flag. Here's how to pull this record from public databases — for free.",
  },
  {
    slug: "",
    title: "Business Scope Mismatch: When Your 'Factory' Is Actually a Trading Company",
    excerpt: "If a supplier claims to manufacture but their business scope says 'trading', you're likely paying a middleman's markup. How to spot the difference.",
  },
  {
    slug: "",
    title: "How to Find a Chinese Company's Court & Litigation Records",
    excerpt: "Public court records in China are searchable. If your supplier has active lawsuits or unpaid judgments, you need to know before transferring funds.",
  },
  {
    slug: "",
    title: "China's Enterprise Credit Score Explained for Importers",
    excerpt: "Every Chinese company has a Social Credit rating. Here's how to find it, what the color codes mean, and when a 'yellow' or 'red' listing should stop your order.",
  },
  {
    slug: "",
    title: "How to Verify a Chinese Supplier's Export License",
    excerpt: "Not every Chinese company is legally allowed to export. Verifying a supplier's export license takes 2 minutes and can save you a customs disaster.",
  },
  {
    slug: "",
    title: "How to Verify a Chinese Bank Account Before You Wire Money",
    excerpt: "Bank account fraud is one of the most common China sourcing scams. The 3 checks you must do before every T/T payment.",
  },
  {
    slug: "",
    title: "Reading a Chinese Company's Annual Report Filings",
    excerpt: "Every Chinese company must file annual reports. Missing filings or anomalies in reported employee counts are often the first sign of trouble.",
  },
  {
    slug: "",
    title: "How to Tell If a Chinese Supplier Address Is Real",
    excerpt: "Dozens of suppliers sharing the same address is a classic sign of a trading shell. How to cross-check addresses using satellite maps and registration data.",
  },
  {
    slug: "",
    title: "Red Flags in a Chinese Supplier's Shareholder Structure",
    excerpt: "One-person companies and round-tripping ownership structures are worth scrutinizing. What shareholder patterns should make you ask more questions.",
  },
  {
    slug: "",
    title: "How to Check if Your Chinese Supplier Has Production Equipment",
    excerpt: "Factory audits take weeks. But you can get a quick sense of real production capacity using industrial asset registrations and satellite imagery — before you fly.",
  },
  {
    slug: "",
    title: "How to Use Customs Data to Verify a Chinese Supplier's Export History",
    excerpt: "Real exporters leave traces in trade data. How to use tools like ImportGenius or Panjiva to confirm your supplier actually ships what they claim.",
  },
];

export default async function VettingSuppliersChinaPage() {
  // Pull published articles from this series by tag
  const publishedPosts = await prisma.blogPost
    .findMany({
      where: { status: "PUBLISHED", tags: { hasSome: ["vetting-series", "supplier-vetting"] } },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true, excerpt: true, publishedAt: true },
    })
    .catch(() => []);

  // Merge: use DB data for published posts, fall back to planned list
  const publishedSlugs = new Set(publishedPosts.map((p) => p.slug));
  const series = PLANNED_SERIES.map((item) => {
    const live = item.slug ? publishedPosts.find((p) => p.slug === item.slug) : null;
    return {
      ...item,
      published: !!(live || (item.slug && publishedSlugs.has(item.slug))),
    };
  });

  const publishedCount = series.filter((s) => s.published).length;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERIES_JSONLD) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: "Vetting Suppliers from China" },
        ]}
      />

      <main>
        {/* ── Hero ── */}
        <section className="bg-slate-950 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Series · {publishedCount} of {series.length} published
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Vetting Suppliers from China
            </h1>
            <p className="mt-2 text-2xl font-semibold text-teal-300">
              The Complete Step-by-Step Guide
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              Before you wire money to a Chinese supplier, there are{" "}
              <strong className="text-white">20+ public signals</strong> you can check — for free — in under an hour. This series walks through every one of them: from company name history and registration dates to court records, export licenses, and bank account verification.
            </p>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-800 pt-8">
              {[
                { label: "Verification Signals", value: "20+" },
                { label: "Articles in Series", value: String(series.length) },
                { label: "Avg. Read Time", value: "5 min" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-extrabold text-teal-400">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What you'll learn ── */}
        <section className="border-b border-slate-100 bg-teal-50 px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-widest text-teal-700">
              What you&apos;ll be able to do after this series
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Spot a shell company from its registration data in 2 minutes",
                "Decode name changes and ownership history red flags",
                "Find court judgments, tax violations and blacklist status",
                "Verify an export license before placing any order",
                "Cross-check bank accounts to prevent wire fraud",
                "Assess real production capacity without flying to China",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                  <CheckCircle size={16} className="mt-0.5 shrink-0 text-teal-600" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Article Series Index ── */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950">
                <BookOpen size={20} className="mr-2 inline-block text-teal-600" />
                Series Index
              </h2>
              <Link href="/blog" className="text-sm font-semibold text-teal-700 hover:underline">
                Browse all articles →
              </Link>
            </div>

            <ol className="space-y-3">
              {series.map((article, idx) => (
                <li key={idx}>
                  {article.published && article.slug ? (
                    <Link
                      href={`/blog/${article.slug}`}
                      className="group flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-950 group-hover:text-teal-700">
                          {article.title}
                        </p>
                        {article.excerpt && (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{article.excerpt}</p>
                        )}
                      </div>
                      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-teal-500" />
                    </Link>
                  ) : (
                    <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 opacity-70">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-600">{article.title}</p>
                        {article.excerpt && (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-400">{article.excerpt}</p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 shrink-0">
                        <Clock size={10} /> Coming Soon
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-slate-100 bg-slate-950 px-4 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white">
              Want the full picture on any Chinese supplier?
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              GoCNScout gives you instant access to China&apos;s public supplier registry — registration history, business scope, shareholders and more — without needing to read Chinese.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/database"
                className="inline-flex items-center gap-2 rounded-md bg-teal-500 px-6 py-3 text-sm font-bold text-white hover:bg-teal-400"
              >
                Search Supplier Database <ArrowRight size={16} />
              </Link>
              <Link
                href="/blog"
                className="text-sm font-semibold text-slate-400 hover:text-white"
              >
                Read more sourcing guides →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
