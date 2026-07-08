import Link from "next/link";
import { ArrowDownUp, Download, ExternalLink, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMetadata } from "@/config/seo";
import { sanitizeWebsiteAccess } from "@/config/field-policy";
import { getDatabaseFacets, searchSuppliers } from "@/server/suppliers";

export const metadata = createMetadata({
  title: "Supplier Database Search",
  description:
    "Search public trade exhibition supplier profiles by industry, product keyword, province, city, company type, and trade mode.",
  path: "/database",
  noindex: true,
});

export default async function DatabasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = stringParam(params.q);
  const industry = stringParam(params.industry);
  const province = stringParam(params.province);
  const city = stringParam(params.city);
  const companyType = stringParam(params.companyType);
  const companySize = stringParam(params.companySize);
  const companyNature = stringParam(params.companyNature);
  const foundedYear = stringParam(params.foundedYear);
  const registeredCapital = stringParam(params.registeredCapital);
  const tradeMode = stringParam(params.tradeMode);
  const page = Math.max(1, Number(stringParam(params.page) || 1));

  const [results, facets] = await Promise.all([
    searchSuppliers({ q, industry, province, city, companyType, companySize, companyNature, foundedYear, registeredCapital, tradeMode, page, pageSize: 20 }).catch(() => ({
      suppliers: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })),
    getDatabaseFacets().catch(() => ({
      industries: [],
      provinces: [],
      cities: [],
      companyTypes: [],
      companySizes: [],
      companyNatures: [],
      foundedYears: [],
      registeredCapitals: [],
      tradeModes: [],
      websiteCount: 0,
    })),
  ]);

  const activeFilters = [
    ["Industry", industry],
    ["Province", province],
    ["City", city],
    ["Company type", companyType],
    ["Company size", companySize],
    ["Company nature", companyNature],
    ["Founded year", foundedYear],
    ["Registered capital", registeredCapital],
    ["Trade mode", tradeMode],
  ].filter(([, value]) => value);

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f3f6f9]">
      <div className="border-b border-[#d8e0ea] bg-[#eef3f8]">
        <div className="mx-auto flex min-h-14 w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Supplier database</h1>
            <p className="text-sm text-slate-600">
              {results.total.toLocaleString("en-US")} public supplier profiles - private contact fields excluded
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Free: 2 pages, 10 results/page, 5 profiles/month
            </span>
            <Link
              href="/pricing"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1440px] lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="border-r border-[#d8e0ea] bg-[#f8fafc] lg:sticky lg:top-16 lg:h-[calc(100vh-65px)] lg:overflow-y-auto">
          <div className="border-b border-[#d8e0ea] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-brand">Advanced</span>
              <Link href="/database" className="text-slate-500 hover:text-slate-950">
                Clear
              </Link>
            </div>
            <form className="grid gap-3">
              <label className="grid gap-1 text-sm text-slate-700">
                Search
                <Input name="q" defaultValue={q} placeholder="Product, supplier, city" />
              </label>
              <input type="hidden" name="industry" value={industry} />
              <input type="hidden" name="province" value={province} />
              <input type="hidden" name="city" value={city} />
              <Button type="submit" className="h-9">
                <Search className="h-4 w-4" /> Search
              </Button>
            </form>
          </div>
          <div className="space-y-2 p-3">
            <Facet title="Industry" param="industry" items={facets.industries.map((i) => [i.industryName, i._count._all])} />
            <Facet title="Province" param="province" items={facets.provinces.filter((i) => i.province).map((i) => [i.province || "", i._count._all])} />
            <Facet title="City" param="city" items={facets.cities.filter((i) => i.city).map((i) => [i.city || "", i._count._all])} />
            <Facet title="Company Size" param="companySize" items={facets.companySizes.filter((i) => i.companySize).map((i) => [i.companySize || "", i._count._all])} />
            <Facet title="Company Type" param="companyType" items={facets.companyTypes.filter((i) => i.companyType).map((i) => [i.companyType || "", i._count._all])} />
            <Facet title="Trade Mode" param="tradeMode" items={facets.tradeModes.map((i) => [i.label, i.count])} />
            <Facet title="Company Nature" param="companyNature" items={facets.companyNatures.filter((i) => i.companyNature).map((i) => [i.companyNature || "", i._count._all])} />
            <Facet title="Founded Year" param="foundedYear" items={facets.foundedYears.filter((i) => i.foundedYear).map((i) => [String(i.foundedYear), i._count._all])} />
            <Facet title="Registered Capital" param="registeredCapital" items={facets.registeredCapitals.filter((i) => i.registeredCapital).map((i) => [i.registeredCapital || "", i._count._all])} />
            <section className="rounded-md border border-[#cfd9e5] bg-white p-3">
              <h2 className="flex items-center justify-between text-sm font-medium text-slate-700">
                Has Website
                <Filter className="h-4 w-4 text-brand" />
              </h2>
              <h3 className="mt-3 flex items-center justify-between text-sm font-normal text-slate-700">
                <span>Website URL present</span>
                <span>{facets.websiteCount.toLocaleString("en-US")}</span>
              </h3>
            </section>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="border-b border-[#d8e0ea] bg-white px-4 py-3 lg:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-slate-950">Search results</h2>
                {activeFilters.map(([label, value]) => (
                  <Badge key={`${label}-${value}`} className="border-slate-200 bg-slate-50 text-slate-700">
                    {label}: {value}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm text-slate-700">
                  <ArrowDownUp className="h-4 w-4" /> Sort: Supplier
                </button>
                <Link
                  href="/pricing"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" /> Export
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-[#d8e0ea] bg-[#fbfcfe] text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[250px] px-4 py-3">Supplier</th>
                  <th className="w-[150px] px-4 py-3">Industry</th>
                  <th className="w-[110px] px-4 py-3">Province</th>
                  <th className="w-[110px] px-4 py-3">City</th>
                  <th className="w-[260px] px-4 py-3">Main products</th>
                  <th className="w-[190px] px-4 py-3">Keywords</th>
                  <th className="w-[120px] px-4 py-3">Company size</th>
                  <th className="w-[130px] px-4 py-3">Company type</th>
                  <th className="w-[140px] px-4 py-3">Trade mode</th>
                  <th className="w-[110px] px-4 py-3">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ebf2]">
                {results.suppliers.length ? (
                  results.suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-[#f8fafc]">
                      <td className="px-4 py-3 align-top">
                        <h3 className="font-semibold text-slate-950">
                          <Link href={`/suppliers/${supplier.slug}`} className="hover:text-brand">
                            {supplier.exhibitorName}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">Public profile</p>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700">{supplier.industryName}</td>
                      <td className="px-4 py-3 align-top text-slate-700">{supplier.province || "Not published"}</td>
                      <td className="px-4 py-3 align-top text-slate-700">{supplier.city || "Not published"}</td>
                      <td className="px-4 py-3 align-top text-slate-700">{supplier.productsText || "Not published"}</td>
                      <td className="px-4 py-3 align-top text-slate-700">{supplier.keywordsText || "Not published"}</td>
                      <td className="px-4 py-3 align-top text-slate-700">{supplier.companySize || "Not published"}</td>
                      <td className="px-4 py-3 align-top text-slate-700">{supplier.companyType || "Not published"}</td>
                      <td className="px-4 py-3 align-top text-slate-700">{supplier.tradeModes.length ? supplier.tradeModes.join(", ") : "Not published"}</td>
                      <td className="px-4 py-3 align-top">
                        {sanitizeWebsiteAccess("FREE", supplier.websiteUrl) ? (
                          <Link href={supplier.websiteUrl || "#"} className="inline-flex items-center gap-1 text-brand">
                            Open <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-500">Paid plans</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <h3 className="text-base font-semibold text-slate-950">No published supplier profiles yet</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Results will appear after the manufacturer exhibition dataset is cleaned and imported.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#d8e0ea] bg-white px-4 py-3 text-sm text-slate-600">
            <span>
              Page {results.page} of {results.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Link className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50" href={pageHref(params, Math.max(1, page - 1))}>
                Previous
              </Link>
              <Link className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50" href={pageHref(params, page + 1)}>
                Next
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Facet({ title, param, items }: { title: string; param: string; items: Array<[string, number]> }) {
  return (
    <section className="rounded-md border border-[#cfd9e5] bg-white p-3">
      <h2 className="flex items-center justify-between text-sm font-medium text-slate-700">
        {title}
        <Filter className="h-4 w-4 text-brand" />
      </h2>
      <div className="mt-3 grid gap-2">
        {items.length ? (
          items.slice(0, 10).map(([label, count]) => (
            <Link key={`${param}-${label}`} href={`/database?${param}=${encodeURIComponent(label)}`} className="flex items-start justify-between gap-3 text-sm text-slate-700 hover:text-brand">
              <span className="flex min-w-0 items-start gap-2">
                <span className="mt-0.5 h-4 w-4 flex-none rounded bg-slate-200" aria-hidden />
                <h3 className="truncate text-sm font-normal">{label}</h3>
              </span>
              <span className="text-slate-500">{count.toLocaleString("en-US")}</span>
            </Link>
          ))
        ) : (
          <h3 className="text-sm font-normal text-slate-500">No data before import</h3>
        )}
      </div>
      {items.length > 10 ? (
        <button className="mx-auto mt-3 block rounded-md border border-[#cfd9e5] px-4 py-1.5 text-sm text-slate-600">
          Show More
        </button>
      ) : null}
    </section>
  );
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function pageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value || key === "page") continue;
    search.set(key, Array.isArray(value) ? value[0] || "" : value);
  }
  search.set("page", String(page));
  return `/database?${search.toString()}`;
}
