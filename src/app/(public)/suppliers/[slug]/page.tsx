import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { getSupplierBySlug } from "@/server/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supplier = await getSupplierBySlug(slug).catch(() => null);
  if (!supplier) return createMetadata({ title: "Supplier profile", description: "Public supplier profile.", noindex: true });
  return createMetadata({
    title: supplier.exhibitorName,
    description: `${supplier.exhibitorName} public supplier profile with industry, location, product keywords, company type, and trade mode fields.`,
    path: `/suppliers/${slug}`,
  });
}

export default async function SupplierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supplier = await getSupplierBySlug(slug).catch(() => null);
  if (!supplier) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Database", href: "/database" },
          { label: supplier.exhibitorName },
        ]}
      />
      <section className="container-page pb-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge>{supplier.industryName}</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">{supplier.exhibitorName}</h1>
            <p className="mt-3 text-base text-slate-600">
              {[supplier.city, supplier.province].filter(Boolean).join(", ") || "Location is not published"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            <CardHeader>
              <CardTitle>Supplier overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold text-slate-950">Public company profile</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Field label="Industry" value={supplier.industryName} />
                  <Field label="Company type" value={supplier.companyType} />
                  <Field label="Company size" value={supplier.companySize} />
                  <Field label="Founded year" value={supplier.foundedYear?.toString()} />
                  <Field label="Registered capital" value={supplier.registeredCapital} />
                  <Field label="Company nature" value={supplier.companyNature} />
                </div>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-950">Products and keywords</h2>
                <h3 className="mt-4 text-sm font-semibold text-slate-950">Main products</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{supplier.productsText || "No product text published."}</p>
                <h3 className="mt-4 text-sm font-semibold text-slate-950">Keywords</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{supplier.keywordsText || "No keyword text published."}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-slate-950">Trade and exhibitor context</h2>
                <h3 className="mt-4 text-sm font-semibold text-slate-950">Trade modes</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{supplier.tradeModes.length ? supplier.tradeModes.join(", ") : "No trade mode published."}</p>
                <h3 className="mt-4 text-sm font-semibold text-slate-950">Exhibition history</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {supplier.exhibitorHistory.length 
                    ? supplier.exhibitorHistory.map(h => h.replace(/Canton\s+Fair/gi, "Sourcing Exhibition")).join(", ") 
                    : "No exhibition history published."}
                </p>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data policy</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-sm font-semibold text-slate-950">Hidden fields</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact person, mobile number, phone number, fax, email, full address, and postal code are not displayed or sold.
              </p>
              <h3 className="mt-5 text-sm font-semibold text-slate-950">Website access</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Official website links are available to paid database subscribers when a public website URL exists.
              </p>
            </CardContent>
          </Card>
        </div>
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">How to use this profile</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Treat this page as a public profile summary for research, comparison, and shortlist decisions.</h3></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">What to verify next</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Confirm product fit, website ownership, certifications, samples, terms, and current business status before buying.</h3></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">What is not shown</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Private contact person, mobile, phone, fax, email, full address, and postal code fields are not displayed.</h3></CardContent></Card>
        </section>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-border bg-slate-50 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h3>
      <p className="mt-1 text-sm text-slate-900">{value || "Not published"}</p>
    </div>
  );
}
