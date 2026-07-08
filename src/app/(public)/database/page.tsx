import Link from "next/link";
import type { ReactNode } from "react";
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
    searchSuppliers({ q, industry, province, city, companyType, companySize, companyNature, foundedYear, registeredCapital, tradeMode, page, pageSize: 10 }).catch(() => ({
      suppliers: [],
      total: 0,
      page: 1,
      pageSize: 10,
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
  const currentQuery = queryString(params);

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#f3f6f9]">
      <div className="border-b border-[#d8e0ea] bg-[#eef3f8]">
        <div className="flex min-h-14 w-full flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
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

      <div className="grid w-full lg:grid-cols-[292px_minmax(0,1fr)]">
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
            <Facet title="Industry" param="industry" currentQuery={currentQuery} visibleLimit={facetLimit(params, "industry")} items={facets.industries.map((i) => [i.industryName, i._count._all])} />
            <Facet title="Province" param="province" currentQuery={currentQuery} visibleLimit={facetLimit(params, "province")} items={facets.provinces.filter((i) => i.province).map((i) => [i.province || "", i._count._all])} />
            <Facet title="City" param="city" currentQuery={currentQuery} visibleLimit={facetLimit(params, "city")} items={facets.cities.filter((i) => i.city).map((i) => [i.city || "", i._count._all])} />
            <Facet title="Company Size" param="companySize" currentQuery={currentQuery} visibleLimit={facetLimit(params, "companySize")} items={facets.companySizes.filter((i) => i.companySize).map((i) => [i.companySize || "", i._count._all])} />
            <Facet title="Company Type" param="companyType" currentQuery={currentQuery} visibleLimit={facetLimit(params, "companyType")} items={facets.companyTypes.filter((i) => i.companyType).map((i) => [i.companyType || "", i._count._all])} />
            <Facet title="Trade Mode" param="tradeMode" currentQuery={currentQuery} visibleLimit={facetLimit(params, "tradeMode")} items={facets.tradeModes.map((i) => [i.label, i.count])} />
            <Facet title="Company Nature" param="companyNature" currentQuery={currentQuery} visibleLimit={facetLimit(params, "companyNature")} items={facets.companyNatures.filter((i) => i.companyNature).map((i) => [i.companyNature || "", i._count._all])} />
            <Facet title="Founded Year" param="foundedYear" currentQuery={currentQuery} visibleLimit={facetLimit(params, "foundedYear")} items={facets.foundedYears.filter((i) => i.foundedYear).map((i) => [String(i.foundedYear), i._count._all])} />
            <Facet title="Registered Capital" param="registeredCapital" currentQuery={currentQuery} visibleLimit={facetLimit(params, "registeredCapital")} items={facets.registeredCapitals.filter((i) => i.registeredCapital).map((i) => [i.registeredCapital || "", i._count._all])} />
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
            <table className="min-w-[1740px] w-full table-fixed border-collapse text-left text-sm">
              <thead className="border-b border-[#d8e0ea] bg-[#fbfcfe] text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[230px] px-4 py-3">Supplier</th>
                  <th className="w-[140px] px-4 py-3">Industry</th>
                  <th className="w-[105px] px-4 py-3">Province</th>
                  <th className="w-[105px] px-4 py-3">City</th>
                  <th className="w-[220px] px-4 py-3">Main products</th>
                  <th className="w-[190px] px-4 py-3">Keywords</th>
                  <th className="w-[120px] px-4 py-3">Company size</th>
                  <th className="w-[130px] px-4 py-3">Company type</th>
                  <th className="w-[140px] px-4 py-3">Trade mode</th>
                  <th className="w-[120px] px-4 py-3">Contact</th>
                  <th className="w-[120px] px-4 py-3">Phone</th>
                  <th className="w-[120px] px-4 py-3">Email</th>
                  <th className="w-[150px] px-4 py-3">Address</th>
                  <th className="w-[120px] px-4 py-3">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ebf2]">
                {results.suppliers.length ? (
                  results.suppliers.map((supplier) => (
                    <tr key={supplier.id} className="h-[104px] hover:bg-[#f8fafc]">
                      <td className="h-[104px] px-4 py-2 align-top">
                        <div className="max-h-[88px] overflow-hidden leading-5">
                          <h3 className="font-semibold text-slate-950">
                            <Link href={`/suppliers/${supplier.slug}`} className="hover:text-brand">
                              {supplier.exhibitorName}
                            </Link>
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">Public profile</p>
                        </div>
                      </td>
                      <DataCell>{supplier.industryName}</DataCell>
                      <DataCell>{supplier.province || "Not published"}</DataCell>
                      <DataCell>{supplier.city || "Not published"}</DataCell>
                      <DataCell>{supplier.productsText || "Not published"}</DataCell>
                      <DataCell>{supplier.keywordsText || "Not published"}</DataCell>
                      <DataCell>{supplier.companySize || "Not published"}</DataCell>
                      <DataCell>{supplier.companyType || "Not published"}</DataCell>
                      <DataCell>{supplier.tradeModes.length ? supplier.tradeModes.join(", ") : "Not published"}</DataCell>
                      <LockedCell label="Contact locked" />
                      <LockedCell label="Phone locked" />
                      <LockedCell label="Email locked" />
                      <LockedCell label="Address locked" />
                      <td className="h-[104px] px-4 py-2 align-top">
                        {sanitizeWebsiteAccess("FREE", supplier.websiteUrl) ? (
                          <Link href={supplier.websiteUrl || "#"} className="inline-flex items-center gap-1 text-brand">
                            Open <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <LockedField label="Website locked" />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center">
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d8e0ea] bg-white px-4 py-3 text-sm text-slate-600">
            <span>
              Page {results.page} of {results.totalPages} - {results.total.toLocaleString("en-US")} results
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Link prefetch={false} className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50" href={pageHref(params, Math.max(1, page - 1))}>
                Previous
              </Link>
              <div className="flex items-center gap-1">
                {pageNumbers(results.page, results.totalPages).map((item, index) =>
                  item === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                      ...
                    </span>
                  ) : (
                    <Link
                      key={item}
                      prefetch={false}
                      href={pageHref(params, item)}
                      aria-current={item === results.page ? "page" : undefined}
                      className={`min-w-8 rounded-md border px-2.5 py-1.5 text-center ${item === results.page ? "border-slate-900 bg-slate-900 text-white" : "border-border hover:bg-slate-50"}`}
                    >
                      {item}
                    </Link>
                  ),
                )}
              </div>
              <Link prefetch={false} className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50" href={pageHref(params, Math.min(results.totalPages, page + 1))}>
                Next
              </Link>
              <form className="ml-2 flex items-center gap-2">
                {hiddenSearchInputs(params, ["page"]).map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ))}
                <label className="text-slate-500" htmlFor="database-page-jump">
                  Go to
                </label>
                <input
                  id="database-page-jump"
                  name="page"
                  type="number"
                  min={1}
                  max={results.totalPages}
                  defaultValue={results.page}
                  className="h-8 w-20 rounded-md border border-border px-2 text-sm text-slate-700"
                />
                <button type="submit" className="h-8 rounded-md border border-border px-3 text-sm hover:bg-slate-50">
                  Go
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DataCell({ children }: { children: ReactNode }) {
  return (
    <td className="h-[104px] px-4 py-2 align-top text-slate-700">
      <div className="max-h-[88px] overflow-hidden leading-5">{children}</div>
    </td>
  );
}

function LockedCell({ label }: { label: string }) {
  return (
    <td className="h-[104px] px-4 py-2 align-top">
      <LockedField label={label} />
    </td>
  );
}

function LockedField({ label }: { label: string }) {
  return (
    <Link
      href="/pricing"
      className="inline-flex max-w-full flex-col rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs leading-4 text-amber-900 hover:border-amber-300 hover:bg-amber-100"
      title="Upgrade to view this field"
    >
      <span className="font-medium">{label}</span>
      <span className="text-amber-700">Upgrade to view</span>
    </Link>
  );
}

function Facet({ title, param, currentQuery, visibleLimit, items }: { title: string; param: string; currentQuery: string; visibleLimit: number; items: Array<[string, number]> }) {
  const visibleItems = items.slice(0, visibleLimit);
  const hasMore = visibleLimit < items.length;

  return (
    <section className="rounded-md border border-[#cfd9e5] bg-white p-3">
      <h2 className="flex items-center justify-between text-sm font-medium text-slate-700">
        {title}
        <Filter className="h-4 w-4 text-brand" />
      </h2>
      <div className="mt-3 grid gap-2">
        {visibleItems.length ? visibleItems.map(([label, count]) => <FacetLink key={`${param}-${label}`} param={param} currentQuery={currentQuery} label={label} count={count} />) : <h3 className="text-sm font-normal text-slate-500">No data before import</h3>}
      </div>
      {hasMore ? (
        <Link href={facetLimitHref(currentQuery, param, visibleLimit + 10)} className="mx-auto mt-3 block w-fit rounded-md border border-[#cfd9e5] px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
          Show More
        </Link>
      ) : visibleLimit > 10 && items.length > 10 ? (
        <Link href={facetLimitHref(currentQuery, param, 10)} className="mx-auto mt-3 block w-fit rounded-md border border-[#cfd9e5] px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
          Show Less
        </Link>
      ) : null}
    </section>
  );
}

function FacetLink({ param, currentQuery, label, count }: { param: string; currentQuery: string; label: string; count: number }) {
  return (
    <Link
      href={facetHref(currentQuery, param, label)}
      title={label}
      className="grid min-w-0 grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-2 text-sm text-slate-700 hover:text-brand"
    >
      <span className="mt-0.5 h-4 w-4 rounded bg-slate-200" aria-hidden />
      <h3 className="min-w-0 truncate text-sm font-normal leading-5">{label}</h3>
      <span className="pl-2 text-right text-slate-500">{count.toLocaleString("en-US")}</span>
    </Link>
  );
}

function facetHref(currentQuery: string, param: string, label: string) {
  const search = new URLSearchParams(currentQuery);
  search.set(param, label);
  search.delete("page");
  return `/database?${search.toString()}`;
}

function facetLimitHref(currentQuery: string, param: string, limit: number) {
  const search = new URLSearchParams(currentQuery);
  search.set(`${param}Limit`, String(Math.max(10, limit)));
  search.delete("page");
  return `/database?${search.toString()}`;
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function facetLimit(params: Record<string, string | string[] | undefined>, param: string) {
  const value = Number(stringParam(params[`${param}Limit`]));
  if (!Number.isFinite(value)) return 10;
  return Math.min(100, Math.max(10, Math.floor(value / 10) * 10));
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

function pageNumbers(currentPage: number, totalPages: number): Array<number | "..."> {
  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const validPages = [...pages].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);
  const result: Array<number | "..."> = [];
  for (const item of validPages) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && item - previous > 1) result.push("...");
    result.push(item);
  }
  return result;
}

function hiddenSearchInputs(params: Record<string, string | string[] | undefined>, exclude: string[] = []) {
  const excluded = new Set(exclude);
  return Object.entries(params)
    .filter(([key, value]) => value && !excluded.has(key))
    .map(([key, value]) => [key, Array.isArray(value) ? value[0] || "" : value || ""] as const)
    .filter(([, value]) => value);
}

function queryString(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    search.set(key, Array.isArray(value) ? value[0] || "" : value);
  }
  return search.toString();
}
