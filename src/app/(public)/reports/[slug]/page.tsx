import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { formatUsd } from "@/lib/utils";
import { getPublishedReport, userOwnsReport } from "@/server/reports";
import { getCurrentAppUser } from "@/server/auth";

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

  const user = await getCurrentAppUser();
  const ownsReport = user ? await userOwnsReport(user.id, report.id) : false;

  const isProTeamAnnual = user && 
                          (user.planCode === "PRO" || user.planCode === "TEAM") && 
                          user.billingInterval === "YEAR" && 
                          user.subscriptionStatus === "ACTIVE";

  const isStarterAnnual = user && 
                          user.planCode === "STARTER" && 
                          user.billingInterval === "YEAR" && 
                          user.subscriptionStatus === "ACTIVE";

  // Determine displayed price, delivery note, button text and target link
  let priceDisplay: React.ReactNode = formatUsd(report.priceUsdCents);
  let btnText = "Buy report";
  let btnHref = `/api/reports/${report.id}/checkout`;
  let deliveryNote = "After payment, the report appears in your dashboard downloads when the uploaded PDF file is available.";

  if (ownsReport) {
    priceDisplay = <span className="text-teal-600 font-bold">Purchased</span>;
    btnText = "Download Report (PDF)";
    btnHref = `/api/reports/${report.id}/download`;
    deliveryNote = "You have unlocked this report. Download the PDF directly below or manage it in your dashboard downloads page.";
  } else if (isProTeamAnnual) {
    priceDisplay = (
      <div className="flex flex-col">
        <span className="text-3xl font-extrabold text-teal-650">FREE</span>
        <span className="text-xs text-teal-650 mt-1 font-semibold">Included in Pro/Team Annual Plan</span>
      </div>
    );
    btnText = "Unlock Free Report";
    deliveryNote = "As an active Pro/Team Annual Member, you can unlock this industry intelligence report for free instantly.";
  } else if (isStarterAnnual) {
    const halfPriceCents = Math.round(report.priceUsdCents / 2);
    priceDisplay = (
      <div className="flex flex-col">
        <span className="text-sm text-slate-400 line-through font-normal">{formatUsd(report.priceUsdCents)}</span>
        <span className="text-3xl font-extrabold text-teal-600">{formatUsd(halfPriceCents)}</span>
        <span className="text-xs text-teal-600 mt-1 font-semibold">50% Starter Annual Discount</span>
      </div>
    );
    btnText = "Buy with 50% Discount";
  }

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
          <Card className="flex flex-col justify-between">
            <div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{priceDisplay}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Delivery</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {deliveryNote}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Excluded fields</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    Private contact details and full addresses are excluded.
                  </p>
                </div>
              </CardContent>
            </div>
            <CardContent className="pt-0">
              <ButtonLink href={btnHref} className="w-full text-xs font-bold py-2.5 rounded-xl">
                {btnText}
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
