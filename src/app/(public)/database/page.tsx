import Link from "next/link";
import {
  ArrowDownUp,
  Download,
  Filter,
  Search,
  Sparkles,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SupplierRow } from "@/components/database/supplier-detail-modal";
import SupplierTableClient from "@/components/database/supplier-table-client";




import { createMetadata } from "@/config/seo";
import { type AppPlanCode } from "@/config/plans";

import { getCurrentAppUser } from "@/server/auth";
import { getDatabaseFacets, searchSuppliersForDatabase } from "@/server/suppliers";
import { clampSearchPage, searchPageSize } from "@/server/quota";

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

  // 获取当前登录用户的套餐（必须登录，middleware 已保证）
  const appUser = await getCurrentAppUser();
  const planCode = (appUser?.planCode ?? "FREE") as AppPlanCode;

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
  const rawPage = Math.max(1, Number(stringParam(params.page) || 1));
  const page = clampSearchPage(planCode, rawPage);
  const rawLimit = Number(stringParam(params.limit) || 0);
  const maxLimit = searchPageSize(planCode);
  const pageSize = rawLimit > 0 ? Math.min(rawLimit, maxLimit) : maxLimit;


  const [results, facets] = await Promise.all([
    searchSuppliersForDatabase({
      q, industry, province, city, companyType, companySize, companyNature,
      foundedYear, registeredCapital, tradeMode, page, pageSize,
    }).catch(() => ({ suppliers: [], total: 0, page: 1, pageSize, totalPages: 1 })),
    getDatabaseFacets().catch(() => ({
      industries: [], provinces: [], cities: [], companyTypes: [], companySizes: [],
      companyNatures: [], foundedYears: [], registeredCapitals: [], tradeModes: [], websiteCount: 0,
    })),
  ]);

  const activeFilters = [
    ["Industry", industry], ["Province", province], ["City", city],
    ["Company type", companyType], ["Company size", companySize],
    ["Company nature", companyNature], ["Founded year", foundedYear],
    ["Registered capital", registeredCapital], ["Trade mode", tradeMode],
  ].filter(([, value]) => value);
  const currentQuery = queryString(params);

  const planLabel = planCode === "FREE"
    ? "Free: 2 pages, 10 results/page, 5 profiles/month"
    : planCode === "STARTER"
    ? "Starter: unlimited search, 25 results/page"
    : planCode === "PRO"
    ? "Pro: unlimited search, 50 results/page"
    : "Team: unlimited search, 100 results/page";

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#f3f6f9]">
      <div className="border-b border-[#d8e0ea] bg-[#eef3f8]">
        <div className="flex min-h-14 w-full flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Supplier database</h1>
            <p className="text-sm text-slate-600">
              {results.total.toLocaleString("en-US")} public supplier profiles · public company data only
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              {planLabel}
            </span>
            {planCode === "FREE" && (
              <Link
                href="/pricing"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-gradient-to-r from-teal-600 to-teal-500 px-3 text-sm font-semibold text-white shadow-sm hover:from-teal-700 hover:to-teal-600"
              >
                <Sparkles className="h-3.5 w-3.5" /> Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid w-full lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="border-r border-[#d8e0ea] bg-[#f8fafc] lg:sticky lg:top-16 lg:h-[calc(100vh-65px)] lg:overflow-y-auto">
          <div className="border-b border-[#d8e0ea] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-teal-600">Advanced</span>
              <Link href="/database" className="text-slate-500 hover:text-slate-950">Clear</Link>
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
                <Filter className="h-4 w-4 text-teal-500" />
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

          {/* Table — Client Component handles modal state, locked fields and pagination paywall */}
          <SupplierTableClient
            suppliers={results.suppliers as SupplierRow[]}
            planCode={planCode}
            total={results.total}
            page={results.page}
            totalPages={results.totalPages}
            searchParams={params}
          />
        </section>
      </div>
    </div>
  );
}


// ── Facet components ────────────────────────────────────────────────────────

function Facet({ title, param, currentQuery, visibleLimit, items }: { title: string; param: string; currentQuery: string; visibleLimit: number; items: Array<[string, number]> }) {
  const visibleItems = items.slice(0, visibleLimit);
  const hasMore = visibleLimit < items.length;
  return (
    <section className="rounded-md border border-[#cfd9e5] bg-white p-3">
      <h2 className="flex items-center justify-between text-sm font-medium text-slate-700">
        {title}
        <Filter className="h-4 w-4 text-teal-500" />
      </h2>
      <div className="mt-3 grid gap-2">
        {visibleItems.length
          ? visibleItems.map(([label, count]) => <FacetLink key={`${param}-${label}`} param={param} currentQuery={currentQuery} label={label} count={count} />)
          : <h3 className="text-sm font-normal text-slate-500">No data</h3>}
      </div>
      {hasMore ? (
        <Link href={facetLimitHref(currentQuery, param, visibleLimit + 10)} className="mx-auto mt-3 block w-fit rounded-md border border-[#cfd9e5] px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Show More</Link>
      ) : visibleLimit > 10 && items.length > 10 ? (
        <Link href={facetLimitHref(currentQuery, param, 10)} className="mx-auto mt-3 block w-fit rounded-md border border-[#cfd9e5] px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Show Less</Link>
      ) : null}
    </section>
  );
}

function FacetLink({ param, currentQuery, label, count }: { param: string; currentQuery: string; label: string; count: number }) {
  const isSelected = new URLSearchParams(currentQuery).get(param) === label;

  return (
    <Link
      href={facetHref(currentQuery, param, label)}
      title={label}
      className={`grid min-w-0 grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-2 text-sm transition-colors ${
        isSelected ? "text-teal-600 font-semibold" : "text-slate-700 hover:text-teal-600"
      }`}
    >
      {isSelected ? (
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-teal-600 bg-teal-600 text-white" aria-hidden>
          <Check className="h-3 w-3 stroke-[3]" />
        </span>
      ) : (
        <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-slate-300 bg-white hover:border-teal-500 hover:bg-slate-50 transition-colors" aria-hidden />
      )}
      <h3 className="min-w-0 truncate text-sm leading-5">{label}</h3>
      <span className={`pl-2 text-right text-xs mt-0.5 ${isSelected ? "text-teal-600" : "text-slate-400"}`}>
        {count.toLocaleString("en-US")}
      </span>
    </Link>
  );
}

// ── Utility functions ───────────────────────────────────────────────────────

function facetHref(currentQuery: string, param: string, label: string) {
  const search = new URLSearchParams(currentQuery);
  const isSelected = search.get(param) === label;
  if (isSelected) {
    search.delete(param);
  } else {
    search.set(param, label);
  }
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

function hiddenSearchInputs(params: Record<string, string | string[] | undefined>, exclude: string[]) {
  const excluded = new Set(exclude);
  const values: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(params)) {
    if (!value || excluded.has(key)) continue;
    const normalized = Array.isArray(value) ? value[0] || "" : value;
    if (normalized) values.push([key, normalized]);
  }
  return values;
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

function queryString(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    search.set(key, Array.isArray(value) ? value[0] || "" : value);
  }
  return search.toString();
}
