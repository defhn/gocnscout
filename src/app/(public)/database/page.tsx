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
            <Facet title="Industry" param="industry" currentQuery={currentQuery} items={facets.industries.map((i) => [i.industryName, i._count._all])} />
            <Facet title="Province" param="province" currentQuery={currentQuery} items={facets.provinces.filter((i) => i.province).map((i) => [i.province || "", i._count._all])} />
            <Facet title="City" param="city" currentQuery={currentQuery} items={facets.cities.filter((i) => i.city).map((i) => [i.city || "", i._count._all])} />
            <Facet title="Company Size" param="companySize" currentQuery={currentQuery} items={facets.companySizes.filter((i) => i.companySize).map((i) => [i.companySize || "", i._count._all])} />
            <Facet title="Company Type" param="companyType" currentQuery={currentQuery} items={facets.companyTypes.filter((i) => i.companyType).map((i) => [i.companyType || "", i._count._all])} />
            <Facet title="Trade Mode" param="tradeMode" currentQuery={currentQuery} items={facets.tradeModes.map((i) => [i.label, i.count])} />
            <Facet title="Company Nature" param="companyNature" currentQuery={currentQuery} items={facets.companyNatures.filter((i) => i.companyNature).map((i) => [i.companyNature || "", i._count._all])} />
            <Facet title="Founded Year" param="foundedYear" currentQuery={currentQuery} items={facets.foundedYears.filter((i) => i.foundedYear).map((i) => [String(i.foundedYear), i._count._all])} />
            <Facet title="Registered Capital" param="registeredCapital" currentQuery={currentQuery} items={facets.registeredCapitals.filter((i) => i.registeredCapital).map((i) => [i.registeredCapital || "", i._count._all])} />
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

          <div className="flex items-center justify-between border-t border-[#d8e0ea] bg-white px-4 py-3 text-sm text-slate-600">
            <span>
              Page {results.page} of {results.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Link prefetch={false} className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50" href={pageHref(params, Math.max(1, page - 1))}>
                Previous
              </Link>
              <Link prefetch={false} className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50" href={pageHref(params, page + 1)}>
                Next
              </Link>
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

function Facet({ title, param, currentQuery, items }: { title: string; param: string; currentQuery: string; items: Array<[string, number]> }) {
  const firstItems = items.slice(0, 10);
  const moreItems = items.slice(10);

  return (
    <section className="rounded-md border border-[#cfd9e5] bg-white p-3">
      <h2 className="flex items-center justify-between text-sm font-medium text-slate-700">
        {title}
        <Filter className="h-4 w-4 text-brand" />
      </h2>
      <div className="mt-3 grid gap-2">
        {firstItems.length ? firstItems.map(([label, count]) => <FacetLink key={`${param}-${label}`} param={param} currentQuery={currentQuery} label={label} count={count} />) : <h3 className="text-sm font-normal text-slate-500">No data before import</h3>}
      </div>
      {moreItems.length ? (
        <div className="group mt-2">
          <input id={`facet-${param}`} type="checkbox" className="peer sr-only" />
          <div className="hidden gap-2 pt-2 peer-checked:grid">
            {moreItems.map(([label, count]) => <FacetLink key={`${param}-${label}`} param={param} currentQuery={currentQuery} label={label} count={count} />)}
          </div>
          <label htmlFor={`facet-${param}`} className="mx-auto mt-3 block w-fit cursor-pointer rounded-md border border-[#cfd9e5] px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            <span className="peer-checked:hidden">Show More</span>
            <span className="hidden peer-checked:inline">Show Less</span>
          </label>
        </div>
      ) : null}
    </section>
  );
}

function FacetLink({ param, currentQuery, label, count }: { param: string; currentQuery: string; label: string; count: number }) {
  return (
    <Link href={facetHref(currentQuery, param, label)} className="flex items-start justify-between gap-3 text-sm text-slate-700 hover:text-brand">
      <span className="flex min-w-0 items-start gap-2">
        <span className="mt-0.5 h-4 w-4 flex-none rounded bg-slate-200" aria-hidden />
        <h3 className="truncate text-sm font-normal">{label}</h3>
      </span>
      <span className="text-slate-500">{count.toLocaleString("en-US")}</span>
    </Link>
  );
}

function facetHref(currentQuery: string, param: string, label: string) {
  const search = new URLSearchParams(currentQuery);
  search.set(param, label);
  search.delete("page");
  return `/database?${search.toString()}`;
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

function queryString(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    search.set(key, Array.isArray(value) ? value[0] || "" : value);
  }
  return search.toString();
}
