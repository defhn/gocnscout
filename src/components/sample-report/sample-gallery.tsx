"use client";

import { ChevronLeft, ChevronRight, Download, ExternalLink, Eye, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

type PreviewPage = {
  src: string;
  pageLabel: string;
  title: string;
  caption: string;
};

const DECISION_249_PAGES: PreviewPage[] = [
  {
    src: "/samples/previews/decision-249-p01.webp",
    pageLabel: "Page 01 / 14",
    title: "Executive Cover & Critical Override",
    caption: "Immediate PAUSE verdict, 3 / 30 composite score, turnaround, and top distress triggers.",
  },
  {
    src: "/samples/previews/decision-249-p02.webp",
    pageLabel: "Page 02 / 14",
    title: "Executive Summary & Report Roadmap",
    caption: "4 core KPI tiles, full analyst summary, Mandatory Critical Override trigger, and 12-section index.",
  },
  {
    src: "/samples/previews/decision-249-p03.webp",
    pageLabel: "Page 03 / 14",
    title: "6-Dimension Radar & 0–5 Scorecard",
    caption: "Evidence-backed 0–5 scoring across legal status, ownership, debt, scale/ISO, IP, and digital pulse.",
  },
  {
    src: "/samples/previews/decision-249-p04.webp",
    pageLabel: "Page 04 / 14",
    title: "Statutory Corporate Profile & Branches",
    caption: "Verified USCC, customs code, simplified deregistration notice, 0 insured staff, and 3/3 cancelled branches.",
  },
  {
    src: "/samples/previews/decision-249-p05.webp",
    pageLabel: "Page 05 / 14",
    title: "Capital Contraction Curve & Changes",
    caption: "−81% registered capital drop from 52M RMB peak to 10M RMB (2019–2021) plus milestone registry filings.",
  },
  {
    src: "/samples/previews/decision-249-p06.webp",
    pageLabel: "Page 06 / 14",
    title: "Ownership & Shell-Migration Topology",
    caption: "Visual diagram mapping shareholders to 3 newly formed 1M RMB trading & printing shells sharing phone/email.",
  },
  {
    src: "/samples/previews/decision-249-p07.webp",
    pageLabel: "Page 07 / 14",
    title: "Related Entities & Officer Appointments",
    caption: "6 suspected related entities sharing contact footprints + Legal Rep's other cancelled & active companies.",
  },
  {
    src: "/samples/previews/decision-249-p08.webp",
    pageLabel: "Page 08 / 14",
    title: "Judicial Litigation & Debt Profile (12.4×)",
    caption: "123.6M RMB debt/mortgages vs. 10M RMB capital + chronological shift from plaintiff to loan-default defendant.",
  },
  {
    src: "/samples/previews/decision-249-p09.webp",
    pageLabel: "Page 09 / 14",
    title: "Chattel Mortgages & Dishonest Debtors",
    caption: "83.1M RMB active chattel mortgages, 65.27M RMB historical debtor orders, and deposit-seizure risk assessment.",
  },
  {
    src: "/samples/previews/decision-249-p10.webp",
    pageLabel: "Page 10 / 14",
    title: "Labor Arbitrations & Admin Penalties",
    caption: "7 labor arbitrations (unpaid wages, social insurance, injury) and 5 regulatory penalties (2017–2025).",
  },
  {
    src: "/samples/previews/decision-249-p11.webp",
    pageLabel: "Page 11 / 14",
    title: "Domestic ISO Certificates, IP & Standards",
    caption: "Decay chart, all 3 recent ISO certificates REVOKED, 58/58 patents terminated, and 4 national standards.",
  },
  {
    src: "/samples/previews/decision-249-p12.webp",
    pageLabel: "Page 12 / 14",
    title: "External Digital Footprint & Credit",
    caption: "5-channel audit (Website, Alibaba, 1688, BOSS Zhipin, Xiaohongshu/Douyin/Zhihu) + domestic credit ratings.",
  },
  {
    src: "/samples/previews/decision-249-p13.webp",
    pageLabel: "Page 13 / 14",
    title: "Buyer Action Playbook & RFQ Script",
    caption: "5 realistic China export safeguards plus 4 direct trap-testing questions to send the sales rep.",
  },
  {
    src: "/samples/previews/decision-249-p14.webp",
    pageLabel: "Page 14 / 14",
    title: "Independence, Scope & Analyst Desk",
    caption: "100% buyer-funded independence guarantee, clear desk-review boundaries, and direct analyst contact.",
  },
];

const IDENTITY_149_PAGES: PreviewPage[] = [
  {
    src: "/samples/previews/identity-149-p01.webp",
    pageLabel: "Page 01 / 09",
    title: "Executive Cover & Verdict",
    caption: "Clear Critical Risk — Pause determination for fast pre-sample supplier gatekeeping.",
  },
  {
    src: "/samples/previews/identity-149-p02.webp",
    pageLabel: "Page 02 / 09",
    title: "Executive Summary & Contents",
    caption: "4 key risk metrics, plain-English screening summary, Mandatory Critical Override, and report index.",
  },
  {
    src: "/samples/previews/identity-149-p03.webp",
    pageLabel: "Page 03 / 09",
    title: "4-Tier Scale & 3-Point Identity Audit",
    caption: "Structured screening across legal existence, basic enforcement/penalties, and B2B storefront consistency.",
  },
  {
    src: "/samples/previews/identity-149-p04.webp",
    pageLabel: "Page 04 / 09",
    title: "Full Chinese Statutory Profile",
    caption: "Verified USCC, customs code, active deregistration notice, 0 insured staff, and licensed business scope.",
  },
  {
    src: "/samples/previews/identity-149-p05.webp",
    pageLabel: "Page 05 / 09",
    title: "Capital Trajectory & Cancelled Branches",
    caption: "Registered capital drop (52M → 10M RMB) chart plus all 3 registered branch offices (all cancelled).",
  },
  {
    src: "/samples/previews/identity-149-p06.webp",
    pageLabel: "Page 06 / 09",
    title: "Historical Corporate Registry Filings",
    caption: "9 milestone corporate changes (2003–2021) tracing the factory's expansion and abrupt retrenchment.",
  },
  {
    src: "/samples/previews/identity-149-p07.webp",
    pageLabel: "Page 07 / 09",
    title: "Enforcement & Administrative Penalties",
    caption: "Active simplified deregistration, 40.5M RMB resumed enforcement, historical debtor flags, and 5 penalties.",
  },
  {
    src: "/samples/previews/identity-149-p08.webp",
    pageLabel: "Page 08 / 09",
    title: "B2B Check, Safeguards & Scope",
    caption: "Website/Alibaba/1688 findings, 5 practical China export safeguards, and explicit scope boundaries.",
  },
  {
    src: "/samples/previews/identity-149-p09.webp",
    pageLabel: "Page 09 / 09",
    title: "Independence, Upgrade Path & Desk",
    caption: "Buyer-funded independence statement, $249 deep-review upgrade details, legal notice, and contact desk.",
  },
];

export function SampleReportGallery() {
  const [activeTier, setActiveTier] = useState<"249" | "149">("249");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const pages = activeTier === "249" ? DECISION_249_PAGES : IDENTITY_149_PAGES;
  const pdfHref =
    activeTier === "249"
      ? "/samples/gocnscout-sample-decision-review-249.pdf"
      : "/samples/gocnscout-sample-identity-check-149.pdf";

  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % pages.length));
      if (e.key === "ArrowLeft") setLightboxIdx((prev) => (prev === null ? null : (prev - 1 + pages.length) % pages.length));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIdx, pages.length]);

  const activeLightboxPage = lightboxIdx !== null ? pages[lightboxIdx] : null;

  return (
    <div className="space-y-6">
      {/* Tier Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="grid grid-cols-2 gap-2 flex-1 max-w-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTier("249");
              setLightboxIdx(null);
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTier === "249"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>$249 Decision Review (All 14 Pages)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTier("149");
              setLightboxIdx(null);
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTier === "149"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>$149 Identity Check (All 9 Pages)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-xs font-bold !text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open Full PDF
          </a>
          <a
            href={pdfHref}
            download
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </a>
        </div>
      </div>

      {/* Complete Page-by-Page Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((item, idx) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setLightboxIdx(idx)}
            className="group text-left rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-lg hover:border-teal-400 transition-all flex flex-col cursor-pointer"
          >
            <div className="relative aspect-[210/297] w-full bg-slate-100 overflow-hidden border-b border-slate-200">
              <img
                src={item.src}
                alt={`${item.title} — ${item.pageLabel}`}
                loading="lazy"
                className="h-full w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 rounded-md bg-slate-950/85 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                {item.pageLabel}
              </span>
              <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 group-hover:bg-slate-950/25 transition-colors">
                <span className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-md transition-opacity">
                  <Eye className="h-3.5 w-3.5 text-teal-600" /> Zoom Full Page
                </span>
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-extrabold text-slate-950 group-hover:text-teal-700 transition-colors">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Lightbox */}
      {activeLightboxPage && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col rounded-2xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 bg-slate-50">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  {activeTier === "249" ? "$249 Buyer Decision Review" : "$149 Supplier Identity Check"} ·{" "}
                  {activeLightboxPage.pageLabel}
                </span>
                <h4 className="text-sm font-extrabold text-slate-950">{activeLightboxPage.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-teal-600 px-3 text-xs font-bold !text-white hover:bg-teal-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Full PDF
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxIdx(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-auto bg-slate-200/70 p-4 flex items-start justify-center">
              <img
                src={activeLightboxPage.src}
                alt={activeLightboxPage.title}
                className="max-w-full h-auto rounded-lg shadow-lg border border-slate-300 bg-white"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-600">
              <button
                type="button"
                onClick={() => setLightboxIdx((lightboxIdx - 1 + pages.length) % pages.length)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Page
              </button>
              <span className="hidden sm:inline text-center max-w-md truncate">{activeLightboxPage.caption}</span>
              <button
                type="button"
                onClick={() => setLightboxIdx((lightboxIdx + 1) % pages.length)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Next Page <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
