import { AnalysisForm } from "@/components/supplier-check/analysis-form";
import { createMetadata, faqJsonLd, breadcrumbJsonLd } from "@/config/seo";

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

import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Link2, 
  ShieldAlert, 
  Check, 
  X,
  FileText 
} from "lucide-react";

export default function SupplierCheckPage({
  searchParams,
}: {
  searchParams?: Promise<{ url?: string }>;
}) {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Alibaba Supplier Checker",
    "description": "Paste an Alibaba product page, supplier store, or company website. Get a free public-source supplier screening report before contact, samples, or payment.",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = faqJsonLd(faqs);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Supplier Checker", href: "/supplier-check" },
  ]);

  return (
    <>
      {/* Search Engine Rich Snippet Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Supplier Checker" }]} />

      <section className="relative overflow-hidden py-10 md:py-16">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/30 via-slate-50/50 to-white pointer-events-none -z-10" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />


      <div className="container-page mx-auto max-w-5xl">
        {/* Full-width Centered Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200/50 px-3.5 py-1 text-xs font-bold text-teal-800 tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
            <span>Free AI Supplier Checker</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:leading-[3.75rem] text-balance">
            Verify a Chinese supplier before you <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">contact, sample, or pay</span>
          </h1>
          
          <p className="text-base md:text-lg leading-relaxed text-slate-600 max-w-3xl mx-auto">
            Paste an Alibaba product page, supplier store, or company website. We identify the supplier-level pages,
            collect public signals, and show what still needs manual verification before you make a buying decision.
          </p>
          
          <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur-xs p-6 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all duration-300 max-w-3xl mx-auto text-left">
            <SupplierCheckFormLoader searchParams={searchParams} />
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-505 justify-center">
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-teal-600" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-teal-600" />
                Instant report generation
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-teal-600" />
                Alibaba & standalone websites
              </span>
            </div>
          </div>
        </div>

        {/* What You Get Section - Moved Below Hero */}
        <div className="mt-20 rounded-2xl border border-teal-100 bg-linear-to-b from-teal-50/50 to-teal-50/10 p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-teal-200/50 px-3 py-1 text-[10px] font-extrabold uppercase text-teal-855 tracking-wider">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>Scope of AI Scanning</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 animate-in fade-in duration-300">What you get from the free scan</h2>
              <p className="text-xs leading-relaxed text-slate-655">
                Our crawler extracts publicly accessible parameters to highlight basic status and alert you to immediate risks.
              </p>
              <p className="text-xs leading-relaxed text-slate-550 italic">
                It is a first-pass screen, not a guarantee. Use manual review when the order size, product risk, or payment decision needs human judgment.
              </p>
            </div>
            <div className="lg:col-span-7">
              <ul className="grid gap-3 sm:grid-cols-2 text-xs text-slate-700 leading-relaxed">
                {freeScanChecks.slice(0, 6).map((item) => (
                  <li key={item} className="flex gap-2.5 items-start bg-white/70 backdrop-blur-xs p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Reports Preview Section */}
        <section className="mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-955">See what a screening report looks like</h2>
            <p className="mt-2 text-sm text-slate-600">No URL ready? Explore our pre-analyzed supplier screening samples to understand the audit depth.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-150 bg-white p-5 hover:border-teal-300 hover:shadow-xs transition-all group flex flex-col justify-between">
              <div>
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700 uppercase tracking-wide">Consumer Electronics</span>
                <h3 className="text-sm font-bold text-slate-950 mt-3 group-hover:text-teal-700 transition-colors">Shenzhen Smart-Tech Co., Ltd.</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">A typical trading-company profile: broad product listings but highly localized registry scope.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold group-hover:underline">
                <span>View Sample Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
            
            <div className="rounded-2xl border border-slate-150 bg-white p-5 hover:border-teal-300 hover:shadow-xs transition-all group flex flex-col justify-between">
              <div>
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700 uppercase tracking-wide">Industrial Hardware</span>
                <h3 className="text-sm font-bold text-slate-950 mt-3 group-hover:text-teal-700 transition-colors">Ningbo Precision Forging Factory</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">A strong manufacturer profile: single-category product consistency and matching unified social credit code.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold group-hover:underline">
                <span>View Sample Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
            
            <div className="rounded-2xl border border-slate-150 bg-white p-5 hover:border-teal-300 hover:shadow-xs transition-all group flex flex-col justify-between">
              <div>
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700 uppercase tracking-wide">Household Items</span>
                <h3 className="text-sm font-bold text-slate-950 mt-3 group-hover:text-teal-700 transition-colors">Yiwu Commodity Trading Co., Ltd.</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">High-risk warning sample: mismatched registration status, newly established license with broad scope.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold group-hover:underline">
                <span>View Sample Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </section>


        {/* Supported Sources */}
        <div className="mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Paste any of these page types</h2>
            <p className="mt-2 text-sm text-slate-600">The scanner accepts multiple URL structures and maps them to the corresponding manufacturer.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {supportedUrls.map((item, idx) => (
              <div key={item.title} className="group rounded-2xl border border-slate-150 bg-white p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    {idx === 0 ? <Link2 className="h-5 w-5" /> : idx === 1 ? <Building2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Informative Value Section */}
        <section className="mt-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Strategic Vendor Sourcing</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">
                A supplier can exist and still be the wrong choice for your order
              </h2>
              <p className="text-sm leading-relaxed text-slate-650 animate-in">
                Alibaba badges, product photos, and a business license are useful, but they do not answer every buyer
                question. You still need to know whether the company identity matches the store, whether the product category
                makes sense, what evidence is missing, and what to ask before payment.
              </p>
            </div>
            
            <div className="lg:col-span-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {useCases.map((item, index) => (
                <div key={item.title} className="rounded-xl border border-slate-150 bg-white p-5 hover:border-teal-200 transition-colors">
                  <div className="flex gap-4 items-start">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Checks and Exclusions Split Cards */}
        <section className="mt-24 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              Why upgrade to manual verification?
            </h2>
            <p className="text-xs text-slate-500 mb-4">When a decision has financial or operational weight, human-in-the-loop checks provide verification parameters:</p>
            <ul className="space-y-3.5 text-xs leading-relaxed text-slate-750">
              <li className="flex gap-2.5 items-start">
                <Check className="h-4 w-4 shrink-0 text-teal-650 bg-teal-50 rounded-full p-0.5 mt-0.5" />
                <span>Verification of company registration details directly inside mainland China registry databases.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <Check className="h-4 w-4 shrink-0 text-teal-650 bg-teal-50 rounded-full p-0.5 mt-0.5" />
                <span>Analysis of domestic court disputes, administrative violations, and business anomaly flags.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <Check className="h-4 w-4 shrink-0 text-teal-650 bg-teal-50 rounded-full p-0.5 mt-0.5" />
                <span>Evaluation of the supplier's real business scale (insured employee counts, intellectual property ownership).</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <Check className="h-4 w-4 shrink-0 text-teal-650 bg-teal-50 rounded-full p-0.5 mt-0.5" />
                <span>Cross-platform social media footprints (Xiaohongshu, Zhihu, Douyin) manually checked by sourcing experts.</span>
              </li>
            </ul>
          </div>
          
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-amber-955 flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              What the free scan cannot verify
            </h2>
            <ul className="space-y-3 text-xs leading-relaxed text-amber-900">
              {limitations.map((item) => (
                <li key={item} className="flex gap-2.5 items-start">
                  <X className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="mt-24 rounded-2xl border border-slate-150 bg-white p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">How it works</h2>
            <p className="mt-2 text-sm text-slate-600">Three automated steps to compile a full public-source profile.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {processSteps.map((item) => (
              <div key={item.step} className="relative rounded-xl border border-slate-50 bg-slate-50/60 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-md shadow-teal-500/10">
                  {item.step}
                </div>
                <h3 className="mt-5 text-sm font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top 5 Red Flags Checklist */}
        <section className="mt-24 rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-750">Immediate Risk Assessment</span>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 leading-tight">5 Sourcing Red Flags the AI Scan Evaluates</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Most import risk stems from gaps in basic company credentials. The free screening tool analyzes public footprint parameters to immediately identify discrepancies:
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-teal-600 mr-1.5" />
                  100% Automated Audit
                </span>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex gap-4 items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-750 text-xs font-black mt-0.5 border border-red-200">1</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">Registration Status Discrepancies</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Checking whether the official Chinese business status is active or if the company has been dissolved, revoked, or placed on abnormality lists.</p>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex gap-4 items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-750 text-xs font-black mt-0.5 border border-red-200">2</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">Mismatched English and Chinese Registries</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Verifying if the English store name, logo, or declared company name aligns logically with the Chinese legal registration record.</p>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex gap-4 items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-750 text-xs font-black mt-0.5 border border-red-200">3</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">Unrelated Business Scope (Broad Operations)</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Detecting if a supplier selling high-precision mechanical parts is registered as a commodity trader, or if their official scope covers completely unrelated products.</p>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex gap-4 items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-750 text-xs font-black mt-0.5 border border-red-200">4</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">Absent Official Public Footprints</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Spotting if the supplier lacks an official website, brand registries, corporate emails, or matches domain registrations that are less than 6 months old.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex gap-4 items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-750 text-xs font-black mt-0.5 border border-red-200">5</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">Exhibition and Trade Activity Inconsistencies</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Correlating store claims against database records of physical booths in domestic and global export databases to confirm active trading history.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Free Scan vs Paid Comparison */}
        <section className="mt-24">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Free Scan vs Human Review</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Pick the right verification tier
            </h2>
            <p className="mt-2 text-sm text-slate-600">Use the free report to screen. Upgrade when you need a human report with actual money behind the decision.</p>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="min-w-[760px] w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-[20%]">Option</th>
                  <th className="px-6 py-4 w-[50%]">What it covers</th>
                  <th className="px-6 py-4 w-[30%]">Best used when</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonRows.map(([option, covers, bestFor], idx) => (
                  <tr key={option} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950">{option}</td>
                    <td className="px-6 py-4 leading-relaxed text-slate-600">{covers}</td>
                    <td className="px-6 py-4 leading-relaxed text-slate-600">{bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-24">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-slate-600">Answers to common inquiries regarding the supplier checker capabilities.</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-2xl border border-slate-150 bg-white p-6 hover:shadow-xs transition-shadow">
                <h3 className="text-sm font-bold text-slate-950 flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{item.question}</span>
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 pl-6">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Call to Action Card */}
        <section className="mt-24 rounded-2xl border border-teal-200 bg-linear-to-tr from-teal-50/80 via-teal-50/40 to-emerald-50/40 p-8 shadow-xs relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Check your supplier before the conversation gets expensive
              </h2>
              <p className="text-sm leading-relaxed text-slate-700">
                Paste the Alibaba listing or supplier website you are evaluating. The first-pass report is free and helps
                you decide what to ask next.
              </p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-md">
              <SupplierCheckFormLoader searchParams={searchParams} />
            </div>
          </div>
        </section>
      </div>
    </section>
    </>
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
