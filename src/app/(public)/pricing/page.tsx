import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { ButtonLink } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { COMMUNITY_SCOPE, DISCORD_INVITE_URL } from "@/config/community";
import { getManualReviewPackage } from "@/config/manual-review";
import { STRIPE_CATALOG } from "@/config/pricing";
import { createMetadata } from "@/config/seo";
import { formatUsd } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Human Supplier Review and Sourcing Services",
  description:
    "The database, sourcing guides and community are free. When you need hands-on research on a specific supplier or a custom shortlist, request a human service here.",
  path: "/pricing",
});

const identity = getManualReviewPackage("IDENTITY_SINGLE");
const decision = getManualReviewPackage("DECISION_SINGLE");
const decisionBundle = getManualReviewPackage("DECISION_BUNDLE");

const SERVICE_OPTIONS = [
  { value: "HUMAN_REVIEW_IDENTITY_SINGLE", query: "IDENTITY_SINGLE", label: `Supplier Identity Check (from ${formatUsd(identity.amountUsdCents)})` },
  { value: "HUMAN_REVIEW_DECISION_SINGLE", query: "DECISION_SINGLE", label: `Buyer Decision Review (from ${formatUsd(decision.amountUsdCents)})` },
  { value: "HUMAN_REVIEW_DECISION_BUNDLE", query: "DECISION_BUNDLE", label: `Buyer Decision Review - 3 Suppliers (from ${formatUsd(decisionBundle.amountUsdCents)})` },
  { value: "CUSTOM_SHORTLIST", query: "CUSTOM_SHORTLIST", label: `Custom Supplier Shortlist (from ${formatUsd(STRIPE_CATALOG.customShortlist.amountUsdCents)})` },
  { value: "DATA_LICENSE", query: "DATA_LICENSE", label: "Data license enquiry" },
  { value: "OTHER_RESEARCH", query: "OTHER", label: "Something else" },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; supplier?: string; submitted?: string }>;
}) {
  const params = await searchParams;
  const selected = SERVICE_OPTIONS.find((item) => item.query === params.service) ?? SERVICE_OPTIONS[0];
  const supplier = (params.supplier || "").slice(0, 200);
  const defaultMessage = supplier ? `Supplier: ${supplier}\n` : "";

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Human Services" }]} />

      <section className="container-page pb-20">
        <div className="max-w-4xl mx-auto text-center py-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">Human Supplier Review and Sourcing Services</h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            The company database, sourcing guides and Discord community are free. If you need someone to research a specific
            supplier or find candidates for you, we do that as a paid service.
          </p>
        </div>

        {/* Free vs paid */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="border border-teal-200 bg-teal-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Free</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />Company database search and profiles</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />Industry and city pages, sourcing guides</li>
                {COMMUNITY_SCOPE.free.map((item) => (
                  <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />{item} (Discord)</li>
                ))}
              </ul>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-10 items-center rounded-md bg-teal-600 px-4 text-sm font-semibold !text-white hover:bg-teal-700"
              >
                Join Discord
              </a>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Paid human services</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700">
                {COMMUNITY_SCOPE.paid.map((item) => (
                  <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />{item}</li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-slate-500">
                We confirm scope, what we can and cannot check, and the final price with you before any payment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <section className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 text-center">Services and reference prices</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[identity, decision, decisionBundle].map((pkg) => (
              <Card key={pkg.code} className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-extrabold text-slate-950">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">From</div>
                  <div className="text-3xl font-black tracking-tight text-slate-950">{formatUsd(pkg.amountUsdCents)}</div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">{pkg.description}</p>
                  <details className="mt-4 text-xs text-slate-600">
                    <summary className="cursor-pointer font-semibold text-slate-800">What may be checked</summary>
                    <ul className="mt-3 space-y-2">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" /><span>{feature}</span></li>
                      ))}
                    </ul>
                    <p className="mt-3 text-slate-500">Items depend on which public records are available for the company; we tell you what we could not find.</p>
                  </details>
                </CardContent>
              </Card>
            ))}
            <Card className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-extrabold text-slate-950">Custom Supplier Shortlist</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">From</div>
                <div className="text-3xl font-black tracking-tight text-slate-950">{formatUsd(STRIPE_CATALOG.customShortlist.amountUsdCents)}</div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  Candidate suppliers matched to your product, region and requirements, with a buyer verification checklist. A research shortlist, not a recommendation or guarantee.
                </p>
                <ButtonLink href="/custom-shortlist" variant="outline" className="mt-4 w-full text-xs font-semibold">Details</ButtonLink>
              </CardContent>
            </Card>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Need a spreadsheet export or a licensed dataset?{" "}
            <a href="/data-license" className="font-semibold text-teal-700 underline">Data license enquiries</a> start at {formatUsd(STRIPE_CATALOG.dataLicenseAnnualUsdCents)} per year.
          </p>
        </section>

        {/* How it works */}
        <section className="mt-16 max-w-5xl mx-auto grid gap-4 md:grid-cols-4">
          {[
            ["1. Tell us what you need", "Fill in the form below with the supplier or product."],
            ["2. We confirm scope", "We reply with what we can check, the price and the timeline."],
            ["3. You pay", "We send a secure Stripe payment link once you agree."],
            ["4. We deliver", "You receive the findings and what is still missing."],
          ].map(([title, text]) => (
            <Card key={title}>
              <CardContent>
                <h3 className="text-sm font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Request form */}
        <section id="human-review" className="mt-16 max-w-2xl mx-auto scroll-mt-24">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 text-center">Request a human service</h2>
          {params.submitted === "1" && (
            <p className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
              Thanks, your request was received. We will contact you by email to confirm scope and price.
            </p>
          )}
          <form action="/api/inquiries" method="post" className="mt-6 grid gap-3">
            <input type="hidden" name="redirectTo" value="/pricing#human-review" />
            <label className="grid gap-1 text-sm text-slate-700">
              Service
              <select
                name="type"
                defaultValue={selected.value}
                className="h-10 rounded-md border border-border bg-white px-3 text-sm text-slate-900"
              >
                {SERVICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <Input name="name" placeholder="Your name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="companyName" placeholder="Your company (optional)" />
            <Textarea
              name="message"
              defaultValue={defaultMessage}
              placeholder="Supplier name or website, product, order size, and what you want checked"
              required
            />
            {/* 蜜罐字段:真人看不到,机器人会填写 */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <Button type="submit">Send request</Button>
          </form>
        </section>

        <div className="mt-16 max-w-4xl mx-auto">
          <FaqSection
            title="Frequently asked questions"
            items={[
              {
                question: "Why is the database free but this is paid?",
                answer: "Searching public records costs us very little. Researching a specific company, finding candidates or comparing suppliers takes a person's time, so that part is paid.",
              },
              {
                question: "Do I pay before you confirm what you will check?",
                answer: "No. You send a request, we confirm scope and price by email, and only then do we send a payment link.",
              },
              {
                question: "Can you guarantee a supplier is safe?",
                answer: "No. Our work is desk research on public information. It helps you decide what to ask and what to check next, but it does not guarantee any supplier or replace sample testing or contract review.",
              },
              {
                question: "Do you provide private contact details?",
                answer: "No. We do not provide or sell personal phone numbers, personal emails or contact names.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
