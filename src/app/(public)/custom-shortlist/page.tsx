import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { STRIPE_CATALOG } from "@/config/pricing";
import { createMetadata } from "@/config/seo";
import { formatUsd } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Custom Supplier Shortlist",
  description: "Request a custom supplier shortlist based on non-sensitive public supplier profile fields.",
  path: "/custom-shortlist",
});

export default function CustomShortlistPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Custom Shortlist" }]} />
      <section className="container-page grid gap-8 pb-14 lg:grid-cols-[1fr_420px]">
        <div>
          <h1 className="text-4xl font-semibold text-slate-950">Custom supplier shortlist</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Request up to 50 supplier candidates based on product fit, industry, location, public profile fields, and buyer
            verification checks. This is research support, not a private contact list.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {["Product and industry matching", "Province and city notes", "Company profile summaries", "Official website links when publicly available", "Buyer verification checklist", "No private contact fields"].map((item) => (
              <Card key={item}>
                <CardContent>
                  <h2 className="text-base font-semibold text-slate-950">{item}</h2>
                  <h3 className="mt-2 text-sm font-normal text-slate-600">Included in the research workflow.</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Card>
          <CardContent>
            <h2 className="text-2xl font-semibold text-slate-950">{formatUsd(STRIPE_CATALOG.customShortlist.amountUsdCents)}/request</h2>
            <h3 className="mt-3 text-sm font-semibold text-slate-950">Request details</h3>
            <form action="/api/inquiries" method="post" className="mt-4 grid gap-3">
              <input type="hidden" name="type" value="CUSTOM_SHORTLIST" />
              <input type="hidden" name="redirectTo" value="/custom-shortlist" />
              <Input name="name" placeholder="Your name" required />
              <Input name="email" type="email" placeholder="Work email" required />
              <Input name="companyName" placeholder="Company name" />
              <Textarea name="message" placeholder="Target product, industry, country, supplier requirements" required />
              <Button type="submit">Submit shortlist request</Button>
            </form>
          </CardContent>
        </Card>

        <section className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-slate-950">How the shortlist is prepared</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <Process title="1. Requirements" text="You provide target products, industry, region preferences, and screening notes." />
            <Process title="2. Database filtering" text="Candidates are selected from public supplier profile fields and available website links." />
            <Process title="3. Manual review" text="The shortlist is reviewed against your stated criteria and obvious mismatch signals." />
            <Process title="4. Delivery" text="You receive up to 50 candidate profiles and a buyer verification checklist." />
          </div>
        </section>

        <section className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-slate-950">What the request should include</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Card><CardContent><h3 className="text-base font-semibold text-slate-950">Product target</h3><p className="mt-2 text-sm leading-6 text-slate-600">Describe the product, material, use case, and keywords you care about.</p></CardContent></Card>
            <Card><CardContent><h3 className="text-base font-semibold text-slate-950">Supplier preference</h3><p className="mt-2 text-sm leading-6 text-slate-600">Mention preferred region, company size, trade mode, or website requirements.</p></CardContent></Card>
            <Card><CardContent><h3 className="text-base font-semibold text-slate-950">Exclusion rules</h3><p className="mt-2 text-sm leading-6 text-slate-600">List categories, locations, or supplier types you do not want included.</p></CardContent></Card>
          </div>
        </section>

        <section className="lg:col-span-2">
          <FaqSection
            title="Custom Shortlist FAQ"
            items={[
              {
                question: "Does a shortlist include private contact data?",
                answer: "No. The shortlist uses public profile fields and official website links when available. It does not include private phone numbers, emails, or contact names.",
              },
              {
                question: "Is the shortlist a supplier recommendation?",
                answer: "It is a research shortlist, not a guarantee. You still need independent verification before sampling, payment, or contracting.",
              },
              {
                question: "What if my product is too broad?",
                answer: "The request form should include enough product detail to avoid irrelevant candidates. Broad requests may produce broader candidate groups.",
              },
              {
                question: "Can I request more than 50 suppliers?",
                answer: "The listed custom shortlist product covers up to 50 supplier candidates. Larger research needs should be submitted through the contact form.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}

function Process({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <CardContent>
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      </CardContent>
    </Card>
  );
}
