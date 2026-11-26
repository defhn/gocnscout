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
    src: "/samples/previews/decision-249-p01-cover.webp",
    pageLabel: "Page 01 / 14",
    title: "Executive Cover & Critical Override",
    caption: "Immediate PAUSE determination, 3 / 30 signal score, turnaround, and top distress triggers.",
  },
  {
    src: "/samples/previews/decision-249-p03-scorecard.webp",
    pageLabel: "Page 03 / 14",
    title: "6-Dimension Radar & 0–5 Scorecard",
    caption: "Evidence-backed 0–5 scoring across legal status, ownership, debt, scale/ISO, IP, and digital pulse.",
  },
  {
    src: "/samples/previews/decision-249-p05-capital.webp",
    pageLabel: "Page 05 / 14",
    title: "Registered Capital Contraction Curve",
    caption: "Visualizing the −81% registered capital drop from 52M RMB peak down to 10M RMB (2019–2021).",
  },
  {
    src: "/samples/previews/decision-249-p06-topology.webp",
    pageLabel: "Page 06 / 14",
    title: "Ownership & Shell-Migration Map",
    caption: "Exposing 3 newly registered 1M RMB trading & printing shells sharing identical phone/email records.",
  },
  {
    src: "/samples/previews/decision-249-p08-debt.webp",
    pageLabel: "Page 08 / 14",
    title: "Debt vs. Capital (12.4×) & Litigation",
    caption: "123.6M RMB in active enforcement and chattel mortgages vs. 10M RMB remaining capital.",
  },
  {
    src: "/samples/previews/decision-249-p13-playbook.webp",
    pageLabel: "Page 13 / 14",
    title: "Buyer Playbook & RFQ Script",
    caption: "5 realistic China export safeguards plus 4 direct trap-testing questions for the sales rep.",
  },
];

const IDENTITY_149_PAGES: PreviewPage[] = [
  {
    src: "/samples/previews/identity-149-p01-cover.webp",
    pageLabel: "Page 01 / 09",
    title: "Executive Cover & Verdict",
    caption: "Clear Critical Risk — Pause determination for fast pre-sample supplier gatekeeping.",
  },
  {
    src: "/samples/previews/identity-149-p03-scale.webp",
    pageLabel: "Page 03 / 09",
    title: "4-Tier Scale & 3-Point Identity Audit",
    caption: "Structured screening across legal existence, basic enforcement/penalties, and B2B consistency.",
  },
  {
    src: "/samples/previews/identity-149-p04-registry.webp",
    pageLabel: "Page 04 / 09",
    title: "Full Chinese Statutory Profile",
    caption: "Verified USCC, customs code, deregistration notice, 0 insured staff, and licensed business scope.",
  },
  {
    src: "/samples/previews/identity-149-p08-safeguards.webp",
    pageLabel: "Page 08 / 09",
    title: "B2B Check, Safeguards & Scope",
    caption: "Alibaba/1688/website findings, 5 standard onboarding safeguards, and transparent scope boundaries.",
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
            <span>$249 Decision Review (14 Pages)</span>
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
            <span>$149 Identity Check (9 Pages)</span>
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

      {/* Page Thumbnail Grid */}
      <div className={`grid gap-5 sm:grid-cols-2 ${activeTier === "249" ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
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
                  <Eye className="h-3.5 w-3.5 text-teal-600" /> Zoom Page
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
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="hidden sm:inline text-center max-w-md truncate">{activeLightboxPage.caption}</span>
              <button
                type="button"
                onClick={() => setLightboxIdx((lightboxIdx + 1) % pages.length)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
