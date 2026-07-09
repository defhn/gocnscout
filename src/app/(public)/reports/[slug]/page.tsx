import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { formatUsd } from "@/lib/utils";
import { getPublishedReport } from "@/server/reports";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReport(slug).catch(() => null);
  if (!report) {
    return createMetadata({
      title: "China Supplier Industry Report",
      description: "Download industry PDF reports based on non-sensitive supplier data, cluster analysis, and buyer vetting checklists.",
      noindex: true,
    });
  }
  return createMetadata({
    title: report.title,
    description:
      report.description ||
      "Industry PDF report based on non-sensitive supplier data, supplier counts, city clusters, product keywords, and buyer verification checklists.",
    path: `/reports/${slug}`,
  });
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReport(slug).catch(() => null);
  if (!report) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reports", href: "/reports" }, { label: report.title }]} />
      <section className="container-page pb-14">
        <h1 className="text-3xl font-semibold text-slate-950">{report.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{report.description || "This report is based on non-sensitive supplier data and admin-published analysis."}</p>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            <CardHeader>
              <CardTitle>Report contents</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-lg font-semibold text-slate-950">Included sections</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {["Industry overview", "Supplier count", "Province distribution", "City distribution", "Product keyword clusters", "Company size distribution", "Company type distribution", "Trade mode distribution", "Sample public supplier profiles", "Buyer verification checklist"].map((item) => (
                  <h3 key={item} className="rounded-md border border-border bg-slate-50 p-3 text-sm font-medium text-slate-700">{item}</h3>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{formatUsd(report.priceUsdCents)}</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-sm font-semibold text-slate-950">Delivery</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                After payment, the report appears in your dashboard downloads when the uploaded PDF file is available.
              </p>
              <h3 className="mt-5 text-sm font-semibold text-slate-950">Excluded fields</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Private contact details and full addresses are excluded.
              </p>
              <ButtonLink href={`/api/reports/${report.id}/checkout`} className="mt-6 w-full">
                Buy report
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
