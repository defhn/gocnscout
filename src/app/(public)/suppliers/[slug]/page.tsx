import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Globe,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { createMetadata } from "@/config/seo";
import { getExhibitionTierLabel } from "@/config/field-policy";
import { canViewStarterFields, canViewProFields, getPlan, type AppPlanCode } from "@/config/plans";
import { getManualReviewPackage } from "@/config/manual-review";
import { getCurrentAppUser } from "@/server/auth";
import { getSimilarSuppliers, getSupplierBySlug } from "@/server/suppliers";
import { prisma } from "@/lib/db";
import { formatUsd, monthKey, truncate } from "@/lib/utils";
import { canViewSupplierProfile } from "@/server/quota";
import { PlanCode } from "@/generated/prisma/enums";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supplier = await getSupplierBySlug(slug).catch(() => null);
  if (!supplier) {
    return createMetadata({
      title: "Supplier Profile Not Found",
      description: "This supplier profile is not available for indexing.",
      noindex: true,
    });
  }
  return createMetadata({
    title: `${supplier.exhibitorName} Supplier Profile and Verification Notes`,
    description: `${supplier.exhibitorName} public supplier profile: industry, location, product keywords, company type, website status, verification checklist, and similar China suppliers.`,
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
  new: "NEW",
  rising: "UP",
  active: "ACTIVE",
  established: "EST",
  veteran: "VET",
};

const identityPackage = getManualReviewPackage("IDENTITY_SINGLE");
const decisionPackage = getManualReviewPackage("DECISION_SINGLE");

export default async function SupplierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [supplier, appUser] = await Promise.all([
    getSupplierBySlug(slug).catch(() => null),
    getCurrentAppUser().catch(() => null),
  ]);

  if (!supplier) notFound();

  const [cityPage, similarSuppliers] = await Promise.all([
    supplier.city && supplier.province
      ? prisma.cityPage.findUnique({
          where: { province_city: { province: supplier.province, city: supplier.city } },
          select: { slug: true },
        })
      : Promise.resolve(null),
    getSimilarSuppliers(supplier, 6),
  ]);
  const cityPageSlug = cityPage?.slug || "";

  const planCode = (appUser?.planCode ?? "FREE") as AppPlanCode;
  const userId = appUser?.id;
  const planLimit = appUser ? getPlan(planCode).profileViewsPerMonth : "limited";

  if (appUser && userId && planLimit !== "unlimited") {
    const mKey = monthKey();
    const existingView = await prisma.supplierProfileView.findFirst({
      where: {
        userId,
        supplierId: supplier.id,
        monthKey: mKey,
      },
    });

    if (!existingView) {
      const allowed = await canViewSupplierProfile(userId, planCode as PlanCode);
      if (!allowed) {
        return <ProfileViewPaywall />;
      }

      await prisma.$transaction(async (tx) => {
        await tx.supplierProfileView.create({
          data: {
            userId,
            supplierId: supplier.id,
            monthKey: mKey,
          },
        });
        await tx.usageCounter.upsert({
          where: { userId_kind_periodKey: { userId, kind: "profile_view", periodKey: mKey } },
          update: { used: { increment: 1 } },
          create: { userId, kind: "profile_view", periodKey: mKey, used: 1 },
        });
      });
    }
  }

  const canStarter = canViewStarterFields(planCode);
  const canPro = canViewProFields(planCode);
  const { label: tierLabel, tier } = getExhibitionTierLabel(supplier.exhibitionSessionCount);
  const reviewTargetUrl = supplier.websiteUrl || `https://gocnscout.com/suppliers/${supplier.slug}`;
  const identityReviewHref = `/api/manual-review/checkout?package=IDENTITY_SINGLE&supplierUrl=${encodeURIComponent(reviewTargetUrl)}`;
  const decisionReviewHref = `/api/manual-review/checkout?package=DECISION_SINGLE&supplierUrl=${encodeURIComponent(reviewTargetUrl)}`;
  const supplierCheckHref = supplier.websiteUrl
    ? `/supplier-check?url=${encodeURIComponent(supplier.websiteUrl)}`
    : "/supplier-check";
  const comparisonHref = cityPageSlug && supplier.industrySlug
    ? `/cities/${cityPageSlug}/${supplier.industrySlug}`
    : `/database?industry=${encodeURIComponent(supplier.industryName)}`;
  const shortlistMessage = [
    `I found ${supplier.exhibitorName} on GoCNScout.`,
    `Please find similar China suppliers for ${supplier.productsText || supplier.keywordsText || supplier.industryName}.`,
    supplier.city ? `Preferred location: ${supplier.city}${supplier.province ? `, ${supplier.province}` : ""}.` : "",
    `Industry: ${supplier.industryName}.`,
    supplier.websiteUrl ? `Known website: ${supplier.websiteUrl}.` : "This supplier has no official website listed, so please prioritize candidates with stronger public footprints.",
  ].filter(Boolean).join("\n");

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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link href={`/industries/${supplier.industrySlug || ""}`}>
                <Badge className="bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100 transition-colors cursor-pointer">
                  {supplier.industryName}
                </Badge>
              </Link>
              {cityPageSlug && (
                <Link href={`/cities/${cityPageSlug}`}>
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500 hover:text-teal-600 hover:border-teal-300 transition-all cursor-pointer">
                    {supplier.city} Sourcing Hub
                  </span>
                </Link>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">{supplier.exhibitorName}</h1>
            <p className="mt-3 text-base text-slate-600 flex items-center gap-1">
              {cityPageSlug ? (
                <Link href={`/cities/${cityPageSlug}`} className="hover:text-teal-600 hover:underline transition-all font-semibold">
                  {supplier.city}
                </Link>
              ) : (
                <span>{supplier.city}</span>
              )}
              {supplier.province && <span className="text-slate-400">, {supplier.province}</span>}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={supplierCheckHref}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition-colors hover:bg-teal-700"
              >
                <Search className="h-4 w-4" />
                {supplier.websiteUrl ? "Run free supplier check" : "Check with an Alibaba URL"}
              </Link>
              <Link
                href={identityReviewHref}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                <FileCheck2 className="h-4 w-4 text-teal-600" />
                Order {formatUsd(identityPackage.amountUsdCents)} identity check
              </Link>
            </div>
          </div>

          <VerificationCard
            hasWebsite={Boolean(supplier.websiteUrl)}
            supplierName={supplier.exhibitorName}
            supplierCheckHref={supplierCheckHref}
            identityReviewHref={identityReviewHref}
            decisionReviewHref={decisionReviewHref}
          />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            <CardHeader>
              <CardTitle>Supplier overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {cityPageSlug && supplier.industrySlug && (
                <div className="rounded-lg border border-teal-100 bg-teal-50/20 p-4 text-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="text-slate-600 leading-relaxed max-w-xl">
                    Not enough information on this company? Compare similar verified <strong>{supplier.industryName}</strong> exporters and manufacturers based in <strong>{supplier.city}</strong>.
                  </div>
                  <Link
                    href={comparisonHref}
                    className="shrink-0 rounded-lg bg-teal-600 px-3.5 py-2 font-bold text-white hover:bg-teal-700 transition-all flex items-center gap-1 shadow-sm text-[11px]"
                  >
                    Compare similar suppliers <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {!supplier.websiteUrl && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-950">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    No official website found in public records
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    This does not mean the supplier is fake. It means buyers should verify identity through a business license, Alibaba storefront, exhibition records, product consistency, and payment documents before contacting, sampling, or paying.
                  </p>
                </div>
              )}

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
                <h2 className="text-lg font-semibold text-slate-950">Trade and exhibition context</h2>

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
                    Visit website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : !canStarter && supplier.websiteUrl ? (
                  <LockedFieldInline label="Official website" plan="STARTER" />
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    No official website is listed for this supplier. Use an Alibaba storefront, product listing, quotation document, or business license to continue verification.
                  </p>
                )}
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buyer next step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">Best use of this page</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Treat this profile as a first-pass public record. It is useful for matching products, city, company scale, and public trade signals before deeper verification.
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950">What is never shown</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Contact persons, mobile numbers, phone numbers, fax, email addresses, full street addresses, and postal codes are permanently excluded from all plans.
                </p>
              </div>
              <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-teal-900">
                  <Award className="h-4 w-4" />
                  Human verification available
                </h2>
                <p className="mt-1 text-xs leading-5 text-teal-700">
                  Use manual review when the order size, product risk, or payment decision needs human judgment.
                </p>
                <div className="mt-3 grid gap-2">
                  <Link
                    href={identityReviewHref}
                    className="inline-flex items-center justify-center gap-1 rounded-md bg-teal-600 px-3 py-2 text-xs font-semibold !text-white hover:bg-teal-700 shadow-sm transition-colors"
                  >
                    {formatUsd(identityPackage.amountUsdCents)} Identity Check
                  </Link>
                  <Link
                    href={decisionReviewHref}
                    className="inline-flex items-center justify-center gap-1 rounded-md border border-teal-200 bg-white px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 transition-colors"
                  >
                    {formatUsd(decisionPackage.amountUsdCents)} Decision Review
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <UseCard title="Verify identity" text={`Confirm whether ${supplier.exhibitorName} matches the legal Chinese registration, business status, and product scope before you rely on the name.`} />
          <UseCard title="Compare alternatives" text={`Benchmark this supplier against other ${supplier.industryName} exporters${supplier.city ? ` in ${supplier.city}` : ""} to avoid overcommitting to one weak public profile.`} />
          <UseCard title="Prepare buyer questions" text="Ask for business license, export record, sample invoice, factory photos, certificate copies, payment terms, and product-specific compliance documents." />
        </section>

        {similarSuppliers.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Similar suppliers to compare</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  If this company has limited public information, review nearby or same-category exporters before making contact or payment decisions.
                </p>
              </div>
              <Link href={comparisonHref} className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800">
                Browse full comparison set <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {similarSuppliers.map((item) => (
                <Link
                  key={item.id}
                  href={`/suppliers/${item.slug}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-teal-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-5 text-slate-950">{item.exhibitorName}</h3>
                    {item.websiteUrl && (
                      <span className="shrink-0 rounded border border-teal-100 bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">
                        Web
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-teal-700">{item.city || item.province || "China"}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {truncate(item.productsText || item.keywordsText || item.industryName, 110)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-medium text-slate-500">
                    {item.companyType && <span className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5">{item.companyType}</span>}
                    {item.foundedYear && <span className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5">Since {item.foundedYear}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 grid gap-6 rounded-lg border border-slate-200 bg-white p-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Need alternatives to this supplier?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Request a custom shortlist around this company. This works especially well when the profile has no official website, the product scope is broad, or you need backup candidates before RFQ.
            </p>
            <ul className="mt-5 grid gap-3 text-sm text-slate-700">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />Product and category matching</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />Preference for suppliers with stronger public footprints</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />No private contact fields included</li>
            </ul>
          </div>
          <form action="/api/inquiries" method="post" className="grid gap-3">
            <input type="hidden" name="type" value="SUPPLIER_ALTERNATIVES" />
            <input type="hidden" name="redirectTo" value={`/suppliers/${supplier.slug}`} />
            <Input name="name" placeholder="Your name" required />
            <Input name="email" type="email" placeholder="Work email" required />
            <Input name="companyName" placeholder="Company name" />
            <Textarea name="message" defaultValue={shortlistMessage} required />
            <Button type="submit" className="w-full">Request similar suppliers</Button>
          </form>
        </section>
      </section>
    </>
  );
}

function VerificationCard({
  hasWebsite,
  supplierName,
  supplierCheckHref,
  identityReviewHref,
  decisionReviewHref,
}: {
  hasWebsite: boolean;
  supplierName: string;
  supplierCheckHref: string;
  identityReviewHref: string;
  decisionReviewHref: string;
}) {
  return (
    <Card className={hasWebsite ? "border-teal-100" : "border-amber-200 bg-amber-50/40"}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          {hasWebsite ? <ShieldCheck className="h-5 w-5 text-teal-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
          <h2 className="text-base font-semibold text-slate-950">
            {hasWebsite ? "Verify before you contact" : "Website missing: verify first"}
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {hasWebsite
            ? `Use the listed website as one signal for ${supplierName}, then check whether the company name, product line, and payment documents match.`
            : `No official website is listed for ${supplierName}. Ask for a storefront, business license, or quotation documents before you judge the supplier.`}
        </p>
        <div className="mt-4 grid gap-2">
          <Link href={supplierCheckHref} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold !text-white hover:bg-teal-700">
            <Search className="h-4 w-4" />
            {hasWebsite ? "Run free scan" : "Paste Alibaba/storefront URL"}
          </Link>
          <Link href={identityReviewHref} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <FileCheck2 className="h-4 w-4 text-teal-600" />
            Human identity check
          </Link>
          <Link href={decisionReviewHref} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Buyer decision review
          </Link>
        </div>
      </CardContent>
    </Card>
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

function UseCard({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <CardContent>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm font-normal leading-6 text-slate-600">{text}</p>
      </CardContent>
    </Card>
  );
}

function LockedFieldInline({ label, plan, compact = false }: { label: string; plan: string; compact?: boolean }) {
  const isPro = plan === "PRO" || plan.startsWith("PRO");
  const bgClass = isPro ? "bg-indigo-600 hover:bg-indigo-700" : "bg-teal-600 hover:bg-teal-700";
  return (
    <Link
      href="/pricing"
      className={`mt-2 inline-flex items-center gap-2 ${compact ? "px-3" : "px-4"} py-1.5 rounded-full ${bgClass} !text-white hover:!text-white transition-all shadow-md font-semibold`}
      title={`Upgrade to ${plan} to unlock ${label}`}
    >
      <Lock className="h-3.5 w-3.5 !text-white" />
      <span className="text-xs font-semibold text-white">{label} locked</span>
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider !text-white">
        {plan}+
      </span>
    </Link>
  );
}

function ProfileViewPaywall() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Database", href: "/database" },
          { label: "Limit Reached" },
        ]}
      />
      <section className="container-page py-20 flex flex-col items-center justify-center">
        <div className="w-full max-w-[500px] rounded-3xl bg-white border border-slate-200 p-8 shadow-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-6">
            <Lock className="h-8 w-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Supplier Profile Limit Reached</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            You have used all 5 of your free supplier profile views for this month. Upgrade to Starter or Pro to unlock unlimited profile views and get access to public supplier research fields.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-3 text-sm font-semibold !text-white transition-all shadow-md"
            >
              View Plans and Upgrade
            </Link>
            <Link
              href="/database"
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600 transition-colors"
            >
              Back to Database
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}