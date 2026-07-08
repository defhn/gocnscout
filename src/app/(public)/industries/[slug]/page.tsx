import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { getIndustryPage } from "@/server/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getIndustryPage(slug).catch(() => null);
  if (!data) return createMetadata({ title: "Industry suppliers", description: "Industry supplier page.", noindex: true });
  return createMetadata({
    title: `${data.industry.industryName} suppliers`,
    description: data.industry.metaDescription,
    path: `/industries/${slug}`,
    noindex: !data.industry.isIndexable,
  });
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getIndustryPage(slug).catch(() => null);
  if (!data) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Industries", href: "/database" }, { label: data.industry.industryName }]} />
      <section className="container-page pb-14">
        <h1 className="text-3xl font-semibold text-slate-950">{data.industry.industryName} suppliers</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{data.industry.intro || data.industry.metaDescription}</p>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold text-slate-950">Public supplier samples</h2>
              <div className="mt-4 grid gap-3">
                {data.suppliers.suppliers.map((supplier) => (
                  <article key={supplier.id} className="rounded-md border border-border p-4">
                    <h3 className="font-semibold text-slate-950">
                      <Link href={`/suppliers/${supplier.slug}`}>{supplier.exhibitorName}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{supplier.productsText || supplier.keywordsText || "Product text not published."}</p>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold text-slate-950">Industry data</h2>
              <h3 className="mt-4 text-sm font-semibold text-slate-950">Supplier count</h3>
              <p className="mt-1 text-sm text-slate-600">{data.industry.supplierCount.toLocaleString("en-US")} published profiles</p>
              <h3 className="mt-4 text-sm font-semibold text-slate-950">Indexing status</h3>
              <p className="mt-1 text-sm text-slate-600">{data.industry.isIndexable ? "Eligible for indexing" : "Noindex until enough data is available"}</p>
            </CardContent>
          </Card>
        </div>
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">How to use this industry page</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Use it as a category starting point, then open the database with industry, location, company type, and product filters.</h3></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">What to compare</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Compare product text, public website availability, company size, trade mode, and exhibition history before contacting suppliers.</h3></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">Verification reminder</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Industry matches are research signals. Buyers still need independent verification, samples, and commercial due diligence.</h3></CardContent></Card>
        </section>
      </section>
    </>
  );
}
