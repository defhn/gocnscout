import { notFound } from "next/navigation";
import Link from "next/link";
import { Lock, Globe, ExternalLink, Award } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/config/seo";
import { getExhibitionTierLabel } from "@/config/field-policy";
import { canViewStarterFields, canViewProFields, type AppPlanCode } from "@/config/plans";
import { getCurrentAppUser } from "@/server/auth";
import { getSupplierBySlug } from "@/server/suppliers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supplier = await getSupplierBySlug(slug).catch(() => null);
  if (!supplier) return createMetadata({ title: "Supplier profile", description: "Public supplier profile.", noindex: true });
  return createMetadata({
    title: supplier.exhibitorName,
    description: `${supplier.exhibitorName} public supplier profile — industry, location, product keywords, company type, and trade context.`,
    path: `/suppliers/${slug}`,
  });
}

const TIER_COLORS: Record<string, string> = {
  new: "bg-slate-100 text-slate-600 border-slate-200",
  rising: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-teal-50 text-teal-700 border-teal-200",
  established: "bg-amber-50 text-amber-700 border-amber-200",
  veteran: "bg-purple-50 text-purple-700 border-purple-200",
};
const TIER_ICONS: Record<string, string> = {
  new: "🆕", rising: "📈", active: "⭐", established: "🔥", veteran: "💎",
};

export default async function SupplierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [supplier, appUser] = await Promise.all([
    getSupplierBySlug(slug).catch(() => null),
    getCurrentAppUser().catch(() => null),
  ]);

  if (!supplier) notFound();

  const planCode = (appUser?.planCode ?? "FREE") as AppPlanCode;
  const canStarter = canViewStarterFields(planCode);
  const canPro = canViewProFields(planCode);

  const { label: tierLabel, tier } = getExhibitionTierLabel(supplier.exhibitionSessionCount);

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
              {[supplier.city, supplier.province].filter(Boolean).join(", ") || "Location not published"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            <CardHeader>
              <CardTitle>Supplier overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company info */}
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

              {/* Products */}
              <section>
                <h2 className="text-lg font-semibold text-slate-950">Products and keywords</h2>
                <h3 className="mt-4 text-sm font-semibold text-slate-950">Main products</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{supplier.productsText || "No product text published."}</p>
                <h3 className="mt-4 text-sm font-semibold text-slate-950">Keywords</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{supplier.keywordsText || "No keyword text published."}</p>
              </section>

              {/* Trade & Exhibition */}
              <section>
                <h2 className="text-lg font-semibold text-slate-950">Trade &amp; exhibition context</h2>

                <h3 className="mt-4 text-sm font-semibold text-slate-950">Trade modes</h3>
                {canStarter ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {supplier.tradeModes.length ? supplier.tradeModes.join(", ") : "Not published."}
                  </p>
                ) : (
                  <LockedFieldInline label="Trade mode data" plan="STARTER" />
                )}

                <h3 className="mt-4 text-sm font-semibold text-slate-950">Exhibition track</h3>
                {canStarter ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${TIER_COLORS[tier]}`}>
                      {TIER_ICONS[tier]} {tierLabel}
                    </span>
                    {canPro ? (
                      <span className="text-sm text-slate-500">
                        {supplier.exhibitionSessionCount ?? 0} sourcing exhibitions
                      </span>
                    ) : (
                      <LockedFieldInline label="Exact count" plan="PRO" compact />
                    )}
                  </div>
                ) : (
                  <LockedFieldInline label="Exhibition data" plan="STARTER" />
                )}

                <h3 className="mt-4 text-sm font-semibold text-slate-950">Official website</h3>
                {canStarter && supplier.websiteUrl ? (
                  <a
                    href={supplier.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : !canStarter ? (
                  <LockedFieldInline label="Official website" plan="STARTER" />
                ) : (
                  <p className="mt-2 text-sm text-slate-400">No website published.</p>
                )}
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">What is shown</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This profile contains public company registration data: industry, location, product scope, company structure, and exhibition track record.
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950">What is never shown</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Contact persons, mobile numbers, phone numbers, fax, email addresses, full street addresses, and postal codes are permanently excluded from all plans.
                </p>
              </div>
              {!canPro && (
                <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-900">
                    <Award className="h-4 w-4" />
                    {canStarter ? "Upgrade to Pro" : "Upgrade to Starter"}
                  </h2>
                  <p className="mt-1 text-xs text-teal-700">
                    {canStarter
                      ? "Unlock exhibition counts, sourcing signals, and more."
                      : "Unlock trade modes, official website, and exhibition tier."}
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-3 inline-flex items-center gap-1 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold !text-white hover:bg-teal-750 shadow-sm transition-colors"
                  >
                    View pricing →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">How to use this profile</h2><p className="mt-2 text-sm font-normal leading-6 text-slate-600">Use this page as a public profile summary for research, comparison, and shortlist decisions.</p></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">What to verify next</h2><p className="mt-2 text-sm font-normal leading-6 text-slate-600">Confirm product fit, website ownership, certifications, samples, terms, and current business status before buying.</p></CardContent></Card>
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">What is not shown</h2><p className="mt-2 text-sm font-normal leading-6 text-slate-600">Private contact person, mobile, phone, fax, email, full address, and postal code are not displayed on any plan.</p></CardContent></Card>
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

function LockedFieldInline({ label, plan, compact = false }: { label: string; plan: string; compact?: boolean }) {
  const isPro = plan === "PRO" || plan.startsWith("PRO");
  const bgClass = isPro ? "bg-indigo-600 hover:bg-indigo-700" : "bg-teal-600 hover:bg-teal-700";
  return (
    <Link
      href="/pricing"
      className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${bgClass} !text-white hover:!text-white transition-all shadow-md font-semibold`}
      title={`Upgrade to ${plan} to unlock ${label}`}
    >
      <Lock className="h-3.5 w-3.5 !text-white" />
      <span className="text-xs font-semibold text-white">
        {label} locked
      </span>
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider !text-white">
        {plan}+
      </span>
    </Link>
  );
}
