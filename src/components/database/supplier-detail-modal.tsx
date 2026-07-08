"use client";

import { useState } from "react";
import Link from "next/link";
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
}: {
  suppliers: SupplierRow[];
  planCode: AppPlanCode;
}) {
  const [selected, setSelected] = useState<SupplierRow | null>(null);
  const canStarter = canViewStarterFields(planCode);
  const canPro = canViewProFields(planCode);

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
                <td colSpan={11} className="px-4 py-12 text-center">
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

      {/* Slide-out modal */}
      {selected && (
        <SupplierDetailModal
          supplier={selected}
          planCode={planCode}
          onClose={() => setSelected(null)}
        />
      )}
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
