"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Lock,
  Globe,
  MapPin,
  Building2,
  Calendar,
  BarChart3,
  Layers,
  Tag,
  Award,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { getExhibitionTierLabel } from "@/config/field-policy";
import { canViewStarterFields, canViewProFields } from "@/config/plans";
import type { AppPlanCode } from "@/config/plans";


// ─── Shared types ───────────────────────────────────────────────────────────

export type SupplierSignal = {
  innovationAward: boolean;
  brandExhibitor: boolean;
  customsCertifiedExhibitor: boolean;
  highTechEnterprise: boolean;
  hasAnyAward: boolean;
  hasCertificationSignal: boolean;
} | null;

export type SupplierRow = {
  id: string;
  slug: string;
  exhibitorName: string;
  industryName: string;
  province: string | null;
  city: string | null;
  websiteUrl: string | null;
  productsText: string | null;
  keywordsText: string | null;
  foundedYear: number | null;
  registeredCapital: string | null;
  companySize: string | null;
  companyType: string | null;
  companyNature: string | null;
  tradeModes: string[];
  exhibitionSessionCount: number | null;
  signals: SupplierSignal;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  new: "bg-slate-100 text-slate-600",
  rising: "bg-blue-50 text-blue-700",
  active: "bg-teal-50 text-teal-700",
  established: "bg-amber-50 text-amber-700",
  veteran: "bg-purple-50 text-purple-700",
};

const TIER_ICONS: Record<string, string> = {
  new: "🆕",
  rising: "📈",
  active: "⭐",
  established: "🔥",
  veteran: "💎",
};

// ─── SupplierTable (Client Component — renders table + modal) ────────────────

export function SupplierTable({
  suppliers,
  planCode,
  total,
  page,
  totalPages,
  searchParams,
}: {
  suppliers: SupplierRow[];
  planCode: AppPlanCode;
  total: number;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [selected, setSelected] = useState<SupplierRow | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const router = useRouter();
  const canStarter = canViewStarterFields(planCode);
  const canPro = canViewProFields(planCode);

  // Helper to generate target URL
  const getPageHref = (targetPage: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (!value || key === "page" || key.endsWith("Limit")) continue;
      search.set(key, Array.isArray(value) ? value[0] || "" : value);
    }
    // Also retain Limit params
    for (const [key, value] of Object.entries(searchParams)) {
      if (key.endsWith("Limit") && value) {
        search.set(key, Array.isArray(value) ? value[0] || "" : value);
      }
    }
    search.set("page", String(targetPage));
    return `/database?${search.toString()}`;
  };

  // Safe navigation interceptor
  const handlePageChange = (targetPage: number, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    const clampedPage = Math.max(1, Math.min(targetPage, totalPages));
    
    // 免费版翻到第 3 页或以上，拦截并显示付费墙
    if (planCode === "FREE" && clampedPage >= 3) {
      setShowPaywall(true);
      return;
    }
    
    router.push(getPageHref(clampedPage));
  };

  return (
    <>
      <div className="overflow-x-auto bg-white">
        <table className="min-w-[1380px] w-full table-fixed border-collapse text-left text-sm">
          <thead className="border-b border-[#d8e0ea] bg-[#fbfcfe] text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-[210px] px-4 py-3">Supplier</th>
              <th className="w-[130px] px-4 py-3">Industry</th>
              <th className="w-[100px] px-4 py-3">Province</th>
              <th className="w-[95px] px-4 py-3">City</th>
              <th className="w-[200px] px-4 py-3">Main products</th>
              <th className="w-[180px] px-4 py-3">Keywords</th>
              <th className="w-[110px] px-4 py-3">Company size</th>
              <th className="w-[120px] px-4 py-3">Company type</th>
              <th className="w-[130px] px-4 py-3">Trade mode</th>
              <th className="w-[160px] px-4 py-3">Exhibition</th>
              <th className="w-[140px] px-4 py-3">Signals</th>
              <th className="w-[100px] px-4 py-3">Website</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ebf2]">
            {suppliers.length ? (
              suppliers.map((supplier) => {
                const { label: tierLabel, tier } = getExhibitionTierLabel(
                  supplier.exhibitionSessionCount
                );
                return (
                  <tr
                    key={supplier.id}
                    className="h-[105px] cursor-pointer hover:bg-[#f5f8fc] transition-colors"
                    onClick={() => setSelected(supplier)}
                  >
                    {/* Supplier name */}
                    <td className="h-[105px] px-4 py-2 align-top">
                      <div className="max-h-[89px] overflow-hidden">
                        <p className="font-semibold text-slate-950 leading-5 hover:text-teal-600">
                          {supplier.exhibitorName}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {[supplier.city, supplier.province]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </div>
                    </td>

                    <DataCell>{supplier.industryName}</DataCell>
                    <DataCell>{supplier.province || "—"}</DataCell>
                    <DataCell>{supplier.city || "—"}</DataCell>
                    <DataCell title={supplier.productsText || undefined}>{supplier.productsText || "—"}</DataCell>
                    <DataCell title={supplier.keywordsText || undefined}>{supplier.keywordsText || "—"}</DataCell>
                    <DataCell>{supplier.companySize || "—"}</DataCell>
                    <DataCell>{supplier.companyType || "—"}</DataCell>

                    {/* Trade mode — STARTER+ */}
                    <td className="h-[105px] px-4 py-2 align-middle">
                      {canStarter ? (
                        <div className="flex flex-col gap-1">
                          {supplier.tradeModes.length > 0 ? (
                            supplier.tradeModes.map((m) => (
                              <span
                                key={m}
                                className="inline-block rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
                              >
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      ) : (
                        <LockedField label="Trade mode" plan="STARTER" />
                      )}
                    </td>

                    {/* Exhibition — STARTER: label; PRO+: label + count */}
                    <td className="h-[105px] px-4 py-2 align-middle">
                      {canStarter ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${TIER_COLORS[tier]}`}
                          >
                            {TIER_ICONS[tier]} {tierLabel}
                          </span>
                          {canPro ? (
                            <span className="text-xs text-slate-500">
                              {supplier.exhibitionSessionCount ?? 0} exhibitions
                            </span>
                          ) : (
                            <LockedField
                              label="Count"
                              plan="PRO"
                              compact
                            />
                          )}
                        </div>
                      ) : (
                        <LockedField label="Exhibition" plan="STARTER" />
                      )}
                    </td>

                    {/* Sourcing Signals — PRO+ */}
                    <td className="h-[105px] px-4 py-2 align-middle">
                      {canPro && supplier.signals ? (
                        <div className="flex flex-col gap-1">
                          {supplier.signals.innovationAward && (
                            <span className="inline-block rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Innovation
                            </span>
                          )}
                          {supplier.signals.brandExhibitor && (
                            <span className="inline-block rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                              Brand
                            </span>
                          )}
                          {supplier.signals.customsCertifiedExhibitor && (
                            <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Certified
                            </span>
                          )}
                          {supplier.signals.highTechEnterprise && (
                            <span className="inline-block rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                              High-Tech
                            </span>
                          )}
                          {!supplier.signals.hasAnyAward &&
                            !supplier.signals.hasCertificationSignal && (
                              <span className="text-xs text-slate-400">
                                None
                              </span>
                            )}
                        </div>
                      ) : (
                        <LockedField label="Signals" plan="PRO" />
                      )}
                    </td>

                    {/* Website — STARTER+ */}
                    <td className="h-[105px] px-4 py-2 align-middle">
                      {canStarter && supplier.websiteUrl ? (
                        <a
                          href={supplier.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 text-xs"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : !canStarter ? (
                        <LockedField label="Website" plan="STARTER" />
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center">
                  <p className="text-base font-semibold text-slate-950">
                    No results found
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Try adjusting your filters or search query.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d8e0ea] bg-white px-4 py-3 text-sm text-slate-600">
        <span>Page {page} of {totalPages} · {total.toLocaleString("en-US")} results</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {getClientPageNumbers(page, totalPages).map((item, index) =>
              item === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  aria-current={item === page ? "page" : undefined}
                  className={`min-w-8 rounded-md border px-2.5 py-1.5 text-center ${
                    item === page
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-border hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const target = Number(formData.get("page"));
              if (target >= 1 && target <= totalPages) {
                handlePageChange(target);
              }
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="database-page-jump" className="text-slate-500">
              Go to
            </label>
            <input
              id="database-page-jump"
              name="page"
              type="number"
              min={1}
              max={totalPages}
              defaultValue={page}
              className="h-8 w-20 rounded-md border border-border px-2 text-sm text-slate-700"
            />
            <button type="submit" className="rounded-md border border-border px-3 py-1.5 hover:bg-slate-50">
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Slide-out modal */}
      {selected && (
        <SupplierDetailModal
          supplier={selected}
          planCode={planCode}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Paywall popup */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </>
  );
}

// ─── SupplierDetailModal ─────────────────────────────────────────────────────

function SupplierDetailModal({
  supplier,
  planCode,
  onClose,
}: {
  supplier: SupplierRow;
  planCode: AppPlanCode;
  onClose: () => void;
}) {
  const canStarter = canViewStarterFields(planCode);
  const canPro = canViewProFields(planCode);
  const { label: tierLabel, tier } = getExhibitionTierLabel(
    supplier.exhibitionSessionCount
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-[520px] overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
              {supplier.industryName}
            </span>
            <h2 className="mt-2 text-lg font-bold text-slate-950 leading-tight">
              {supplier.exhibitorName}
            </h2>
            {(supplier.city || supplier.province) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {[supplier.city, supplier.province].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Company info grid */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Company Profile
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoCell
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Company Type"
                value={supplier.companyType}
              />
              <InfoCell
                icon={<BarChart3 className="h-3.5 w-3.5" />}
                label="Company Size"
                value={supplier.companySize}
              />
              <InfoCell
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Founded Year"
                value={supplier.foundedYear?.toString()}
              />
              <InfoCell
                icon={<Layers className="h-3.5 w-3.5" />}
                label="Registered Capital"
                value={supplier.registeredCapital}
              />
            </div>
          </section>

          {/* Trade mode */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Trade Mode
            </h3>
            {canStarter ? (
              supplier.tradeModes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {supplier.tradeModes.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Not published</p>
              )
            ) : (
              <ModalLockedBadge text="Trade mode locked" plan="STARTER" />
            )}
          </section>

          {/* Exhibition */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Exhibition Track
            </h3>
            {canStarter ? (
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${TIER_COLORS[tier]}`}
                >
                  {TIER_ICONS[tier]} {tierLabel}
                </span>
                {canPro ? (
                  <span className="text-sm text-slate-500">
                    {supplier.exhibitionSessionCount ?? 0} sourcing exhibitions
                  </span>
                ) : (
                  <ModalLockedBadge
                    text="Exact count locked"
                    plan="PRO"
                    compact
                  />
                )}
              </div>
            ) : (
              <ModalLockedBadge text="Exhibition data locked" plan="STARTER" />
            )}
          </section>

          {/* Sourcing signals */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Sourcing Signals
            </h3>
            {canPro && supplier.signals ? (
              <div className="flex flex-wrap gap-2">
                {supplier.signals.innovationAward && (
                  <SignalBadge label="Innovation Award" color="amber" />
                )}
                {supplier.signals.brandExhibitor && (
                  <SignalBadge label="Brand Exhibitor" color="teal" />
                )}
                {supplier.signals.customsCertifiedExhibitor && (
                  <SignalBadge label="Customs Certified" color="blue" />
                )}
                {supplier.signals.highTechEnterprise && (
                  <SignalBadge label="High-Tech Enterprise" color="purple" />
                )}
                {!supplier.signals.hasAnyAward &&
                  !supplier.signals.hasCertificationSignal && (
                    <p className="text-sm text-slate-400">
                      No signals recorded
                    </p>
                  )}
              </div>
            ) : (
              <ModalLockedBadge text="Sourcing signals locked" plan="PRO" />
            )}
          </section>

          {/* Products */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Main Products
            </h3>
            <p className="text-sm leading-6 text-slate-700">
              {supplier.productsText || "Not published"}
            </p>
          </section>

          {/* Keywords */}
          {supplier.keywordsText && (
            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {supplier.keywordsText
                  .split(/[,，、]/)
                  .slice(0, 12)
                  .map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                    >
                      <Tag className="mr-1 inline h-3 w-3" />
                      {kw.trim()}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {/* Website */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Official Website
            </h3>
            {canStarter && supplier.websiteUrl ? (
              <a
                href={supplier.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Visit Website
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : !canStarter ? (
              <ModalLockedBadge text="Website locked" plan="STARTER" />
            ) : (
              <p className="text-sm text-slate-400">No website published</p>
            )}
          </section>
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Link
            href={`/suppliers/${supplier.slug}`}
            className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium !text-slate-700 hover:!text-slate-950 hover:bg-slate-50 transition-colors shadow-sm"
          >
            View Full Profile
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          {!canPro && (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white hover:bg-slate-800 hover:opacity-90 transition-all shadow-md"
            >
              <Award className="h-4 w-4 text-white" />
              {canStarter
                ? "Upgrade to Pro — Unlock More"
                : "Upgrade to Starter — Unlock Fields"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function DataCell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <td className="h-[105px] px-4 py-2 align-top text-slate-700" title={title}>
      <div className="line-clamp-3 overflow-hidden text-xs leading-5">
        {children}
      </div>
    </td>
  );
}

function LockedField({
  label,
  plan,
  compact = false,
}: {
  label: string;
  plan: string;
  compact?: boolean;
}) {
  const isPro = plan === "PRO" || plan.startsWith("PRO");
  const bgClass = isPro ? "bg-indigo-600 hover:bg-indigo-700" : "bg-teal-600 hover:bg-teal-700";
  return (
    <Link
      href="/pricing"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgClass} !text-white hover:!text-white transition-all shadow-sm group`}
      title={`Upgrade to ${plan} to unlock ${label}`}
    >
      <Lock className="h-3 w-3 !text-white group-hover:scale-110 transition-transform" />
      {!compact && (
        <span className="text-[9px] font-extrabold uppercase tracking-wider !text-white">
          {plan}
        </span>
      )}
    </Link>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function SignalBadge({ label, color }: { label: string; color: string }) {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${colorMap[color] ?? colorMap.teal}`}
    >
      <Award className="h-3 w-3" />
      {label}
    </span>
  );
}

function ModalLockedBadge({
  text,
  plan,
  compact = false,
}: {
  text: string;
  plan: string;
  compact?: boolean;
}) {
  const isPro = plan === "PRO" || plan.startsWith("PRO");
  const bgClass = isPro ? "bg-indigo-600 hover:bg-indigo-700" : "bg-teal-600 hover:bg-teal-700";
  return (
    <Link
      href="/pricing"
      className={`inline-flex items-center gap-2 rounded-full ${bgClass} !text-white hover:!text-white transition-colors shadow-sm ${compact ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm font-semibold"}`}
    >
      <Lock className="h-3.5 w-3.5 shrink-0 !text-white" />
      <span>{text}</span>
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide !text-white">
        {plan}+
      </span>
    </Link>
  );
}

// ─── Pagination helpers ───────────────────────────────────────────────────────

function getClientPageNumbers(currentPage: number, totalPages: number): Array<number | "..."> {
  const pages = new Set<number>();
  
  // 默认一直显示到第 10 页（若总页数够的话）
  const maxInitial = Math.min(10, totalPages);
  for (let i = 1; i <= maxInitial; i++) {
    pages.add(i);
  }

  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage - 1);
  pages.add(currentPage);
  pages.add(currentPage + 1);

  const validPages = [...pages].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);
  const result: Array<number | "..."> = [];
  for (const item of validPages) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && item - previous > 1) {
      result.push("...");
    }
    result.push(item);
  }
  return result;
}

// ─── Paywall modal ────────────────────────────────────────────────────────────

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-4">
          <ShieldAlert className="h-7 w-7 text-teal-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-950">Search Limit Reached</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Free search is limited to the first 2 pages (20 records). Upgrade to Starter to unlock unlimited searches and access premium fields like Website, Trade Mode, and Exhibition counts.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2.5 text-sm font-semibold !text-white transition-colors shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Starter
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

