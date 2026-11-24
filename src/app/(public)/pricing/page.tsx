import { Check, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import {
  HumanVerificationComparison,
  HumanVerificationPackages,
  HumanVerificationProcess,
} from "@/components/pricing/human-verification-showcase";
import { InquiryRequestForm } from "@/components/pricing/inquiry-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMUNITY_SCOPE, DISCORD_INVITE_URL } from "@/config/community";
import { createMetadata } from "@/config/seo";

export const metadata = createMetadata({
  title: "Human Supplier Verification Services",
  description:
    "100% buyer-side supplier due diligence in China. Compare our $149 Identity Check, $249 Buyer Decision Review, and $499 3-Supplier Bundle — scope confirmed before payment.",
  path: "/pricing",
});

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; supplier?: string; submitted?: string }>;
}) {
  const params = await searchParams;
  const supplier = (params.supplier || "").slice(0, 200);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Human Services" }]} />

      <section className="container-page pb-20">
        <div className="max-w-4xl mx-auto text-center py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            100% Buyer-Side Independent · Zero Supplier Commissions
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Human Supplier Verification Services
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            The company database and Discord community are free. When you need a human analyst to verify a specific
            Chinese supplier across official GSXT, court, CNCA, and IP registries before samples or payment, choose a
            package below.
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
          <HumanVerificationPackages inPageAnchor />
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
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Request free scope confirmation</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Tell us who you want verified. You pay nothing until we confirm record availability and scope by email.
            </p>
          </div>
          <InquiryRequestForm
            defaultServiceQuery={params.service}
            defaultSupplier={supplier}
            initiallySubmitted={params.submitted === "1"}
            redirectTo="/pricing#human-review"
          />
        </section>

        <div className="mt-16 max-w-4xl mx-auto">
          <FaqSection
            title="Frequently asked questions"
            items={[
              {
                question: "Why is GoCNScout more objective than B2B marketplace 'Verified' badges?",
                answer:
                  "B2B marketplaces charge Chinese suppliers annual membership and ad fees, creating an incentive to promote paying sellers. GoCNScout is 100% buyer-funded: we take zero commissions, zero listing fees, and never notify the supplier when you investigate them.",
              },
              {
                question: "Why is the database free but supplier verification is paid?",
                answer:
                  "Searching aggregated public exhibitor records costs very little. Tracing a specific Chinese legal entity across GSXT, court judgments, CNCA certificate registries, CNIPA patents, and domestic platforms takes a bilingual analyst's time.",
              },
              {
                question: "Do I pay before you confirm what you will check?",
                answer:
                  "No. You send a request first, we confirm exact scope and price by email, and only then do we send a Stripe payment link.",
              },
              {
                question: "Can desk due diligence replace sample testing or an on-site QC inspection?",
                answer:
                  "No — they solve different stages. Desk due diligence ($149-$249) eliminates paper shells, fake certificates, lawsuit defaults, and beneficiary mismatches before you wire a deposit. Once mass production starts, you should still test physical samples and book pre-shipment QC (e.g. SGS/TÜV) for large orders.",
              },
              {
                question: "Do you provide private contact details?",
                answer:
                  "No. We do not publish or sell personal phone numbers, private emails, or personal contact names.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
