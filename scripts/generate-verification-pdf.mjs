#!/usr/bin/env node
/**
 * GoCNScout Publication-Grade PDF Generator (v5 — Modern Institutional Design System)
 *
 * Design laws:
 * 1. Single unified typeface: embedded Inter (400/500/600/700) with lining tabular numerals everywhere.
 *    Zero mixed serif/mono fonts, zero dipping old-style numerals.
 * 2. Effortless readability: 10pt body (1.62 line-height), 9pt tables (9px 10px padding),
 *    18.5pt bold page titles, 24pt bold KPIs, 8pt strict floor for metadata/labels.
 * 3. Strict 1-focus-per-page pacing & 34px+ whitespace separation between distinct modules.
 * 4. Minimal rules: 70%+ fewer horizontal black lines; hierarchy driven by whitespace,
 *    subtle #F8FAFC exhibit panels, soft #F1F5F9 table headers, and crisp #E2E8F0 dividers.
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadLogoDataUri() {
  const logoPath = path.resolve("public/logo-96.webp");
  if (!fs.existsSync(logoPath)) return "";
  return `data:image/webp;base64,${fs.readFileSync(logoPath).toString("base64")}`;
}

function loadInterFontCss() {
  const weights = [400, 500, 600, 700];
  return weights
    .map((w) => {
      const fontPath = path.resolve(`scripts/fonts/inter-latin-${w}-normal.woff2`);
      if (!fs.existsSync(fontPath)) return "";
      const b64 = fs.readFileSync(fontPath).toString("base64");
      return `@font-face {
        font-family: "Inter";
        font-style: normal;
        font-weight: ${w};
        font-display: block;
        src: url("data:font/woff2;base64,${b64}") format("woff2");
      }`;
    })
    .join("\n");
}

function badge(label, tone = "neutral") {
  const t = String(tone).toUpperCase();
  let cls = "tag";
  if (t.includes("CRITICAL") || t.includes("REVOKED") || t.includes("CANCELLED") || t.includes("DEREG")) {
    cls = "tag tag-red";
  } else if (
    t.includes("HIGH") ||
    t.includes("CLOSED") ||
    t.includes("EXPIRED") ||
    t.includes("0 ACTIVE") ||
    t.includes("NO PRESENCE") ||
    t.includes("RISK") ||
    t.includes("UNMAINTAINED")
  ) {
    cls = "tag tag-slate";
  } else if (t.includes("ACTIVE") || t.includes("LOW")) {
    cls = "tag tag-navy";
  }
  return `<span class="${cls}">${esc(label)}</span>`;
}

/* ---------- CLEAN INTER-ONLY VECTOR EXHIBITS ---------- */

function svgCoverGrid() {
  return `
    <svg class="cover-bg-svg" viewBox="0 0 800 1130" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <line x1="72" y1="0" x2="72" y2="1130" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      <line x1="560" y1="0" x2="560" y2="1130" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
      <line x1="0" y1="168" x2="800" y2="168" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      <line x1="0" y1="920" x2="800" y2="920" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      <rect x="560" y="168" width="240" height="240" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
    </svg>
  `;
}

function svgRiskScale(active = "CRITICAL") {
  const steps = [
    { k: "LOW", t: "Tier 1 · Low Risk", sub: "Proceed with standard checks", x: 0 },
    { k: "WATCH", t: "Tier 2 · Moderate", sub: "Clarify minor gaps first", x: 155 },
    { k: "HIGH", t: "Tier 3 · High Risk", sub: "Hold deposit & escalate", x: 310 },
    { k: "CRITICAL", t: "Tier 4 · Critical", sub: "Mandatory pause / do not pay", x: 465 },
  ];
  return `
    <svg viewBox="0 0 616 74" width="100%" height="74" xmlns="http://www.w3.org/2000/svg">
      ${steps
        .map((s) => {
          const on = s.k === active;
          const fill = on ? "#B91C1C" : "#E2E8F0";
          const tc = on ? "#B91C1C" : "#475569";
          const sc = on ? "#7F1D1D" : "#64748B";
          return `
            <rect x="${s.x}" y="18" width="149" height="10" rx="2" fill="${fill}" />
            ${on ? `<polygon points="${s.x + 74.5},14 ${s.x + 68},4 ${s.x + 81},4" fill="#B91C1C" />` : ""}
            <text x="${s.x + 74.5}" y="46" text-anchor="middle" font-size="10.5" font-weight="${on ? "700" : "600"}" fill="${tc}" font-family="Inter, sans-serif">${s.t}</text>
            <text x="${s.x + 74.5}" y="62" text-anchor="middle" font-size="8.8" font-weight="400" fill="${sc}" font-family="Inter, sans-serif">${s.sub}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function svgRadarClean(scorecard) {
  const cx = 250;
  const cy = 128;
  const R = 86;
  const labels = ["Legal Status", "Ownership", "Judicial & Debt", "Scale & ISO", "IP & Patents", "External Pulse"];
  const n = scorecard.length;
  const pt = (i, r) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * R * r, cy + Math.sin(a) * R * r];
  };
  const rings = [0.2, 0.4, 0.6, 0.8, 1]
    .map((r) => {
      const p = Array.from({ length: n }, (_, i) => pt(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");
      return `<polygon points="${p}" fill="none" stroke="${r === 1 ? "#CBD5E1" : "#E2E8F0"}" stroke-width="${r === 1 ? "1.1" : "0.8"}" />`;
    })
    .join("");
  const axes = Array.from({ length: n }, (_, i) => {
    const [x, y] = pt(i, 1);
    const [lx, ly] = pt(i, 1.26);
    const anc = Math.abs(lx - cx) < 14 ? "middle" : lx > cx ? "start" : "end";
    const sc = scorecard[i];
    return `
      <line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#CBD5E1" stroke-width="0.8" />
      <text x="${lx.toFixed(1)}" y="${(ly - 2).toFixed(1)}" text-anchor="${anc}" font-size="10.5" font-weight="600" fill="#0F172A" font-family="Inter, sans-serif">${labels[i]}</text>
      <text x="${lx.toFixed(1)}" y="${(ly + 12).toFixed(1)}" text-anchor="${anc}" font-size="9.5" font-weight="700" fill="#B91C1C" font-family="Inter, sans-serif">${sc.score} / 5</text>
    `;
  }).join("");
  const dpts = scorecard.map((s, i) => pt(i, Math.max(0.1, s.score / s.max)));
  const poly = dpts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return `
    <svg viewBox="0 0 500 258" width="100%" height="236" xmlns="http://www.w3.org/2000/svg">
      ${rings}
      ${axes}
      <polygon points="${poly}" fill="rgba(185,28,28,0.14)" stroke="#B91C1C" stroke-width="2" />
      ${dpts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#B91C1C" />`).join("")}
    </svg>
  `;
}

function svgCapitalLine(history) {
  const w = 620,
    h = 200,
    pL = 44,
    pR = 24,
    pT = 30,
    pB = 32;
  const pw = w - pL - pR,
    ph = h - pT - pB,
    max = 60;
  const pts = history.map((d, i) => ({
    ...d,
    x: pL + (pw * i) / (history.length - 1),
    y: pT + ph - (d.rmbMillions / max) * ph,
  }));
  const pathStr = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaStr = `${pathStr} L${pts[pts.length - 1].x.toFixed(1)},${(pT + ph).toFixed(1)} L${pts[0].x.toFixed(1)},${(pT + ph).toFixed(1)} Z`;
  const grid = [0, 20, 40, 60]
    .map((v) => {
      const y = pT + ph - (v / max) * ph;
      return `
        <line x1="${pL}" y1="${y.toFixed(1)}" x2="${w - pR}" y2="${y.toFixed(1)}" stroke="${v === 0 ? "#94A3B8" : "#E2E8F0"}" stroke-width="${v === 0 ? "1.1" : "0.8"}" />
        <text x="${pL - 9}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="9.5" font-weight="500" fill="#64748B" font-family="Inter, sans-serif">${v}M</text>
      `;
    })
    .join("");
  const peak = pts.find((p) => p.year === "2008");
  return `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="196" xmlns="http://www.w3.org/2000/svg">
      ${grid}
      <path d="${areaStr}" fill="rgba(11,31,58,0.06)" />
      <path d="${pathStr}" fill="none" stroke="#0B1F3A" stroke-width="2.2" />
      ${
        peak
          ? `<line x1="${peak.x.toFixed(1)}" y1="${peak.y.toFixed(1)}" x2="${(peak.x + 18).toFixed(1)}" y2="24" stroke="#B91C1C" stroke-width="1" />
             <text x="${(peak.x + 23).toFixed(1)}" y="28" font-size="9.5" font-weight="600" fill="#B91C1C" font-family="Inter, sans-serif">Peak 52M → 10M (−81%, 2019–2021)</text>`
          : ""
      }
      ${pts
        .map((p) => {
          const drop = p.year === "2019" || p.year === "2021" || p.year === "2026";
          const col = drop ? "#B91C1C" : "#0B1F3A";
          return `
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.8" fill="${col}" />
            <text x="${p.x.toFixed(1)}" y="${(p.y - 10).toFixed(1)}" text-anchor="middle" font-size="9.8" font-weight="700" fill="${col}" font-family="Inter, sans-serif">${p.rmbMillions}M</text>
            <text x="${p.x.toFixed(1)}" y="${(pT + ph + 19).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="500" fill="#475569" font-family="Inter, sans-serif">${p.year}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function svgEntityDiagramClean() {
  return `
    <svg viewBox="0 0 650 250" width="100%" height="244" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#B91C1C" />
        </marker>
      </defs>

      <text x="90" y="16" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="0.8" fill="#64748B" font-family="Inter, sans-serif">SHAREHOLDERS</text>
      <text x="320" y="16" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="0.8" fill="#B91C1C" font-family="Inter, sans-serif">TARGET ENTITY (DEREGISTERING)</text>
      <text x="554" y="16" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="0.8" fill="#0B1F3A" font-family="Inter, sans-serif">NEW SHARED-CONTACT SHELLS</text>

      <!-- Connectors -->
      <path d="M174,82 L224,112" fill="none" stroke="#64748B" stroke-width="1.4" />
      <path d="M174,178 L224,148" fill="none" stroke="#64748B" stroke-width="1.4" />
      <path d="M414,106 L460,68" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#arrRed)" />
      <path d="M414,130 L460,134" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#arrRed)" />
      <path d="M414,154 L460,198" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#arrRed)" />

      <!-- Left Cards -->
      <rect x="6" y="44" width="168" height="74" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="6" y="44" width="4" height="74" rx="2" fill="#0B1F3A" />
      <text x="20" y="68" font-size="11" font-weight="700" fill="#0F172A" font-family="Inter, sans-serif">Mr. L** · 51%</text>
      <text x="20" y="86" font-size="9.2" fill="#475569" font-family="Inter, sans-serif">Legal Rep &amp; Director</text>
      <text x="20" y="103" font-size="8.8" fill="#64748B" font-family="Inter, sans-serif">5.10M RMB Paid-in</text>

      <rect x="6" y="140" width="168" height="74" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="6" y="140" width="4" height="74" rx="2" fill="#0B1F3A" />
      <text x="20" y="164" font-size="11" font-weight="700" fill="#0F172A" font-family="Inter, sans-serif">Ms. J** · 49%</text>
      <text x="20" y="182" font-size="9.2" fill="#475569" font-family="Inter, sans-serif">Supervisor · Also Chairs</text>
      <text x="20" y="199" font-size="8.8" font-weight="600" fill="#B91C1C" font-family="Inter, sans-serif">2023 Printing Shell →</text>

      <!-- Center Target -->
      <rect x="224" y="54" width="190" height="150" rx="4" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1.4" />
      <rect x="224" y="54" width="190" height="26" rx="4" fill="#B91C1C" />
      <rect x="224" y="72" width="190" height="8" fill="#B91C1C" />
      <text x="319" y="71" text-anchor="middle" font-size="8.5" font-weight="700" letter-spacing="0.6" fill="#FFFFFF" font-family="Inter, sans-serif">SIMPLIFIED DEREGISTRATION</text>
      <text x="319" y="104" text-anchor="middle" font-size="11" font-weight="700" fill="#0F172A" font-family="Inter, sans-serif">Zhejiang [REDACTED]</text>
      <text x="319" y="120" text-anchor="middle" font-size="10.5" font-weight="600" fill="#0F172A" font-family="Inter, sans-serif">Knitting Co., Ltd.</text>
      <line x1="242" y1="133" x2="396" y2="133" stroke="#E2E8F0" stroke-width="1" />
      <text x="319" y="152" text-anchor="middle" font-size="9.2" font-weight="600" fill="#B91C1C" font-family="Inter, sans-serif">40.5M RMB Enforcement</text>
      <text x="319" y="170" text-anchor="middle" font-size="9.2" font-weight="600" fill="#B91C1C" font-family="Inter, sans-serif">83.1M RMB Mortgages</text>
      <text x="319" y="188" text-anchor="middle" font-size="9" fill="#475569" font-family="Inter, sans-serif">0 Insured Staff (2024–25)</text>

      <!-- Right New Shells -->
      <rect x="464" y="38" width="180" height="58" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="464" y="38" width="4" height="58" rx="2" fill="#B91C1C" />
      <text x="478" y="59" font-size="10" font-weight="700" fill="#0F172A" font-family="Inter, sans-serif">Yiwu [REDACTED] Printing</text>
      <text x="478" y="75" font-size="8.8" fill="#475569" font-family="Inter, sans-serif">Est. Apr 2023 · 1M · Ms. J**</text>
      <text x="478" y="89" font-size="8.4" font-weight="600" fill="#B91C1C" font-family="Inter, sans-serif">Shared Phone &amp; Email</text>

      <rect x="464" y="106" width="180" height="58" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="464" y="106" width="4" height="58" rx="2" fill="#0B1F3A" />
      <text x="478" y="127" font-size="10" font-weight="700" fill="#0F172A" font-family="Inter, sans-serif">Yiwu [REDACTED] Trading (A)</text>
      <text x="478" y="143" font-size="8.8" fill="#475569" font-family="Inter, sans-serif">Est. Oct 2024 · 1M · Active</text>
      <text x="478" y="157" font-size="8.4" fill="#64748B" font-family="Inter, sans-serif">Shared Registered Email</text>

      <rect x="464" y="174" width="180" height="58" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="464" y="174" width="4" height="58" rx="2" fill="#0B1F3A" />
      <text x="478" y="195" font-size="10" font-weight="700" fill="#0F172A" font-family="Inter, sans-serif">Yiwu [REDACTED] Trading (B)</text>
      <text x="478" y="211" font-size="8.8" fill="#475569" font-family="Inter, sans-serif">Est. Mar 2022 · 1M · Active</text>
      <text x="478" y="225" font-size="8.4" fill="#64748B" font-family="Inter, sans-serif">Shared Phone &amp; Email (+3 Older)</text>
    </svg>
  `;
}

function svgDebtBarsClean() {
  const rows = [
    { label: "Active Chattel Mortgages (3)", v: 83.1, c: "#B91C1C" },
    { label: "Historical Dishonest Debtor (2)", v: 65.27, c: "#475569" },
    { label: "Resumed Court Enforcement", v: 40.5, c: "#B91C1C" },
    { label: "Remaining Registered Capital", v: 10.0, c: "#0B1F3A" },
  ];
  const max = 92;
  return `
    <svg viewBox="0 0 430 144" width="100%" height="140" xmlns="http://www.w3.org/2000/svg">
      ${rows
        .map((r, i) => {
          const y = 8 + i * 34;
          const bw = Math.round((r.v / max) * 185);
          return `
            <text x="0" y="${y + 13}" font-size="10" font-weight="600" fill="#1E293B" font-family="Inter, sans-serif">${r.label}</text>
            <rect x="182" y="${y + 2}" width="185" height="14" rx="2" fill="#E2E8F0" />
            <rect x="182" y="${y + 2}" width="${bw}" height="14" rx="2" fill="${r.c}" />
            <text x="${190 + bw}" y="${y + 13}" font-size="10" font-weight="700" fill="${r.c}" font-family="Inter, sans-serif">${r.v.toFixed(1)}M</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function svgDecayBarsClean() {
  const items = [
    { label: "Chinese Patents Active", active: 0, total: 58, note: "0 / 58 (100% Terminated)" },
    { label: "Recent ISO Certificates", active: 0, total: 3, note: "0 / 3 (100% Revoked)" },
    { label: "Registered Branches", active: 0, total: 3, note: "0 / 3 (100% Cancelled)" },
    { label: "Legacy Trademarks", active: 26, total: 30, note: "26 / 30 (0 New in 13 Yrs)" },
  ];
  return `
    <svg viewBox="0 0 600 124" width="100%" height="118" xmlns="http://www.w3.org/2000/svg">
      ${items
        .map((it, i) => {
          const y = 6 + i * 29;
          const pct = it.total > 0 ? it.active / it.total : 0;
          const w = Math.round(pct * 200);
          return `
            <text x="0" y="${y + 12}" font-size="10" font-weight="600" fill="#0F172A" font-family="Inter, sans-serif">${it.label}</text>
            <rect x="172" y="${y + 2}" width="200" height="12" rx="2" fill="#E2E8F0" />
            ${w > 0 ? `<rect x="172" y="${y + 2}" width="${w}" height="12" rx="2" fill="#0B1F3A" />` : `<rect x="172" y="${y + 2}" width="4" height="12" rx="1" fill="#B91C1C" />`}
            <text x="386" y="${y + 12}" font-size="9.5" font-weight="${it.active === 0 ? "700" : "500"}" fill="${it.active === 0 ? "#B91C1C" : "#334155"}" font-family="Inter, sans-serif">${it.note}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

/* ---------- V5 MODERN INSTITUTIONAL PRINT CSS ---------- */

function buildCss(fontCss) {
  return `
    ${fontCss}
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-variant-numeric: lining-nums tabular-nums;
      color: #0F172A;
      background: #FFFFFF;
      font-size: 10pt;
      line-height: 1.62;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Full-Bleed Architectural Cover & Back Cover */
    .cover-sheet {
      width: 210mm;
      height: 297mm;
      position: relative;
      background: #0B1F3A;
      color: #FFFFFF;
      padding: 20mm 20mm 18mm 24mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      page-break-after: always;
    }
    .cover-sheet:last-child { page-break-after: auto; }
    .cover-bg-svg { position: absolute; inset: 0; pointer-events: none; }
    .cover-left-rule {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4.5mm;
      background: #B91C1C;
    }
    .cover-top {
      position: relative; z-index: 2;
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.16);
      padding-bottom: 14px;
    }
    .c-brand { display: flex; align-items: center; gap: 10px; }
    .c-logo { width: 26px; height: 26px; object-fit: contain; }
    .c-word { font-size: 12pt; font-weight: 700; letter-spacing: 0.14em; color: #FFFFFF; }
    .c-meta { font-size: 8.2pt; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #94A3B8; }

    .cover-body { position: relative; z-index: 2; }
    .c-kicker {
      font-size: 9pt; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
      color: #CBD5E1; margin-bottom: 16px;
    }
    .c-h1 {
      font-size: 32pt; font-weight: 700; line-height: 1.14; letter-spacing: -0.025em;
      margin: 0 0 24px 0; color: #FFFFFF; max-width: 152mm;
    }
    .c-rule-short { width: 48px; height: 3px; background: #B91C1C; margin-bottom: 24px; }
    .c-target-k { font-size: 8.2pt; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #94A3B8; }
    .c-target-v { font-size: 17pt; font-weight: 600; color: #FFFFFF; margin: 6px 0 30px 0; letter-spacing: -0.01em; }

    .c-verdict {
      border-top: 2px solid #B91C1C;
      border-bottom: 1px solid rgba(255,255,255,0.16);
      padding: 18px 0;
      max-width: 154mm;
    }
    .cv-k { font-size: 8.2pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #FCA5A5; }
    .cv-t { font-size: 14pt; font-weight: 700; color: #FFFFFF; margin: 6px 0 8px 0; letter-spacing: -0.01em; }
    .cv-d { font-size: 9.8pt; color: #CBD5E1; margin: 0; line-height: 1.6; }

    .cover-bottom {
      position: relative; z-index: 2;
      border-top: 1px solid rgba(255,255,255,0.16);
      padding-top: 14px;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    }
    .cb-k { display: block; font-size: 8pt; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #94A3B8; margin-bottom: 4px; }
    .cb-v { font-size: 9.5pt; font-weight: 600; color: #FFFFFF; }

    /* Interior Pages — Airy Margins, Clean Whitespace */
    .page {
      width: 210mm;
      height: 297mm;
      padding: 15mm 18mm 14mm 18mm;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      overflow: hidden;
    }
    .p-head {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;
      margin-bottom: 22px;
      font-size: 8pt;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #64748B;
    }
    .p-head strong { color: #0B1F3A; font-weight: 700; }
    .p-foot {
      margin-top: auto;
      border-top: 1px solid #E2E8F0;
      padding-top: 9px;
      display: flex; justify-content: space-between;
      font-size: 8pt;
      color: #64748B;
    }

    /* Editorial Action Title — Zero Heavy Underline */
    .eyebrow {
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #B91C1C;
      margin-bottom: 6px;
    }
    .h2-action {
      font-size: 18pt;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: #0F172A;
      margin: 0 0 12px 0;
    }
    .sub-lead {
      font-size: 10pt;
      color: #475569;
      margin: 0 0 26px 0;
      line-height: 1.6;
    }

    /* Section Subheading — Whitespace Separated, NO Black Underline */
    .sec-sub {
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #0F172A;
      margin: 34px 0 12px 0;
    }
    .sec-sub.first { margin-top: 0; }

    /* Spacious Metric Strip */
    .metric-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 18px 0 32px 0;
    }
    .m-cell {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      padding: 14px 14px 12px 14px;
    }
    .m-k {
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #64748B;
    }
    .m-v {
      font-size: 19.5pt;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #0B1F3A;
      line-height: 1.15;
      margin: 6px 0 4px 0;
      white-space: nowrap;
    }
    .m-v.red { color: #B91C1C; }
    .m-s { font-size: 8.5pt; color: #475569; }

    /* Clean Subtle Exhibit Panel — Zero Heavy Black Bars */
    .exhibit {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      padding: 18px 20px 14px 20px;
      margin: 0 0 34px 0;
    }
    .ex-k {
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #B91C1C;
    }
    .ex-t {
      font-size: 11pt;
      font-weight: 700;
      color: #0F172A;
      margin: 2px 0 14px 0;
      letter-spacing: -0.01em;
    }
    .ex-src {
      font-size: 8pt;
      color: #64748B;
      margin-top: 10px;
    }

    /* Clean Breathable Tables — Soft Header Fill, Light Row Dividers */
    table.inst {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      font-size: 9pt;
      line-height: 1.48;
    }
    table.inst th {
      text-align: left;
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #475569;
      padding: 9px 10px;
      background: #F1F5F9;
      border-bottom: 1px solid #CBD5E1;
    }
    table.inst td {
      padding: 9px 10px;
      border-bottom: 1px solid #E2E8F0;
      vertical-align: top;
      color: #1E293B;
    }
    table.inst tr:last-child td {
      border-bottom: 1px solid #CBD5E1;
    }
    table.inst.compact td {
      padding: 7.5px 10px;
    }
    table.inst.tight td {
      padding: 5.5px 9px;
      font-size: 8.6pt;
      line-height: 1.42;
    }
    table.inst.tight th {
      padding: 7px 9px;
    }
    .num { font-weight: 600; white-space: nowrap; }
    .nowrap { white-space: nowrap; }

    /* Restrained Typographic Status Tags */
    .tag {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid #CBD5E1;
      color: #334155;
      background: #FFFFFF;
      white-space: nowrap;
      line-height: 1.3;
    }
    .tag-red { border-color: #FECACA; color: #B91C1C; background: #FEF2F2; }
    .tag-slate { border-color: #CBD5E1; color: #0F172A; background: #F1F5F9; }
    .tag-navy { border-color: #BFDBFE; color: #0B1F3A; background: #EFF6FF; }

    /* Callout Notes */
    .note {
      border-left: 3px solid #0B1F3A;
      background: #F8FAFC;
      padding: 14px 16px;
      margin-top: 24px;
      font-size: 9.5pt;
      line-height: 1.58;
      color: #1E293B;
      border-radius: 0 4px 4px 0;
    }
    .note.red { border-left-color: #B91C1C; background: #FEF2F2; }
    .note strong { color: #0F172A; }
    .note.red strong { color: #991B1B; }

    /* Clean Table of Contents */
    .toc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 30px;
    }
    .toc-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #E2E8F0;
      padding: 9px 0;
      font-size: 9.5pt;
      color: #1E293B;
    }
    .toc-num { font-weight: 700; color: #B91C1C; margin-right: 10px; }
    .toc-pg { font-weight: 600; color: #64748B; }

    /* Numbered Action Rows */
    .act-row {
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 10px;
      padding: 7px 0;
      border-bottom: 1px solid #E2E8F0;
      font-size: 9pt;
      line-height: 1.48;
      color: #1E293B;
    }
    .act-row:last-child { border-bottom: none; }
    .act-n { font-size: 10pt; font-weight: 700; color: #0B1F3A; }

    /* Dark Navy RFQ Box */
    .rfq-block {
      background: #0B1F3A;
      color: #FFFFFF;
      border-radius: 4px;
      padding: 16px 20px;
      margin-top: 20px;
    }
    .rfq-block h3 {
      font-size: 8.2pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94A3B8;
      margin: 0 0 10px 0;
    }
    .rfq-block ol { margin: 0; padding-left: 18px; }
    .rfq-block li { font-size: 8.9pt; color: #F1F5F9; margin-bottom: 7px; line-height: 1.45; }
    .rfq-block li:last-child { margin-bottom: 0; }

    /* Two-column Scope Grid */
    .scope-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 18px;
    }
    .scope-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-top: 3px solid #0B1F3A;
      border-radius: 0 0 4px 4px;
      padding: 12px 14px;
    }
    .scope-box.red { border-top-color: #B91C1C; }
    .scope-title {
      font-size: 8.2pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0B1F3A;
      margin-bottom: 6px;
    }
    .scope-box.red .scope-title { color: #B91C1C; }
    .scope-list { margin: 0; padding-left: 16px; font-size: 8.4pt; color: #334155; line-height: 1.48; }
    .scope-list li { margin-bottom: 3px; }
  `;
}

function pageWrap(headerTitle, pageNum, totalPages, body) {
  return `
    <section class="page">
      <div class="p-head">
        <span><strong>GOCNSCOUT</strong> · ${esc(headerTitle)}</span>
        <span>REDACTED PUBLIC SAMPLE · CONFIDENTIAL</span>
      </div>
      <div style="flex:1;">${body}</div>
      <div class="p-foot">
        <span>GoCNScout Independent Buyer Intelligence · Public-Record Desk Due Diligence</span>
        <span>Page ${String(pageNum).padStart(2, "0")} of ${String(totalPages).padStart(2, "0")}</span>
      </div>
    </section>
  `;
}

function renderCover(logoUri, data, tierTitle, subtitle, verdictLine, metaCols) {
  const { meta, company, verdict } = data;
  return `
    <section class="cover-sheet">
      <div class="cover-left-rule"></div>
      ${svgCoverGrid()}
      <div class="cover-top">
        <div class="c-brand">
          ${logoUri ? `<img src="${logoUri}" class="c-logo" alt="GoCNScout" />` : ""}
          <div class="c-word">GOCNSCOUT</div>
        </div>
        <div class="c-meta">INDEPENDENT DUE DILIGENCE · ${esc(meta.reportId)}</div>
      </div>

      <div class="cover-body">
        <div class="c-kicker">${esc(tierTitle)}</div>
        <h1 class="c-h1">${esc(subtitle)}</h1>
        <div class="c-rule-short"></div>
        <div class="c-target-k">Target Chinese Legal Entity (Redacted Public Sample)</div>
        <div class="c-target-v">${esc(company.englishName)}</div>

        <div class="c-verdict">
          <div class="cv-k">Executive Risk Determination · Mandatory Critical Override</div>
          <div class="cv-t">${esc(verdict.tierLabel)} — ${esc(verdict.actionHeadline)}</div>
          <p class="cv-d">${esc(verdictLine)}</p>
        </div>
      </div>

      <div class="cover-bottom">
        ${metaCols.map(([k, v]) => `<div><span class="cb-k">${esc(k)}</span><span class="cb-v">${esc(v)}</span></div>`).join("")}
      </div>
    </section>
  `;
}

function renderBackCover(logoUri, data, tierLabel, is149) {
  const { meta } = data;
  return `
    <section class="cover-sheet">
      <div class="cover-left-rule"></div>
      ${svgCoverGrid()}
      <div class="cover-top">
        <div class="c-brand">
          ${logoUri ? `<img src="${logoUri}" class="c-logo" alt="GoCNScout" />` : ""}
          <div class="c-word">GOCNSCOUT</div>
        </div>
        <div class="c-meta">END OF REPORT · ${esc(tierLabel)}</div>
      </div>

      <div class="cover-body">
        <div class="c-kicker">100% Buyer-Funded Independence</div>
        <h2 style="font-size:24pt;font-weight:700;line-height:1.22;letter-spacing:-0.02em;margin:0 0 18px 0;max-width:150mm;color:#FFFFFF;">
          Zero supplier commissions. Zero listing fees. Independent intelligence built strictly for overseas buyers.
        </h2>
        <div class="c-rule-short"></div>
        <p style="font-size:10pt;color:#CBD5E1;max-width:152mm;margin:0 0 26px 0;line-height:1.62;">
          Every GoCNScout due diligence report is researched silently across official Chinese corporate, judicial, customs, and public platforms. We never contact or alert the target supplier.
        </p>

        ${
          is149
            ? `
          <div style="border-top:2px solid #FFFFFF;border-bottom:1px solid rgba(255,255,255,0.16);padding:16px 0;margin-bottom:24px;max-width:154mm;">
            <div style="font-size:8.2pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:6px;">Need Deeper Ownership, Mortgage, IP &amp; Social Due Diligence?</div>
            <p style="margin:0;font-size:9.5pt;color:#E2E8F0;line-height:1.58;">
              Upgrade to the <strong>$249 Buyer Decision Review (14-Page Institutional Report)</strong> or <strong>$499 3-Supplier Bundle</strong> for full 6-dimension scoring, shareholder &amp; related-shell topology, 83.1M chattel mortgage audits, domestic ISO/patent status, labor arbitrations, domestic social signals, and tailored RFQ questions.
            </p>
          </div>
        `
            : ""
        }

        <div style="border-top:1px solid rgba(255,255,255,0.16);border-bottom:1px solid rgba(255,255,255,0.16);padding:16px 0;margin-bottom:28px;max-width:154mm;">
          <div style="font-size:8.2pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:6px;">Scope Boundaries &amp; Legal Notice</div>
          <p style="margin:0;font-size:8.8pt;color:#CBD5E1;line-height:1.6;">
            Compiled independently from publicly available Chinese records as of ${esc(meta.reportDate)}. Desk due diligence does <strong>not</strong> include on-site factory inspections, satellite audits, private bank-account verification, delivery of original business license scans, or overseas product lab certificate audits (CE/FCC/FDA/UL). Supports buyer risk screening only and does not replace physical sample testing or pre-shipment QC (SGS / TÜV).
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;max-width:154mm;">
          <div>
            <div class="cb-k">Order Supplier Verification</div>
            <div style="font-size:11pt;font-weight:700;color:#FFFFFF;">https://gocnscout.com/pricing</div>
            <div style="font-size:8.8pt;color:#94A3B8;margin-top:4px;">Scope &amp; price confirmed by email prior to Stripe payment.</div>
          </div>
          <div>
            <div class="cb-k">Direct 1-on-1 Analyst Desk</div>
            <div style="font-size:11pt;font-weight:700;color:#FFFFFF;">WhatsApp: +86 156 5890 1753</div>
            <div style="font-size:8.8pt;color:#94A3B8;margin-top:4px;">Email: gerry@gocnscout.com · 24–48h Delivery</div>
          </div>
        </div>
      </div>

      <div class="cover-bottom">
        <div><span class="cb-k">Report ID</span><span class="cb-v">${esc(meta.reportId)}</span></div>
        <div><span class="cb-k">Issue Date</span><span class="cb-v">${esc(meta.reportDate)}</span></div>
        <div><span class="cb-k">Classification</span><span class="cb-v">Redacted Sample</span></div>
        <div><span class="cb-k">Website</span><span class="cb-v">gocnscout.com</span></div>
      </div>
    </section>
  `;
}

/* ---------- $149 SUPPLIER IDENTITY CHECK — 9 BREATHABLE PAGES ---------- */

function build149(data, logoUri, fontCss) {
  const { meta, verdict, company, branches, keyRegistryChanges, adminPenalties, basicChecks149, externalFootprint, practicalSafeguards } = data;
  const total = 9;

  const p1 = renderCover(
    logoUri,
    data,
    "SUPPLIER IDENTITY CHECK · $149 TIER",
    "Statutory Identity & Risk Screening Report",
    "Active simplified deregistration notice (Nov 6–26, 2026), 40.5M RMB resumed court enforcement, 0 insured employees, 5 administrative penalties, and closed B2B storefronts.",
    [
      ["Service Tier", "Identity Check ($149)"],
      ["Report Length", `${total} Pages (Redacted)`],
      ["Issue Date", meta.reportDate],
      ["Research Mode", "Silent Desk Review"],
    ],
  );

  const p2 = pageWrap("SUPPLIER IDENTITY CHECK ($149)", 2, total, `
    <div class="eyebrow">Section 01 · Executive Overview</div>
    <h2 class="h2-action">Legacy manufacturer credentials mask an active deregistration notice and 40.5M RMB court enforcement</h2>

    <div class="metric-strip">
      <div class="m-cell"><div class="m-k">Risk Tier</div><div class="m-v red">CRITICAL</div><div class="m-s">Override triggered</div></div>
      <div class="m-cell"><div class="m-k">Legal Filing</div><div class="m-v red">Nov 2026</div><div class="m-s">Deregistration notice</div></div>
      <div class="m-cell"><div class="m-k">2025 Insured Staff</div><div class="m-v red">0</div><div class="m-s">3 of 3 branches closed</div></div>
      <div class="m-cell"><div class="m-k">Resumed Debt</div><div class="m-v red">40.5M</div><div class="m-s">RMB court enforced</div></div>
    </div>

    <div class="sec-sub first">Executive Summary</div>
    <p style="margin:0;color:#334155;">${esc(verdict.executiveSummary149)}</p>

    <div class="note red">
      <strong>Mandatory Critical Override:</strong> ${esc(verdict.criticalOverrideReason)}
    </div>

    <div class="sec-sub">Report Contents</div>
    <div class="toc-grid">
      <div class="toc-row"><span><span class="toc-num">01</span>Executive Overview</span><span class="toc-pg">02</span></div>
      <div class="toc-row"><span><span class="toc-num">05</span>Historical Registry Filings</span><span class="toc-pg">06</span></div>
      <div class="toc-row"><span><span class="toc-num">02</span>Risk Scale &amp; 3-Point Audit</span><span class="toc-pg">03</span></div>
      <div class="toc-row"><span><span class="toc-num">06</span>Enforcement &amp; Penalties</span><span class="toc-pg">07</span></div>
      <div class="toc-row"><span><span class="toc-num">03</span>Statutory Corporate Profile</span><span class="toc-pg">04</span></div>
      <div class="toc-row"><span><span class="toc-num">07</span>B2B Check &amp; Safeguards</span><span class="toc-pg">08</span></div>
      <div class="toc-row"><span><span class="toc-num">04</span>Capital Arc &amp; Branches</span><span class="toc-pg">05</span></div>
      <div class="toc-row"><span><span class="toc-num">08</span>Disclaimer &amp; Desk Contact</span><span class="toc-pg">09</span></div>
    </div>
  `);

  const p3 = pageWrap("SUPPLIER IDENTITY CHECK ($149)", 3, total, `
    <div class="eyebrow">Section 02 · Risk Classification &amp; Core Audit</div>
    <h2 class="h2-action">All three screening pillars triggered high or critical red flags across official public records</h2>
    <p class="sub-lead">Our $149 Supplier Identity Check evaluates every Chinese supplier across three foundational pillars using a clear 4-tier verdict framework. Any active deregistration filing or severe court enforcement automatically triggers a Tier 4 Critical Override.</p>

    <div class="exhibit">
      <div class="ex-k">Exhibit 1</div>
      <div class="ex-t">GoCNScout 4-Tier Risk Classification Scale</div>
      ${svgRiskScale("CRITICAL")}
      <div class="ex-src">Source: GoCNScout Standard Buyer Risk Methodology (Nov 2026).</div>
    </div>

    <div class="sec-sub first">3-Point Identity &amp; Risk Screening Results</div>
    <table class="inst">
      <thead><tr><th style="width:28%;">Screening Pillar</th><th style="width:15%;">Determination</th><th style="width:57%;">Verified Public-Record Evidence</th></tr></thead>
      <tbody>
        ${basicChecks149
          .map(
            (r) => `
          <tr>
            <td style="font-weight:600;color:#0F172A;">${esc(r.area)}</td>
            <td>${badge(r.status, r.status)}</td>
            <td>${esc(r.finding)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="note">
      <strong>Analyst Guidance:</strong> The $149 tier is designed as a fast pre-sample gatekeeper. Because this entity failed Pillar 1 (active deregistration) and Pillar 2 (40.5M RMB enforcement), buyers should pause immediately rather than spend further time negotiating with this legal shell.
    </div>
  `);

  const p4 = pageWrap("SUPPLIER IDENTITY CHECK ($149)", 4, total, `
    <div class="eyebrow">Section 03 · Statutory Corporate Registration</div>
    <h2 class="h2-action">Official Chinese registry confirms 25-year history, but 0 insured staff and active deregistration</h2>
    <p class="sub-lead">Verified directly against Chinese enterprise credit publicity records, annual reports, and China Customs filings. GoCNScout verifies registry fields independently and does not distribute original scanned business licenses.</p>

    <table class="inst compact">
      <thead><tr><th style="width:30%;">Statutory Field</th><th style="width:70%;">Verified Public Registry Value</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:600;">Legal Entity Name (Redacted)</td><td><strong>${esc(company.englishName)}</strong></td></tr>
        <tr><td style="font-weight:600;">Former Registered Name</td><td>${esc(company.formerName)}</td></tr>
        <tr><td style="font-weight:600;">Unified Social Credit Code</td><td>${esc(company.uscc)} (Org Code: ${esc(company.orgCode)})</td></tr>
        <tr><td style="font-weight:600;">Current Registration Status</td><td><strong style="color:#B91C1C;">${esc(company.registrationStatus)}</strong></td></tr>
        <tr><td style="font-weight:600;">Legal Representative</td><td>${esc(company.legalRepresentative)}</td></tr>
        <tr><td style="font-weight:600;">Establishment / Approval</td><td>${esc(company.establishmentDate)} · Latest Approval: ${esc(company.approvalDate)}</td></tr>
        <tr><td style="font-weight:600;">Operating Term &amp; Authority</td><td>${esc(company.operatingTerm)} · ${esc(company.registrationAuthority)}</td></tr>
        <tr><td style="font-weight:600;">Registered &amp; Paid-in Capital</td><td>${esc(company.registeredCapital)} · Paid-in: ${esc(company.paidInCapital)}</td></tr>
        <tr><td style="font-weight:600;">Enterprise Type &amp; Scale</td><td>${esc(company.companyType)} · Scale: ${esc(company.companyScale)}</td></tr>
        <tr><td style="font-weight:600;">Annual-Report Insured Staff</td><td><strong style="color:#B91C1C;">${esc(company.insuredEmployees2025)}</strong> (2024: 0 employees)</td></tr>
        <tr><td style="font-weight:600;">Customs Importer / Exporter</td><td>${esc(company.customsCode)} · ${esc(company.importExportStatus)}</td></tr>
        <tr><td style="font-weight:600;">Registered Address (Text)</td><td>${esc(company.registeredAddress)}</td></tr>
        <tr><td style="font-weight:600;">Licensed Business Scope</td><td>${esc(company.businessScope)}</td></tr>
      </tbody>
    </table>
  `);

  const p5 = pageWrap("SUPPLIER IDENTITY CHECK ($149)", 5, total, `
    <div class="eyebrow">Section 04 · Capital Trajectory &amp; Branch Closure</div>
    <h2 class="h2-action">Registered capital shrank 81% from its 52M RMB peak while all three branches were cancelled</h2>
    <p class="sub-lead">Tracking long-term capital changes and branch status separates growing factories from winding-down entities. Between 2019 and 2021, shareholders cut registered capital twice in rapid succession.</p>

    <div class="exhibit">
      <div class="ex-k">Exhibit 2</div>
      <div class="ex-t">Registered Capital Trajectory (2001–2026, RMB Millions)</div>
      ${svgCapitalLine(data.capitalHistory)}
      <div class="ex-src">Source: Yiwu AMR Historical Enterprise Change Filings (29 total registry modifications; key milestones plotted).</div>
    </div>

    <div class="sec-sub first">Registered Branch Offices (3 of 3 Cancelled)</div>
    <table class="inst">
      <thead><tr><th style="width:40%;">Branch Name (Redacted)</th><th style="width:17%;">Branch Head</th><th style="width:15%;">City</th><th style="width:15%;">Founded</th><th style="width:13%;">Status</th></tr></thead>
      <tbody>
        ${branches
          .map(
            (b) => `
          <tr>
            <td style="font-weight:600;">${esc(b.name)}</td>
            <td>${esc(b.head)}</td>
            <td>${esc(b.city)}</td>
            <td class="nowrap">${esc(b.founded)}</td>
            <td>${badge(b.status, b.status)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p6 = pageWrap("SUPPLIER IDENTITY CHECK ($149)", 6, total, `
    <div class="eyebrow">Section 05 · Historical Corporate Registry Filings</div>
    <h2 class="h2-action">Nine milestone filings trace the rise (2001–2008) and retrenchment (2019–2021) of the entity</h2>
    <p class="sub-lead">Selected from 29 total corporate registry change records filed with Yiwu Administration for Market Regulation.</p>

    <table class="inst">
      <thead><tr><th style="width:15%;">Filing Date</th><th style="width:28%;">Change Category</th><th style="width:57%;">Recorded Corporate Modification</th></tr></thead>
      <tbody>
        ${keyRegistryChanges
          .map(
            (c) => `
          <tr>
            <td class="num">${esc(c.date)}</td>
            <td style="font-weight:600;color:#0F172A;">${esc(c.item)}</td>
            <td>${esc(c.detail)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="note">
      <strong>Historical Pattern:</strong> From 2001 to 2008, the manufacturer expanded aggressively from 1M to 52M RMB in registered capital and secured direct export rights. Beginning in December 2019, back-to-back capital reductions (−57.7% and −54.5%) coincided with the onset of major bank-loan litigation.
    </div>
  `);

  const p7 = pageWrap("SUPPLIER IDENTITY CHECK ($149)", 7, total, `
    <div class="eyebrow">Section 06 · Enforcement &amp; Administrative Penalty Screen</div>
    <h2 class="h2-action">Active deregistration, 40.5M RMB resumed enforcement, and five administrative penalties flagged</h2>

    <div class="sec-sub first">Critical Deregistration &amp; Court Enforcement Flags</div>
    <table class="inst compact">
      <thead><tr><th style="width:14%;">Date</th><th style="width:24%;">Flag Category</th><th style="width:15%;">Exposure</th><th style="width:47%;">Verified Public Record Detail</th></tr></thead>
      <tbody>
        <tr><td class="num">2026-11-06</td><td style="font-weight:600;">Simplified Deregistration</td><td>${badge("CRITICAL", "CRITICAL")}</td><td>Public notice window Nov 6–26, 2026 with Yiwu AMR. Entity may cease legal existence imminently.</td></tr>
        <tr><td class="num">2026</td><td style="font-weight:600;">Court Enforcement</td><td class="num" style="color:#B91C1C;">0.48M RMB</td><td>Case (2026) Zhe 0782 Zhi 9730 — labor-provider injury liability enforcement (Yiwu Court).</td></tr>
        <tr><td class="num">2025-07-30</td><td style="font-weight:600;">Resumed Enforcement</td><td class="num" style="color:#B91C1C;">40.50M RMB</td><td>Case (2025) Zhe 0782 Zhi Hui 1918 — resumed enforcement on financial loan guarantee (China Huarong AMC).</td></tr>
        <tr><td class="num">2020–2022</td><td style="font-weight:600;">Historical Dishonest Debtor</td><td class="num" style="color:#B91C1C;">65.27M RMB</td><td>Two historical Dishonest Judgment Debtor &amp; High-Consumption Restriction orders (Huarong &amp; Cinda AMC).</td></tr>
      </tbody>
    </table>

    <div class="sec-sub">Historical Administrative Penalties (5 Records)</div>
    <table class="inst compact">
      <thead><tr><th style="width:14%;">Date</th><th style="width:20%;">Authority</th><th style="width:14%;">Fine</th><th style="width:52%;">Recorded Violation</th></tr></thead>
      <tbody>
        ${adminPenalties
          .map(
            (p) => `
          <tr>
            <td class="num">${esc(p.date)}</td>
            <td style="font-weight:600;">${esc(p.authority)}</td>
            <td class="num">${esc(p.fine)}</td>
            <td>${esc(p.fact)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p8 = pageWrap("SUPPLIER IDENTITY CHECK ($149)", 8, total, `
    <div class="eyebrow">Section 07 · Digital Footprint &amp; Buyer Safeguards</div>
    <h2 class="h2-action">Closed B2B storefronts confirm wind-down; apply five practical pre-payment safeguards</h2>

    <div class="sec-sub first">Website &amp; B2B Storefront Consistency Check</div>
    <table class="inst compact">
      <thead><tr><th style="width:30%;">Channel Checked</th><th style="width:18%;">Status</th><th style="width:52%;">Analyst Findings</th></tr></thead>
      <tbody>
        ${externalFootprint
          .slice(0, 3)
          .map(
            (e) => `
          <tr>
            <td style="font-weight:600;">${esc(e.channel)}</td>
            <td>${badge(e.status, e.status)}</td>
            <td>${esc(e.detail)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="sec-sub" style="margin-top:22px;">Practical Pre-Payment Safeguards (Standard China Trade Practice)</div>
    <div>
      ${practicalSafeguards
        .map(
          (s, i) => `
        <div class="act-row">
          <div class="act-n">0${i + 1}</div>
          <div>${esc(s)}</div>
        </div>
      `,
        )
        .join("")}
    </div>

    <div class="scope-grid">
      <div class="scope-box">
        <div class="scope-title">Included in $149 Scope</div>
        <ul class="scope-list">
          <li>Chinese statutory registration &amp; deregistration status</li>
          <li>Branch status &amp; historical capital/registry changes</li>
          <li>Obvious enforcement, debtor &amp; penalty screening</li>
          <li>Website &amp; B2B storefront consistency check</li>
        </ul>
      </div>
      <div class="scope-box red">
        <div class="scope-title">Outside Desk Review Scope</div>
        <ul class="scope-list">
          <li>No on-site factory visits, phone calls, or satellite audits</li>
          <li>No verification of private corporate or offshore bank accounts</li>
          <li>No delivery of original stamped business license scans</li>
          <li>No lab auditing of overseas CE / FCC / FDA / UL certificates</li>
        </ul>
      </div>
    </div>
  `);

  const p9 = renderBackCover(logoUri, data, "SUPPLIER IDENTITY CHECK ($149)", true);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><style>${buildCss(fontCss)}</style></head><body>${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}${p9}</body></html>`;
}

/* ---------- $249 BUYER DECISION REVIEW — 14 BREATHABLE PAGES ---------- */

function build249(data, logoUri, fontCss) {
  const {
    meta,
    verdict,
    company,
    branches,
    keyRegistryChanges,
    adminPenalties,
    scorecard249,
    capitalHistory,
    shareholders,
    legalRepOtherEntities,
    relatedEntities,
    chattelMortgages,
    historicalDebtors,
    laborArbitrations,
    keyJudicialAndDebt,
    credentialsAndIp,
    externalFootprint,
    practicalSafeguards,
    rfqQuestions,
  } = data;
  const total = 14;

  const p1 = renderCover(
    logoUri,
    data,
    "BUYER DECISION REVIEW · $249 FLAGSHIP TIER",
    "Deep Supplier Due Diligence & Pre-Deposit Risk Assessment",
    "25-year legacy manufacturer currently filing simplified deregistration, carrying 123.6M RMB in active enforcement and chattel mortgages, 0 insured staff, 58/58 terminated patents, revoked ISO certificates, and newly formed related trading shells.",
    [
      ["Service Tier", "Decision Review ($249)"],
      ["Signal Score", "3 / 30 (Override)"],
      ["Report Length", `${total} Pages (Redacted)`],
      ["Turnaround", `${meta.turnaroundHours} Hours · Silent`],
    ],
  );

  const p2 = pageWrap("BUYER DECISION REVIEW ($249)", 2, total, `
    <div class="eyebrow">Section 01 · Executive Verdict &amp; Report Roadmap</div>
    <h2 class="h2-action">Severe distress across all six dimensions triggers mandatory do-not-pay override (Score: 3 / 30)</h2>

    <div class="metric-strip">
      <div class="m-cell"><div class="m-k">Decision Verdict</div><div class="m-v red">PAUSE</div><div class="m-s">Do not pay this entity</div></div>
      <div class="m-cell"><div class="m-k">6-Dim Score</div><div class="m-v red">3 / 30</div><div class="m-s">Critical override</div></div>
      <div class="m-cell"><div class="m-k">Debt &amp; Mortgages</div><div class="m-v red">123.6M</div><div class="m-s">12.4× remaining capital</div></div>
      <div class="m-cell"><div class="m-k">Staff / ISO / Patents</div><div class="m-v red">0 · 0 · 0</div><div class="m-s">All active signals zero</div></div>
    </div>

    <div class="sec-sub first">Executive Summary</div>
    <p style="margin:0;color:#334155;">${esc(verdict.executiveSummary249)}</p>

    <div class="note red">
      <strong>Mandatory Critical Override:</strong> ${esc(verdict.criticalOverrideReason)}
    </div>

    <div class="sec-sub">Report Contents</div>
    <div class="toc-grid">
      <div class="toc-row"><span><span class="toc-num">01</span>Executive Verdict</span><span class="toc-pg">02</span></div>
      <div class="toc-row"><span><span class="toc-num">07</span>Judicial &amp; Debt Profile</span><span class="toc-pg">08</span></div>
      <div class="toc-row"><span><span class="toc-num">02</span>6-Dimension Scorecard</span><span class="toc-pg">03</span></div>
      <div class="toc-row"><span><span class="toc-num">08</span>Mortgages &amp; Debtors</span><span class="toc-pg">09</span></div>
      <div class="toc-row"><span><span class="toc-num">03</span>Statutory Registration</span><span class="toc-pg">04</span></div>
      <div class="toc-row"><span><span class="toc-num">09</span>Labor &amp; Admin Penalties</span><span class="toc-pg">10</span></div>
      <div class="toc-row"><span><span class="toc-num">04</span>Capital Arc &amp; Changes</span><span class="toc-pg">05</span></div>
      <div class="toc-row"><span><span class="toc-num">10</span>ISO Certificates &amp; IP</span><span class="toc-pg">11</span></div>
      <div class="toc-row"><span><span class="toc-num">05</span>Ownership &amp; Shell Map</span><span class="toc-pg">06</span></div>
      <div class="toc-row"><span><span class="toc-num">11</span>Digital Pulse &amp; Credit</span><span class="toc-pg">12</span></div>
      <div class="toc-row"><span><span class="toc-num">06</span>Related Entities Audit</span><span class="toc-pg">07</span></div>
      <div class="toc-row"><span><span class="toc-num">12</span>Playbook &amp; RFQ Script</span><span class="toc-pg">13</span></div>
    </div>
  `);

  const p3 = pageWrap("BUYER DECISION REVIEW ($249)", 3, total, `
    <div class="eyebrow">Section 02 · 6-Dimension Due Diligence Scorecard</div>
    <h2 class="h2-action">Zero-point failures in legal status, debt, and operating scale pull the composite score to 3 / 30</h2>

    <div class="exhibit">
      <div class="ex-k">Exhibit 1</div>
      <div class="ex-t">6-Dimension Risk Footprint (0–5 Evidence Scale)</div>
      ${svgRadarClean(scorecard249)}
      <div class="ex-src">Methodology: Each dimension is scored 0–5 from verified Chinese public records. Any 0/5 critical flag triggers an automatic PAUSE override.</div>
    </div>

    <div class="sec-sub first">Dimension-by-Dimension Scoring Breakdown</div>
    <table class="inst compact">
      <thead><tr><th style="width:27%;">Due Diligence Dimension</th><th style="width:14%;">Rating</th><th style="width:10%;">Score</th><th style="width:49%;">Primary Evidence Driving Rating</th></tr></thead>
      <tbody>
        ${scorecard249
          .map(
            (r) => `
          <tr>
            <td style="font-weight:600;color:#0F172A;">${esc(r.dimension)}</td>
            <td>${badge(r.status, r.status)}</td>
            <td class="num" style="color:#B91C1C;">${r.score} / 5</td>
            <td>${esc(r.rationale)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p4 = pageWrap("BUYER DECISION REVIEW ($249)", 4, total, `
    <div class="eyebrow">Section 03 · Statutory Corporate Registration</div>
    <h2 class="h2-action">Verified statutory profile confirms 25-year export history alongside 0 insured staff and 3 closed branches</h2>

    <table class="inst compact">
      <thead><tr><th style="width:29%;">Statutory Field</th><th style="width:71%;">Verified Public Registry Value</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:600;">Legal Entity Name (Redacted)</td><td><strong>${esc(company.englishName)}</strong></td></tr>
        <tr><td style="font-weight:600;">Former Registered Name</td><td>${esc(company.formerName)}</td></tr>
        <tr><td style="font-weight:600;">Unified Social Credit Code</td><td>${esc(company.uscc)} (Org Code: ${esc(company.orgCode)})</td></tr>
        <tr><td style="font-weight:600;">Current Registration Status</td><td><strong style="color:#B91C1C;">${esc(company.registrationStatus)}</strong></td></tr>
        <tr><td style="font-weight:600;">Legal Representative</td><td>${esc(company.legalRepresentative)}</td></tr>
        <tr><td style="font-weight:600;">Establishment / Approval</td><td>${esc(company.establishmentDate)} · Latest Approval: ${esc(company.approvalDate)}</td></tr>
        <tr><td style="font-weight:600;">Registered &amp; Paid-in Capital</td><td>${esc(company.registeredCapital)} · Paid-in: ${esc(company.paidInCapital)}</td></tr>
        <tr><td style="font-weight:600;">Annual-Report Insured Staff</td><td><strong style="color:#B91C1C;">${esc(company.insuredEmployees2025)}</strong> (2024: 0 employees)</td></tr>
        <tr><td style="font-weight:600;">Customs Importer / Exporter</td><td>${esc(company.customsCode)} · ${esc(company.importExportStatus)}</td></tr>
        <tr><td style="font-weight:600;">Registered Address (Text)</td><td>${esc(company.registeredAddress)}</td></tr>
        <tr><td style="font-weight:600;">Licensed Business Scope</td><td>${esc(company.businessScope)}</td></tr>
      </tbody>
    </table>

    <div class="sec-sub">Registered Branch Offices (3 of 3 Cancelled)</div>
    <table class="inst compact">
      <thead><tr><th style="width:41%;">Branch Name (Redacted)</th><th style="width:17%;">Head</th><th style="width:15%;">City</th><th style="width:15%;">Founded</th><th style="width:12%;">Status</th></tr></thead>
      <tbody>
        ${branches
          .map(
            (b) => `
          <tr>
            <td style="font-weight:600;">${esc(b.name)}</td>
            <td>${esc(b.head)}</td>
            <td>${esc(b.city)}</td>
            <td class="nowrap">${esc(b.founded)}</td>
            <td>${badge(b.status, b.status)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p5 = pageWrap("BUYER DECISION REVIEW ($249)", 5, total, `
    <div class="eyebrow">Section 04 · Capital Contraction &amp; Registry History</div>
    <h2 class="h2-action">Registered capital dropped 81% from its 52M RMB peak across two rapid cuts in 2019–2021</h2>

    <div class="exhibit">
      <div class="ex-k">Exhibit 2</div>
      <div class="ex-t">Registered Capital Trajectory &amp; Contraction (2001–2026, RMB Millions)</div>
      ${svgCapitalLine(capitalHistory)}
      <div class="ex-src">Source: Yiwu AMR Historical Enterprise Filings (29 total registry modifications).</div>
    </div>

    <div class="sec-sub first">Selected Key Historical Registry Changes (2003–2021)</div>
    <table class="inst compact">
      <thead><tr><th style="width:15%;">Filing Date</th><th style="width:28%;">Change Category</th><th style="width:57%;">Recorded Corporate Modification</th></tr></thead>
      <tbody>
        ${keyRegistryChanges
          .slice(0, 7)
          .map(
            (c) => `
          <tr>
            <td class="num">${esc(c.date)}</td>
            <td style="font-weight:600;">${esc(c.item)}</td>
            <td>${esc(c.detail)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p6 = pageWrap("BUYER DECISION REVIEW ($249)", 6, total, `
    <div class="eyebrow">Section 05 · Ownership Penetration &amp; Entity Migration</div>
    <h2 class="h2-action">Shareholders control newly formed 1M RMB shells sharing identical phone and email records</h2>
    <p class="sub-lead">While direct equity remained held by two individuals since 2004, cross-referencing registered phone numbers, email addresses, and officer appointments reveals active migration away from the indebted legacy factory.</p>

    <div class="exhibit">
      <div class="ex-k">Exhibit 3</div>
      <div class="ex-t">Corporate Control &amp; Related-Entity Migration Topology</div>
      ${svgEntityDiagramClean()}
      <div class="ex-src">Source: Cross-analysis of shareholder registries, legal-rep appointments, and annual-report contact footprints (Nov 2026).</div>
    </div>

    <div class="sec-sub first">Direct Registered Shareholders</div>
    <table class="inst">
      <thead><tr><th style="width:36%;">Shareholder &amp; Role</th><th style="width:14%;">Equity %</th><th style="width:16%;">Subscribed</th><th style="width:16%;">Paid-in</th><th style="width:18%;">Holding Since</th></tr></thead>
      <tbody>
        ${shareholders
          .map(
            (s) => `
          <tr>
            <td style="font-weight:600;">${esc(s.name)}</td>
            <td class="num">${esc(s.ratio)}</td>
            <td class="num">${esc(s.subscribed)}</td>
            <td class="num">${esc(s.paidIn)}</td>
            <td>${esc(s.since)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="note">
      <strong>Entity-Mixing Risk:</strong> When a heavily indebted factory files simplified deregistration while its 49% shareholder (Ms. J**) chairs a new local printing company (2023) and associates open trading shells (2022 &amp; 2024) on the exact same contact records, buyers must verify the <em>new</em> contracting entity before paying anything.
    </div>
  `);

  const p7 = pageWrap("BUYER DECISION REVIEW ($249)", 7, total, `
    <div class="eyebrow">Section 06 · Related Entities &amp; Officer Appointments</div>
    <h2 class="h2-action">Six related entities share contact footprints while the Legal Rep's prior companies are mostly cancelled</h2>

    <div class="sec-sub first">Suspected Related Entities &amp; Outbound Investments (6 Entities)</div>
    <table class="inst compact">
      <thead><tr><th style="width:28%;">Related Entity (Redacted)</th><th style="width:13%;">Founded</th><th style="width:14%;">Capital</th><th style="width:31%;">Verified Connection</th><th style="width:14%;">Status</th></tr></thead>
      <tbody>
        ${relatedEntities
          .map(
            (r) => `
          <tr>
            <td style="font-weight:600;">${esc(r.name)}</td>
            <td class="num">${esc(r.founded)}</td>
            <td>${esc(r.capital)}</td>
            <td>${esc(r.link)}</td>
            <td>${badge(r.status, r.status)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="sec-sub">Legal Representative (Mr. L**) Other Historical &amp; Active Appointments</div>
    <table class="inst compact">
      <thead><tr><th style="width:42%;">Entity Name (Redacted)</th><th style="width:24%;">Role / Stake</th><th style="width:14%;">Region</th><th style="width:20%;">Status</th></tr></thead>
      <tbody>
        ${legalRepOtherEntities
          .map(
            (e) => `
          <tr>
            <td style="font-weight:600;">${esc(e.name)}</td>
            <td>${esc(e.role)}</td>
            <td>${esc(e.region)}</td>
            <td>${badge(e.status, e.status)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p8 = pageWrap("BUYER DECISION REVIEW ($249)", 8, total, `
    <div class="eyebrow">Section 07 · Judicial Litigation &amp; Debt Profile</div>
    <h2 class="h2-action">Litigation inverted from receivables recovery (2012–18) to 40.5M+ RMB loan defaults (2019–26)</h2>
    <p class="sub-lead">Across 51 judicial cases, 57 published judgments, 19 filings, and 35 court hearings, the entity shifted sharply after 2018 from plaintiff pursuing domestic distributors to defendant in multi-million RMB financial loan guarantee suits.</p>

    <div class="exhibit">
      <div class="ex-k">Exhibit 4</div>
      <div class="ex-t">Debt &amp; Asset Encumbrance vs. Remaining Registered Capital (RMB Millions)</div>
      <div style="display:grid;grid-template-columns:1.45fr 0.55fr;gap:20px;align-items:center;">
        <div>${svgDebtBarsClean()}</div>
        <div style="border-left:1px solid #CBD5E1;padding-left:18px;">
          <div class="m-k">Active Debt-to-Capital</div>
          <div style="font-size:32pt;font-weight:700;color:#B91C1C;line-height:1.1;margin:6px 0;letter-spacing:-0.02em;">12.4×</div>
          <div style="font-size:8.8pt;color:#475569;line-height:1.45;">123.6M RMB in active enforcement &amp; chattel mortgages against 10.0M RMB remaining capital.</div>
        </div>
      </div>
      <div class="ex-src">Source: China Judgments Online, Supreme People's Court Enforcement Portal, GSXT Chattel Mortgage Filings.</div>
    </div>

    <div class="sec-sub first">Chronological Judicial &amp; Enforcement Evolution (2012–2026)</div>
    <table class="inst compact">
      <thead><tr><th style="width:14%;">Period</th><th style="width:22%;">Category</th><th style="width:14%;">Exposure</th><th style="width:50%;">Verified Case / Judicial Summary</th></tr></thead>
      <tbody>
        ${keyJudicialAndDebt
          .map(
            (j) => `
          <tr>
            <td class="num">${esc(j.date)}</td>
            <td style="font-weight:600;">${esc(j.category)}</td>
            <td class="num" style="color:#B91C1C;">${esc(j.amount)}</td>
            <td>${esc(j.summary)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p9 = pageWrap("BUYER DECISION REVIEW ($249)", 9, total, `
    <div class="eyebrow">Section 08 · Chattel Mortgages &amp; Historical Dishonest Debtors</div>
    <h2 class="h2-action">83.1M RMB in active chattel mortgages and 65.3M RMB in historical dishonest debtor orders</h2>
    <p class="sub-lead">Machinery and inventory pledges combined with senior financial-creditor enforcement orders create immediate deposit-seizure risk for any buyer wiring funds to this mainland legal entity.</p>

    <div class="sec-sub first">Active Chattel Mortgages (3 Filings · Total 83.10M RMB)</div>
    <table class="inst">
      <thead><tr><th style="width:18%;">Reg. No.</th><th style="width:13%;">Date</th><th style="width:26%;">Mortgagee (Creditor)</th><th style="width:18%;">Debt Term</th><th style="width:14%;">Principal</th><th style="width:11%;">Status</th></tr></thead>
      <tbody>
        ${chattelMortgages
          .map(
            (m) => `
          <tr>
            <td>${esc(m.regNo)}</td>
            <td class="num">${esc(m.date)}</td>
            <td style="font-weight:600;">${esc(m.mortgagee)}</td>
            <td>${esc(m.term)}</td>
            <td class="num" style="color:#B91C1C;">${esc(m.amount)}</td>
            <td>${badge(m.status, "CRITICAL")}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="sec-sub">Historical Dishonest Judgment Debtor &amp; High-Consumption Orders (65.27M RMB)</div>
    <table class="inst">
      <thead><tr><th style="width:24%;">Enforcement Case No.</th><th style="width:13%;">Issued</th><th style="width:22%;">Applicant Creditor</th><th style="width:13%;">Amount</th><th style="width:28%;">Summary</th></tr></thead>
      <tbody>
        ${historicalDebtors
          .map(
            (d) => `
          <tr>
            <td>${esc(d.caseNo)}</td>
            <td class="num">${esc(d.date)}</td>
            <td style="font-weight:600;">${esc(d.creditor)}</td>
            <td class="num" style="color:#B91C1C;">${esc(d.amount)}</td>
            <td>${esc(d.detail)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="note red">
      <strong>Deposit Seizure Assessment:</strong> Because senior financial creditors hold an active 40.50M RMB resumed enforcement order (July 2025) alongside 83.10M RMB in active chattel mortgages, any overseas buyer deposit wired to this entity's domestic bank account faces severe risk of immediate court freeze.
    </div>
  `);

  const p10 = pageWrap("BUYER DECISION REVIEW ($249)", 10, total, `
    <div class="eyebrow">Section 09 · Labor Arbitrations &amp; Administrative Penalties</div>
    <h2 class="h2-action">Seven labor arbitrations and five regulatory penalties point to chronic workforce and safety strain</h2>

    <div class="sec-sub first">Labor Arbitrations (7 Cases · 2015–2020)</div>
    <table class="inst compact">
      <thead><tr><th style="width:18%;">Filing Date</th><th style="width:22%;">Arbitration Ref.</th><th style="width:60%;">Recorded Dispute Cause</th></tr></thead>
      <tbody>
        ${laborArbitrations
          .map(
            (l) => `
          <tr>
            <td class="num">${esc(l.date)}</td>
            <td>${esc(l.caseNo)}</td>
            <td>${esc(l.cause)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="sec-sub">Historical Administrative Penalties (5 Records · 2017–2025)</div>
    <table class="inst compact">
      <thead><tr><th style="width:14%;">Date</th><th style="width:20%;">Authority</th><th style="width:14%;">Fine</th><th style="width:52%;">Recorded Regulatory Violation</th></tr></thead>
      <tbody>
        ${adminPenalties
          .map(
            (p) => `
          <tr>
            <td class="num">${esc(p.date)}</td>
            <td style="font-weight:600;">${esc(p.authority)}</td>
            <td class="num">${esc(p.fine)}</td>
            <td>${esc(p.fact)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p11 = pageWrap("BUYER DECISION REVIEW ($249)", 11, total, `
    <div class="eyebrow">Section 10 · Domestic Certificates, IP &amp; Standards</div>
    <h2 class="h2-action">All 58 patents are terminated for unpaid fees and all three recent ISO certificates are revoked</h2>

    <div class="exhibit" style="padding:14px 18px 12px 18px;margin-bottom:22px;">
      <div class="ex-k">Exhibit 5</div>
      <div class="ex-t" style="margin-bottom:10px;">Credential, Patent &amp; Branch Decay Profile (Active vs. Historical Filings)</div>
      ${svgDecayBarsClean()}
      <div class="ex-src" style="margin-top:6px;">Source: CNCA Public Certification Records, CNIPA Patent &amp; Trademark Registry, GSXT Branch Filings.</div>
    </div>

    <div class="sec-sub first" style="margin-bottom:8px;">Domestic Chinese Certificates &amp; Customs Registration</div>
    <table class="inst tight">
      <thead><tr><th style="width:28%;">Certificate</th><th style="width:19%;">Certificate No.</th><th style="width:22%;">Issuing Body</th><th style="width:18%;">Validity</th><th style="width:13%;">Status</th></tr></thead>
      <tbody>
        ${credentialsAndIp.domesticCertificates
          .map(
            (c) => `
          <tr>
            <td style="font-weight:600;">${esc(c.name)}</td>
            <td>${esc(c.certNo)}</td>
            <td>${esc(c.issuer)}</td>
            <td>${esc(c.period)}</td>
            <td>${badge(c.status, c.status)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="sec-sub" style="margin-top:20px;margin-bottom:8px;">Intellectual Property &amp; National Standards Summary</div>
    <table class="inst tight">
      <tbody>
        ${credentialsAndIp.ipSummary
          .map(
            (line, i) => `
          <tr><td style="width:6%;font-weight:700;color:#B91C1C;">0${i + 1}</td><td>${esc(line)}</td></tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p12 = pageWrap("BUYER DECISION REVIEW ($249)", 12, total, `
    <div class="eyebrow">Section 11 · External Digital Footprint &amp; Credit Standing</div>
    <h2 class="h2-action">Every external B2B, recruitment, and domestic social channel is closed or completely silent</h2>
    <p class="sub-lead">Manual cross-checks across English B2B marketplaces, Chinese wholesale portals, recruitment boards, and domestic content platforms independently corroborate the entity's registry wind-down.</p>

    <div class="sec-sub first">5-Channel External Footprint &amp; Market Activity Audit</div>
    <table class="inst">
      <thead><tr><th style="width:28%;">Channel / Platform</th><th style="width:18%;">Observed Status</th><th style="width:54%;">Manual Analyst Verification Findings</th></tr></thead>
      <tbody>
        ${externalFootprint
          .map(
            (e) => `
          <tr>
            <td style="font-weight:600;">${esc(e.channel)}</td>
            <td>${badge(e.status, e.status)}</td>
            <td>${esc(e.detail)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="sec-sub">Official Domestic Credit Ratings &amp; Taxpayer Standing</div>
    <table class="inst">
      <tbody>
        ${credentialsAndIp.creditRatings
          .map(
            (r, i) => `
          <tr><td style="width:6%;font-weight:700;color:#0B1F3A;">0${i + 1}</td><td>${esc(r)}</td></tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="note">
      <strong>Triangulation Insight:</strong> Many healthy traditional Chinese factories lack an independent website—that alone is never a red flag. What makes this case critical is total multi-channel shutdown (0 insured staff, 0 BOSS Zhipin jobs, closed Alibaba &amp; 1688 stores, 58/58 lapsed patents) occurring simultaneously with simplified deregistration and 40.5M RMB court enforcement.
    </div>
  `);

  const p13 = pageWrap("BUYER DECISION REVIEW ($249)", 13, total, `
    <div class="eyebrow">Section 12 · Buyer Action Playbook &amp; RFQ Script</div>
    <h2 class="h2-action">Five realistic pre-payment safeguards and direct questions for the sales representative</h2>
    <p class="sub-lead" style="margin-bottom:18px;">Calibrated to authentic China export practice—requesting only standard onboarding documents legitimate factories routinely accept (watermarked business license, stamped PI, 1-page payment authorization letter if using a Hong Kong account, and a 5-minute live video check).</p>

    <div class="sec-sub first">Recommended Pre-Payment Safeguards</div>
    <div>
      ${practicalSafeguards
        .map(
          (s, i) => `
        <div class="act-row">
          <div class="act-n">0${i + 1}</div>
          <div>${esc(s)}</div>
        </div>
      `,
        )
        .join("")}
    </div>

    <div class="rfq-block">
      <h3>Direct Trap-Testing Questions to Send the Sales Representative</h3>
      <ol>
        ${rfqQuestions.map((q) => `<li>&ldquo;${esc(q)}&rdquo;</li>`).join("")}
      </ol>
    </div>

    <div class="note" style="margin-top:16px;padding:11px 14px;font-size:8.8pt;line-height:1.5;">
      <strong>Pairing Desk Due Diligence with On-Site QC:</strong> Desk reviews ($149–$249) eliminate winding-down shells, debt traps, and revoked domestic credentials <em>before</em> you wire a deposit. Once an active manufacturing entity is verified, pair bulk production with physical sample testing and third-party pre-shipment inspection (SGS / TÜV).
    </div>
  `);

  const p14 = renderBackCover(logoUri, data, "BUYER DECISION REVIEW ($249)", false);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><style>${buildCss(fontCss)}</style></head><body>${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}${p9}${p10}${p11}${p12}${p13}${p14}</body></html>`;
}

function resolveExecutablePath() {
  for (const candidate of CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

async function renderPdf(browser, html, outPath) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });
  await page.close();
}

async function exportPreviews(browser, html, items, outDir) {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(outDir, { recursive: true });
  const sheets = page.locator("section.cover-sheet, section.page");
  for (const { pageNum, file } of items) {
    const pngBuffer = await sheets.nth(pageNum - 1).screenshot({ type: "png" });
    const outPath = path.join(outDir, file);
    await sharp(pngBuffer).resize({ width: 960 }).webp({ quality: 86 }).toFile(outPath);
    console.log("Preview:", outPath);
  }
  await page.close();
}

async function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0] || "scripts/report-data/sample-zhejiang-knitting.json";
  const tierIdx = args.indexOf("--tier");
  const tier = tierIdx >= 0 ? args[tierIdx + 1] : "both";
  const outIdx = args.indexOf("--out");
  const customOut = outIdx >= 0 ? args[outIdx + 1] : null;
  const doPreviews = args.includes("--previews");

  const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const logoUri = loadLogoDataUri();
  const fontCss = loadInterFontCss();
  const executablePath = resolveExecutablePath();

  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  try {
    if (tier === "149" || tier === "both") {
      const html149 = build149(data, logoUri, fontCss);
      const out149 =
        customOut && tier === "149"
          ? customOut
          : path.resolve("public/samples/gocnscout-sample-identity-check-149.pdf");
      await renderPdf(browser, html149, out149);
      console.log("Generated:", out149);
      if (doPreviews) {
        await exportPreviews(
          browser,
          html149,
          Array.from({ length: 9 }, (_, i) => ({
            pageNum: i + 1,
            file: `identity-149-p${String(i + 1).padStart(2, "0")}.webp`,
          })),
          path.resolve("public/samples/previews"),
        );
      }
    }

    if (tier === "249" || tier === "both") {
      const html249 = build249(data, logoUri, fontCss);
      const out249 =
        customOut && tier === "249"
          ? customOut
          : path.resolve("public/samples/gocnscout-sample-decision-review-249.pdf");
      await renderPdf(browser, html249, out249);
      console.log("Generated:", out249);
      if (doPreviews) {
        await exportPreviews(
          browser,
          html249,
          Array.from({ length: 14 }, (_, i) => ({
            pageNum: i + 1,
            file: `decision-249-p${String(i + 1).padStart(2, "0")}.webp`,
          })),
          path.resolve("public/samples/previews"),
        );
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
