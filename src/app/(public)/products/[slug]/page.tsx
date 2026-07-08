import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { getProductPage } from "@/server/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductPage(slug).catch(() => null);
  if (!data) return createMetadata({ title: "Product suppliers", description: "Product supplier page.", noindex: true });
  return createMetadata({
    title: `${data.product.keyword} suppliers`,
    description: data.product.metaDescription,
    path: `/products/${slug}`,
    noindex: !data.product.isIndexable,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductPage(slug).catch(() => null);
  if (!data) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/database" }, { label: data.product.keyword }]} />
      <section className="container-page pb-14">
        <h1 className="text-3xl font-semibold text-slate-950">{data.product.keyword} suppliers</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{data.product.metaDescription}</p>
        <Card className="mt-8">
          <CardContent>
            <h2 className="text-xl font-semibold text-slate-950">Matching supplier samples</h2>
            <div className="mt-4 grid gap-3">
              {data.suppliers.suppliers.map((supplier) => (
                <article key={supplier.id} className="rounded-md border border-border p-4">
                  <h3 className="font-semibold text-slate-950">{supplier.exhibitorName}</h3>
                  <p className="mt-1 text-sm text-slate-600">{supplier.productsText || supplier.keywordsText || "Product text not published."}</p>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">How to use this keyword</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Use the keyword as a discovery entry, then refine results by industry, city, company size, company type, and trade mode.</h3></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">What to inspect</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Review whether the product text and supplier profile actually match your target specification before shortlisting.</h3></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">No demand claim</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">This page does not claim market demand or product trend strength unless a published report provides that context.</h3></CardContent></Card>
        </section>
      </section>
    </>
  );
}
