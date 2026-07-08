import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { getCityPage } from "@/server/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCityPage(slug).catch(() => null);
  if (!data) return createMetadata({ title: "City suppliers", description: "City supplier page.", noindex: true });
  return createMetadata({
    title: `${data.city.city} suppliers`,
    description: data.city.metaDescription,
    path: `/cities/${slug}`,
    noindex: !data.city.isIndexable,
  });
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCityPage(slug).catch(() => null);
  if (!data) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cities", href: "/database" }, { label: data.city.city }]} />
      <section className="container-page pb-14">
        <h1 className="text-3xl font-semibold text-slate-950">{data.city.city} suppliers</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{data.city.metaDescription}</p>
        <Card className="mt-8">
          <CardContent>
            <h2 className="text-xl font-semibold text-slate-950">Public supplier samples</h2>
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
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">How to use this city page</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Use city pages when location is part of your sourcing strategy, then filter by category and company profile fields.</h3></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">What to confirm</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">Confirm current operating location and production capacity directly with the supplier before relying on a record.</h3></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">Research boundary</h2><h3 className="mt-2 text-sm font-normal leading-6 text-slate-600">City data supports discovery; it is not a logistics, compliance, or supplier qualification guarantee.</h3></CardContent></Card>
        </section>
      </section>
    </>
  );
}
