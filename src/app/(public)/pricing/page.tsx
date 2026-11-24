import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import {
  HumanVerificationComparison,
  HumanVerificationPackages,
  HumanVerificationProcess,
} from "@/components/pricing/human-verification-showcase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { COMMUNITY_SCOPE, DISCORD_INVITE_URL } from "@/config/community";
import { getManualReviewPackage } from "@/config/manual-review";
import { createMetadata } from "@/config/seo";
import { formatUsd } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Human Supplier Verification Services",
  description:
    "The company database and Discord community are free. When you need hands-on research on a specific supplier, compare our $149 Identity Check, $249 Buyer Decision Review, and $499 3-Supplier Bundle.",
  path: "/pricing",
});

const identity = getManualReviewPackage("IDENTITY_SINGLE");
const decision = getManualReviewPackage("DECISION_SINGLE");
const decisionBundle = getManualReviewPackage("DECISION_BUNDLE");

const SERVICE_OPTIONS = [
  { value: "HUMAN_REVIEW_IDENTITY_SINGLE", query: "IDENTITY_SINGLE", label: `Supplier Identity Check (from ${formatUsd(identity.amountUsdCents)})` },
  { value: "HUMAN_REVIEW_DECISION_SINGLE", query: "DECISION_SINGLE", label: `Buyer Decision Review (from ${formatUsd(decision.amountUsdCents)})` },
  { value: "HUMAN_REVIEW_DECISION_BUNDLE", query: "DECISION_BUNDLE", label: `Buyer Decision Review - 3 Suppliers (from ${formatUsd(decisionBundle.amountUsdCents)})` },
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">Human Supplier Verification Services</h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            The company database and Discord community are free. When you need a human analyst to research a specific
            Chinese supplier before samples or payment, choose a review package below.
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
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />Industry and city directories</li>
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

        {/* Services with full expanded details */}
        <section className="mt-16">
          <HumanVerificationPackages />
        </section>

        {/* $149 vs $249 Feature Comparison Table */}
        <section className="mt-16">
          <HumanVerificationComparison />
        </section>

        {/* How it works */}
        <section className="mt-16">
          <HumanVerificationProcess />
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
                answer: "Searching public records costs us very little. Researching a specific company and interpreting ownership, legal and operating risks takes a person's time, so that part is paid.",
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
