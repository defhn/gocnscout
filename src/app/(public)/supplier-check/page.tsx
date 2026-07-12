import { AnalysisForm } from "@/components/supplier-check/analysis-form";
import { createMetadata } from "@/config/seo";

export const metadata = createMetadata({
  title: "Free Alibaba Supplier Checker | Verify Chinese Suppliers Before You Pay",
  description:
    "Paste an Alibaba product page, supplier store, or company website. Get a free public-source supplier screening report before contact, samples, or payment.",
  path: "/supplier-check",
});

const supportedUrls = [
  {
    title: "Alibaba product pages",
    text: "Paste the product page your buyer found. We keep the product context, then look for the supplier storefront behind it.",
  },
  {
    title: "Alibaba supplier stores",
    text: "Use a storefront, company profile, product list, rating page, or other public supplier subpage.",
  },
  {
    title: "Company websites",
    text: "Paste a homepage or product page from a supplier website. We start from the homepage and review key public pages.",
  },
];

const freeScanChecks = [
  "Supplier homepage or storefront identity",
  "Alibaba ratings page when reachable",
  "TrustPass / company profile summary when reachable",
  "Product list and product-category signals",
  "Website homepage plus important public pages",
  "Company-name, product-line, and public-footprint consistency",
  "Missing evidence that should be checked manually",
];

const limitations = [
  "No Alibaba login, contact unlocking, CAPTCHA bypass, or private-data collection",
  "No guarantee that a supplier is safe, compliant, or suitable for payment",
  "No certificate authenticity verification or factory audit",
  "No legal opinion and no replacement for sample testing or purchase-contract review",
];

const useCases = [
  {
    title: "You found a product on Alibaba",
    text: "Most buyers paste product pages, not company homepages. The tool is built for that: it keeps the product context and looks for the supplier store behind the listing.",
  },
  {
    title: "You need a quick red-flag screen",
    text: "Use the free report to spot missing ratings, weak public footprints, broad product categories, or gaps that should be checked before you spend time with the supplier.",
  },
  {
    title: "You are close to samples or payment",
    text: "If the order matters, upgrade to manual review for identity fields, legal-risk interpretation, operating capability, IP / brand signals, and buyer questions.",
  },
];

const processSteps = [
  {
    step: "1",
    title: "Paste the supplier-related URL",
    text: "Use an Alibaba product page, supplier store, company profile, official homepage, or official product page.",
  },
  {
    step: "2",
    title: "We expand to supplier-level pages",
    text: "For product pages, we identify the supplier homepage or store first. For websites, we review the homepage and key public navigation pages.",
  },
  {
    step: "3",
    title: "Read the first-pass screening report",
    text: "You get public-source signals, missing evidence, buyer questions, next steps, and a clear path to human review when the decision needs judgment.",
  },
];

const comparisonRows = [
  ["Free AI scan", "Public-source first pass from reachable pages", "Quick screening before spending time"],
  [
    "$149 Identity Check",
    "Company identity, Alibaba / website consistency, obvious-risk screen, website footprint",
    "Before first serious contact or document request",
  ],
  [
    "$249 Decision Review",
    "Everything in Identity Check plus ownership, legal-risk interpretation, operating capability, IP / brand signals, Xiaohongshu / Douyin / Zhihu, and buyer recommendation",
    "Before samples, negotiation, prepayment, or shortlist decisions",
  ],
];

const faqs = [
  {
    question: "Can I paste an Alibaba product page?",
    answer:
      "Yes. That is the most common use case. The scan keeps the product context, then tries to identify the supplier storefront and supplier-level pages instead of only analyzing the product listing.",
  },
  {
    question: "Does this verify that an Alibaba supplier is legitimate?",
    answer:
      "The free scan is a public-source screening report, not a final legitimacy guarantee. It helps you see what is visible, what is missing, and what should be verified manually before samples or payment.",
  },
  {
    question: "What does the free report check?",
    answer:
      "It checks reachable Alibaba and website signals such as storefront identity, ratings when reachable, TrustPass or company profile summary when reachable, product-list signals, website pages, consistency clues, missing evidence, buyer questions, and next steps.",
  },
  {
    question: "What is the difference between the free scan and manual review?",
    answer:
      "The free scan summarizes public pages automatically. Manual review adds human judgment across company identity fields, Alibaba / website consistency, risk records, operating capability, IP / brand signals, and buyer-specific decision questions.",
  },
  {
    question: "Do you bypass Alibaba login or CAPTCHA?",
    answer:
      "No. The tool only works with publicly reachable pages. It does not bypass login, unlock private contacts, scrape protected areas, or collect private personal data.",
  },
  {
    question: "Can this tell whether a supplier is a factory or trading company?",
    answer:
      "The free scan can show product-line and public-footprint clues. The $249 Buyer Decision Review is better for judging factory, brand owner, group company, or trading-company signals because that requires cross-source human interpretation.",
  },
];

export default function SupplierCheckPage({
  searchParams,
}: {
  searchParams?: Promise<{ url?: string }>;
}) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Free Alibaba supplier checker</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
              Verify a Chinese supplier before you contact, sample, or pay
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Paste an Alibaba product page, supplier store, or company website. We identify the supplier-level pages,
              collect public signals, and show what still needs manual verification before you make a buying decision.
            </p>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SupplierCheckFormLoader searchParams={searchParams} />
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Best for Amazon sellers, Shopify sellers, sourcing agents, importers, and overseas buyers checking China
                suppliers.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
            <h2 className="text-sm font-bold text-slate-950">What you get from the free scan</h2>
            <ul className="mt-4 space-y-2 text-xs leading-5 text-slate-700">
              {freeScanChecks.slice(0, 5).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-slate-600">
              It is a first-pass screen, not a guarantee. Use manual review when the order size, product risk, or payment
              decision needs human judgment.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {supportedUrls.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>

        <section className="mt-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">What the report helps you understand</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              A supplier can exist and still be the wrong choice for your order
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Alibaba badges, product photos, and a business license are useful, but they do not answer every buyer
              question. You still need to know whether the company identity matches the store, whether the product category
              makes sense, what evidence is missing, and what to ask before payment.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-950">What the free supplier scan checks</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              {freeScanChecks.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-bold text-amber-950">What it does not verify</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-amber-900">
              {limitations.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {processSteps.map((item) => (
              <div key={item.step} className="rounded-lg border border-slate-100 bg-slate-50 p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Free scan vs human review</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              Use the free report to screen. Use manual review when the decision has money behind it.
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Option</th>
                  <th className="px-5 py-4">What it covers</th>
                  <th className="px-5 py-4">Best used when</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonRows.map(([option, covers, bestFor]) => (
                  <tr key={option}>
                    <td className="px-5 py-4 font-bold text-slate-950">{option}</td>
                    <td className="px-5 py-4 leading-6 text-slate-600">{covers}</td>
                    <td className="px-5 py-4 leading-6 text-slate-600">{bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.question} className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-950">{item.question}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 rounded-xl border border-teal-200 bg-teal-50 p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
                Check your supplier before the conversation gets expensive
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Paste the Alibaba listing or supplier website you are evaluating. The first-pass report is free and helps
                you decide what to ask next.
              </p>
            </div>
            <div className="rounded-lg border border-teal-200 bg-white p-4">
              <SupplierCheckFormLoader searchParams={searchParams} />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

async function SupplierCheckFormLoader({
  searchParams,
}: {
  searchParams?: Promise<{ url?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  return <AnalysisForm initialUrl={params.url || ""} />;
}
