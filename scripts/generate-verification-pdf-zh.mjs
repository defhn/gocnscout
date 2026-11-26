#!/usr/bin/env node
/**
 * GoCNScout Publication-Grade Chinese PDF Generator (v5 — Modern Institutional Design System)
 * Exact visual & structural twin of generate-verification-pdf.mjs (English v5):
 * - 9-page $149 Supplier Identity Check (Chinese)
 * - 14-page $249 Buyer Decision Review (Chinese)
 * - Embedded Inter (400/500/600/700) + Microsoft YaHei UI for crisp bilingual typography
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

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
  const t = String(tone);
  let cls = "tag";
  if (
    t.includes("极高") ||
    t.includes("已撤销") ||
    t.includes("已注销") ||
    t.includes("全部已注销") ||
    t.includes("CRITICAL")
  ) {
    cls = "tag tag-red";
  } else if (
    t.includes("高风险") ||
    t.includes("已关闭") ||
    t.includes("已过期") ||
    t.includes("0 在招") ||
    t.includes("无活跃") ||
    t.includes("风险") ||
    t.includes("失修")
  ) {
    cls = "tag tag-slate";
  } else if (t.includes("存续") || t.includes("有效") || t.includes("低风险")) {
    cls = "tag tag-navy";
  }
  return `<span class="${cls}">${esc(label)}</span>`;
}

const FONT_STACK = `"Inter", "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", sans-serif`;

/* ---------- CLEAN CHINESE VECTOR EXHIBITS ---------- */

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
    { k: "LOW", t: "一级 · 低风险", sub: "常规贸易防护后推进", x: 0 },
    { k: "WATCH", t: "二级 · 中等关注", sub: "先澄清1–2项疑点", x: 155 },
    { k: "HIGH", t: "三级 · 高风险", sub: "暂缓定金并升级核查", x: 310 },
    { k: "CRITICAL", t: "四级 · 极高风险", sub: "触发熔断 / 严禁付款", x: 465 },
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
            <text x="${s.x + 74.5}" y="46" text-anchor="middle" font-size="10.5" font-weight="${on ? "700" : "600"}" fill="${tc}" font-family=${JSON.stringify(FONT_STACK)}>${s.t}</text>
            <text x="${s.x + 74.5}" y="62" text-anchor="middle" font-size="8.8" font-weight="400" fill="${sc}" font-family=${JSON.stringify(FONT_STACK)}>${s.sub}</text>
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
  const labels = ["主体存续状态", "股权与关联体", "司法与债务", "经营规模与ISO", "专利与标准", "外部活跃度"];
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
      <text x="${lx.toFixed(1)}" y="${(ly - 2).toFixed(1)}" text-anchor="${anc}" font-size="10.5" font-weight="600" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>${labels[i]}</text>
      <text x="${lx.toFixed(1)}" y="${(ly + 12).toFixed(1)}" text-anchor="${anc}" font-size="9.5" font-weight="700" fill="#B91C1C" font-family=${JSON.stringify(FONT_STACK)}>${sc.score} / 5 分</text>
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
    pL = 52,
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
        <text x="${pL - 9}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="9.5" font-weight="500" fill="#64748B" font-family=${JSON.stringify(FONT_STACK)}>${v === 0 ? "0" : `${v * 100}万`}</text>
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
             <text x="${(peak.x + 23).toFixed(1)}" y="28" font-size="9.5" font-weight="600" fill="#B91C1C" font-family=${JSON.stringify(FONT_STACK)}>峰值 5,200万 → 1,000万（缩水 −81%）</text>`
          : ""
      }
      ${pts
        .map((p) => {
          const drop = p.year === "2019" || p.year === "2021" || p.year === "2026";
          const col = drop ? "#B91C1C" : "#0B1F3A";
          return `
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.8" fill="${col}" />
            <text x="${p.x.toFixed(1)}" y="${(p.y - 10).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${col}" font-family=${JSON.stringify(FONT_STACK)}>${p.rmbMillions * 100}万</text>
            <text x="${p.x.toFixed(1)}" y="${(pT + ph + 19).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="500" fill="#475569" font-family=${JSON.stringify(FONT_STACK)}>${p.year}</text>
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

      <text x="90" y="16" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.6" fill="#64748B" font-family=${JSON.stringify(FONT_STACK)}>直接持股自然人</text>
      <text x="320" y="16" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.6" fill="#B91C1C" font-family=${JSON.stringify(FONT_STACK)}>被核查主体（拟注销）</text>
      <text x="554" y="16" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing="0.6" fill="#0B1F3A" font-family=${JSON.stringify(FONT_STACK)}>同联系方式新设关联体</text>

      <!-- Connectors -->
      <path d="M174,82 L224,112" fill="none" stroke="#64748B" stroke-width="1.4" />
      <path d="M174,178 L224,148" fill="none" stroke="#64748B" stroke-width="1.4" />
      <path d="M414,106 L460,68" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#arrRed)" />
      <path d="M414,130 L460,134" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#arrRed)" />
      <path d="M414,154 L460,198" fill="none" stroke="#B91C1C" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#arrRed)" />

      <!-- Left Cards -->
      <rect x="6" y="44" width="168" height="74" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="6" y="44" width="4" height="74" rx="2" fill="#0B1F3A" />
      <text x="20" y="68" font-size="11" font-weight="700" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>L** 先生 · 51%</text>
      <text x="20" y="86" font-size="9.2" fill="#475569" font-family=${JSON.stringify(FONT_STACK)}>法定代表人 / 执行董事</text>
      <text x="20" y="103" font-size="8.8" fill="#64748B" font-family=${JSON.stringify(FONT_STACK)}>实缴出资 510 万元</text>

      <rect x="6" y="140" width="168" height="74" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="6" y="140" width="4" height="74" rx="2" fill="#0B1F3A" />
      <text x="20" y="164" font-size="11" font-weight="700" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>J** 女士 · 49%</text>
      <text x="20" y="182" font-size="9.2" fill="#475569" font-family=${JSON.stringify(FONT_STACK)}>监事 · 同时担任法人</text>
      <text x="20" y="199" font-size="8.8" font-weight="600" fill="#B91C1C" font-family=${JSON.stringify(FONT_STACK)}>2023 新设印务公司 →</text>

      <!-- Center Target -->
      <rect x="224" y="54" width="190" height="150" rx="4" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1.4" />
      <rect x="224" y="54" width="190" height="26" rx="4" fill="#B91C1C" />
      <rect x="224" y="72" width="190" height="8" fill="#B91C1C" />
      <text x="319" y="71" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="0.6" fill="#FFFFFF" font-family=${JSON.stringify(FONT_STACK)}>简易注销公告中</text>
      <text x="319" y="104" text-anchor="middle" font-size="11" font-weight="700" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>浙江[已脱敏]</text>
      <text x="319" y="120" text-anchor="middle" font-size="10.5" font-weight="600" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>针织有限公司</text>
      <line x1="242" y1="133" x2="396" y2="133" stroke="#E2E8F0" stroke-width="1" />
      <text x="319" y="152" text-anchor="middle" font-size="9.2" font-weight="600" fill="#B91C1C" font-family=${JSON.stringify(FONT_STACK)}>4,050万元 恢复执行</text>
      <text x="319" y="170" text-anchor="middle" font-size="9.2" font-weight="600" fill="#B91C1C" font-family=${JSON.stringify(FONT_STACK)}>8,310万元 动产抵押</text>
      <text x="319" y="188" text-anchor="middle" font-size="9" fill="#475569" font-family=${JSON.stringify(FONT_STACK)}>0 参保员工（2024–2025）</text>

      <!-- Right New Shells -->
      <rect x="464" y="38" width="180" height="58" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="464" y="38" width="4" height="58" rx="2" fill="#B91C1C" />
      <text x="478" y="59" font-size="10" font-weight="700" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>义乌[已脱敏]印务公司</text>
      <text x="478" y="75" font-size="8.8" fill="#475569" font-family=${JSON.stringify(FONT_STACK)}>2023-04 成立 · 100万 · J**</text>
      <text x="478" y="89" font-size="8.4" font-weight="600" fill="#B91C1C" font-family=${JSON.stringify(FONT_STACK)}>共用注册电话与邮箱</text>

      <rect x="464" y="106" width="180" height="58" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="464" y="106" width="4" height="58" rx="2" fill="#0B1F3A" />
      <text x="478" y="127" font-size="10" font-weight="700" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>义乌[已脱敏]贸易（A）</text>
      <text x="478" y="143" font-size="8.8" fill="#475569" font-family=${JSON.stringify(FONT_STACK)}>2024-10 成立 · 100万 · 存续</text>
      <text x="478" y="157" font-size="8.4" fill="#64748B" font-family=${JSON.stringify(FONT_STACK)}>共用注册电子邮箱</text>

      <rect x="464" y="174" width="180" height="58" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.1" />
      <rect x="464" y="174" width="4" height="58" rx="2" fill="#0B1F3A" />
      <text x="478" y="195" font-size="10" font-weight="700" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>义乌[已脱敏]贸易（B）</text>
      <text x="478" y="211" font-size="8.8" fill="#475569" font-family=${JSON.stringify(FONT_STACK)}>2022-03 成立 · 100万 · 存续</text>
      <text x="478" y="225" font-size="8.4" fill="#64748B" font-family=${JSON.stringify(FONT_STACK)}>共用电话与邮箱（另含3家）</text>
    </svg>
  `;
}

function svgDebtBarsClean() {
  const rows = [
    { label: "有效动产抵押（3笔）", v: 83.1, txt: "8,310万", c: "#B91C1C" },
    { label: "历史失信被执行（2笔）", v: 65.27, txt: "6,527万", c: "#475569" },
    { label: "恢复强制执行（2025年）", v: 40.5, txt: "4,050万", c: "#B91C1C" },
    { label: "当前剩余注册资本", v: 10.0, txt: "1,000万", c: "#0B1F3A" },
  ];
  const max = 92;
  return `
    <svg viewBox="0 0 430 144" width="100%" height="140" xmlns="http://www.w3.org/2000/svg">
      ${rows
        .map((r, i) => {
          const y = 8 + i * 34;
          const bw = Math.round((r.v / max) * 185);
          return `
            <text x="0" y="${y + 13}" font-size="10" font-weight="600" fill="#1E293B" font-family=${JSON.stringify(FONT_STACK)}>${r.label}</text>
            <rect x="168" y="${y + 2}" width="185" height="14" rx="2" fill="#E2E8F0" />
            <rect x="168" y="${y + 2}" width="${bw}" height="14" rx="2" fill="${r.c}" />
            <text x="${176 + bw}" y="${y + 13}" font-size="10" font-weight="700" fill="${r.c}" font-family=${JSON.stringify(FONT_STACK)}>${r.txt}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function svgDecayBarsClean() {
  const items = [
    { label: "有效中国专利", active: 0, total: 58, note: "0 / 58（100% 未缴年费终止）" },
    { label: "近期 ISO 体系认证", active: 0, total: 3, note: "0 / 3（100% 已撤销）" },
    { label: "在营分支机构", active: 0, total: 3, note: "0 / 3（100% 已注销）" },
    { label: "存续历史商标", active: 26, total: 30, note: "26 / 30（近 13 年 0 新增）" },
  ];
  return `
    <svg viewBox="0 0 600 124" width="100%" height="118" xmlns="http://www.w3.org/2000/svg">
      ${items
        .map((it, i) => {
          const y = 6 + i * 29;
          const pct = it.total > 0 ? it.active / it.total : 0;
          const w = Math.round(pct * 200);
          return `
            <text x="0" y="${y + 12}" font-size="10" font-weight="600" fill="#0F172A" font-family=${JSON.stringify(FONT_STACK)}>${it.label}</text>
            <rect x="150" y="${y + 2}" width="200" height="12" rx="2" fill="#E2E8F0" />
            ${w > 0 ? `<rect x="150" y="${y + 2}" width="${w}" height="12" rx="2" fill="#0B1F3A" />` : `<rect x="150" y="${y + 2}" width="4" height="12" rx="1" fill="#B91C1C" />`}
            <text x="364" y="${y + 12}" font-size="9.5" font-weight="${it.active === 0 ? "700" : "500"}" fill="${it.active === 0 ? "#B91C1C" : "#334155"}" font-family=${JSON.stringify(FONT_STACK)}>${it.note}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

/* ---------- V5 MODERN INSTITUTIONAL PRINT CSS (CHINESE) ---------- */

function buildCss(fontCss) {
  return `
    ${fontCss}
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: ${FONT_STACK};
      font-variant-numeric: lining-nums tabular-nums;
      color: #0F172A;
      background: #FFFFFF;
      font-size: 10pt;
      line-height: 1.68;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

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
    .c-meta { font-size: 8.4pt; font-weight: 600; letter-spacing: 0.06em; color: #94A3B8; }

    .cover-body { position: relative; z-index: 2; }
    .c-kicker {
      font-size: 9.5pt; font-weight: 600; letter-spacing: 0.1em;
      color: #CBD5E1; margin-bottom: 16px;
    }
    .c-h1 {
      font-size: 31pt; font-weight: 700; line-height: 1.2; letter-spacing: -0.01em;
      margin: 0 0 24px 0; color: #FFFFFF; max-width: 156mm;
    }
    .c-rule-short { width: 48px; height: 3px; background: #B91C1C; margin-bottom: 24px; }
    .c-target-k { font-size: 8.5pt; font-weight: 600; letter-spacing: 0.06em; color: #94A3B8; }
    .c-target-v { font-size: 18pt; font-weight: 700; color: #FFFFFF; margin: 6px 0 30px 0; }

    .c-verdict {
      border-top: 2px solid #B91C1C;
      border-bottom: 1px solid rgba(255,255,255,0.16);
      padding: 18px 0;
      max-width: 156mm;
    }
    .cv-k { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.08em; color: #FCA5A5; }
    .cv-t { font-size: 14.5pt; font-weight: 700; color: #FFFFFF; margin: 6px 0 8px 0; }
    .cv-d { font-size: 9.8pt; color: #CBD5E1; margin: 0; line-height: 1.65; }

    .cover-bottom {
      position: relative; z-index: 2;
      border-top: 1px solid rgba(255,255,255,0.16);
      padding-top: 14px;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    }
    .cb-k { display: block; font-size: 8pt; font-weight: 600; letter-spacing: 0.06em; color: #94A3B8; margin-bottom: 4px; }
    .cb-v { font-size: 9.5pt; font-weight: 600; color: #FFFFFF; }

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
      font-size: 8.2pt;
      font-weight: 500;
      letter-spacing: 0.04em;
      color: #64748B;
    }
    .p-head strong { color: #0B1F3A; font-weight: 700; }
    .p-foot {
      margin-top: auto;
      border-top: 1px solid #E2E8F0;
      padding-top: 9px;
      display: flex; justify-content: space-between;
      font-size: 8.2pt;
      color: #64748B;
    }

    .eyebrow {
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #B91C1C;
      margin-bottom: 6px;
    }
    .h2-action {
      font-size: 17.5pt;
      font-weight: 700;
      line-height: 1.3;
      color: #0F172A;
      margin: 0 0 12px 0;
    }
    .sub-lead {
      font-size: 9.8pt;
      color: #475569;
      margin: 0 0 26px 0;
      line-height: 1.65;
    }

    .sec-sub {
      font-size: 11pt;
      font-weight: 700;
      color: #0F172A;
      margin: 34px 0 12px 0;
    }
    .sec-sub.first { margin-top: 0; }

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
      font-size: 8.2pt;
      font-weight: 600;
      color: #64748B;
    }
    .m-v {
      font-size: 19pt;
      font-weight: 700;
      color: #0B1F3A;
      line-height: 1.2;
      margin: 6px 0 4px 0;
      white-space: nowrap;
    }
    .m-v.red { color: #B91C1C; }
    .m-s { font-size: 8.4pt; color: #475569; }

    .exhibit {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      padding: 18px 20px 14px 20px;
      margin: 0 0 34px 0;
    }
    .ex-k {
      font-size: 8.2pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #B91C1C;
    }
    .ex-t {
      font-size: 11pt;
      font-weight: 700;
      color: #0F172A;
      margin: 2px 0 14px 0;
    }
    .ex-src {
      font-size: 8pt;
      color: #64748B;
      margin-top: 10px;
    }

    table.inst {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      font-size: 9pt;
      line-height: 1.54;
    }
    table.inst th {
      text-align: left;
      font-size: 8.2pt;
      font-weight: 600;
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
    table.inst.compact td { padding: 7.5px 10px; }
    table.inst.tight td { padding: 5.5px 9px; font-size: 8.6pt; line-height: 1.46; }
    table.inst.tight th { padding: 7px 9px; }
    .num { font-weight: 600; white-space: nowrap; }
    .nowrap { white-space: nowrap; }

    .tag {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: 600;
      border: 1px solid #CBD5E1;
      color: #334155;
      background: #FFFFFF;
      white-space: nowrap;
      line-height: 1.35;
    }
    .tag-red { border-color: #FECACA; color: #B91C1C; background: #FEF2F2; }
    .tag-slate { border-color: #CBD5E1; color: #0F172A; background: #F1F5F9; }
    .tag-navy { border-color: #BFDBFE; color: #0B1F3A; background: #EFF6FF; }

    .note {
      border-left: 3px solid #0B1F3A;
      background: #F8FAFC;
      padding: 14px 16px;
      margin-top: 24px;
      font-size: 9.4pt;
      line-height: 1.62;
      color: #1E293B;
      border-radius: 0 4px 4px 0;
    }
    .note.red { border-left-color: #B91C1C; background: #FEF2F2; }
    .note strong { color: #0F172A; }
    .note.red strong { color: #991B1B; }

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

    .act-row {
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 10px;
      padding: 7.5px 0;
      border-bottom: 1px solid #E2E8F0;
      font-size: 9pt;
      line-height: 1.54;
      color: #1E293B;
    }
    .act-row:last-child { border-bottom: none; }
    .act-n { font-size: 10pt; font-weight: 700; color: #0B1F3A; }

    .rfq-block {
      background: #0B1F3A;
      color: #FFFFFF;
      border-radius: 4px;
      padding: 16px 20px;
      margin-top: 20px;
    }
    .rfq-block h3 {
      font-size: 8.4pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #94A3B8;
      margin: 0 0 10px 0;
    }
    .rfq-block ol { margin: 0; padding-left: 18px; }
    .rfq-block li { font-size: 8.9pt; color: #F1F5F9; margin-bottom: 7px; line-height: 1.52; }
    .rfq-block li:last-child { margin-bottom: 0; }

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
      font-size: 8.4pt;
      font-weight: 700;
      color: #0B1F3A;
      margin-bottom: 6px;
    }
    .scope-box.red .scope-title { color: #B91C1C; }
    .scope-list { margin: 0; padding-left: 16px; font-size: 8.5pt; color: #334155; line-height: 1.54; }
    .scope-list li { margin-bottom: 3px; }
  `;
}

function pageWrap(headerTitle, pageNum, totalPages, body) {
  return `
    <section class="page">
      <div class="p-head">
        <span><strong>GOCNSCOUT</strong> · ${esc(headerTitle)}</span>
        <span>公开脱敏样例 · 买方保密</span>
      </div>
      <div style="flex:1;">${body}</div>
      <div class="p-foot">
        <span>GoCNScout 独立买方商业情报 · 基于公开工商与司法记录的独立桌面尽调</span>
        <span>第 ${String(pageNum).padStart(2, "0")} 页 / 共 ${String(totalPages).padStart(2, "0")} 页</span>
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
        <div class="c-meta">独立供应商尽调 · ${esc(meta.reportId)}</div>
      </div>

      <div class="cover-body">
        <div class="c-kicker">${esc(tierTitle)}</div>
        <h1 class="c-h1">${esc(subtitle)}</h1>
        <div class="c-rule-short"></div>
        <div class="c-target-k">被核查中国企业主体（公开脱敏样例）</div>
        <div class="c-target-v">${esc(company.englishName)}</div>

        <div class="c-verdict">
          <div class="cv-k">核心风险定级 · 触发强制熔断规则</div>
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
        <div class="c-meta">报告正文结束 · ${esc(tierLabel)}</div>
      </div>

      <div class="cover-body">
        <div class="c-kicker">100% 买方付费 · 绝对中立立场</div>
        <h2 style="font-size:23pt;font-weight:700;line-height:1.28;margin:0 0 18px 0;max-width:154mm;color:#FFFFFF;">
          零供应商佣金，零广告排名费。专为海外采购商打造的独立尽调情报。
        </h2>
        <div class="c-rule-short"></div>
        <p style="font-size:9.8pt;color:#CBD5E1;max-width:154mm;margin:0 0 26px 0;line-height:1.68;">
          每一份 GoCNScout 尽调报告均通过中国官方工商、司法、海关及公开平台静默交叉核验完成，全程不联系、不惊动目标供应商。
        </p>

        ${
          is149
            ? `
          <div style="border-top:2px solid #FFFFFF;border-bottom:1px solid rgba(255,255,255,0.16);padding:16px 0;margin-bottom:24px;max-width:154mm;">
            <div style="font-size:8.4pt;font-weight:700;color:#94A3B8;margin-bottom:6px;">需要更深入的股权穿透、动产抵押、知识产权与国内社媒核查？</div>
            <p style="margin:0;font-size:9.4pt;color:#E2E8F0;line-height:1.62;">
              可升级至 <strong>$249 买家决策深度尽调版（14页完整报告）</strong> 或 <strong>$499 三家供应商打包对比方案</strong>，涵盖 6 维量化评分、关联壳公司拓扑、8,310万元动产抵押、国内 ISO/专利状态、劳动仲裁、国内社媒口碑及定制询盘核验问题。
            </p>
          </div>
        `
            : ""
        }

        <div style="border-top:1px solid rgba(255,255,255,0.16);border-bottom:1px solid rgba(255,255,255,0.16);padding:16px 0;margin-bottom:28px;max-width:154mm;">
          <div style="font-size:8.4pt;font-weight:700;color:#94A3B8;margin-bottom:6px;">服务边界与免责声明</div>
          <p style="margin:0;font-size:8.8pt;color:#CBD5E1;line-height:1.65;">
            本报告基于截至 ${esc(meta.reportDate)} 的中国公开记录独立汇编。桌面尽调<strong>不包含</strong>实地验厂、卫星影像审计、企业私密银行账户核验、提供加盖公章的原始营业执照扫描件，或海外实验室产品认证（CE/FCC/FDA/UL）真伪审核。报告仅作买方风险筛查决策参考，不替代实物打样测试及第三方大货出运前验货（SGS / TÜV）。
          </p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;max-width:154mm;">
          <div>
            <div class="cb-k">在线预约供应商核查</div>
            <div style="font-size:11pt;font-weight:700;color:#FFFFFF;">https://gocnscout.com/pricing</div>
            <div style="font-size:8.8pt;color:#94A3B8;margin-top:4px;">先邮件确认可核查范围与报价，再通过 Stripe 付款。</div>
          </div>
          <div>
            <div class="cb-k">分析师 1对1 直连通道</div>
            <div style="font-size:11pt;font-weight:700;color:#FFFFFF;">WhatsApp: +86 156 5890 1753</div>
            <div style="font-size:8.8pt;color:#94A3B8;margin-top:4px;">邮箱：gerry@gocnscout.com · 24–48小时交付</div>
          </div>
        </div>
      </div>

      <div class="cover-bottom">
        <div><span class="cb-k">报告编号</span><span class="cb-v">${esc(meta.reportId)}</span></div>
        <div><span class="cb-k">出具日期</span><span class="cb-v">${esc(meta.reportDate)}</span></div>
        <div><span class="cb-k">密级标识</span><span class="cb-v">公开脱敏样例</span></div>
        <div><span class="cb-k">官方网站</span><span class="cb-v">gocnscout.com</span></div>
      </div>
    </section>
  `;
}

/* ---------- $149 供应商身份核查 — 9 页中文版 ---------- */

function build149(data, logoUri, fontCss) {
  const { meta, verdict, company, branches, keyRegistryChanges, adminPenalties, basicChecks149, externalFootprint, practicalSafeguards } = data;
  const total = 9;

  const p1 = renderCover(
    logoUri,
    data,
    "供应商基础身份核查 · $149 档位",
    "中国供应商工商身份与风险初筛报告",
    "存在正在公示的简易注销公告（2026年11月6日至26日）、4,050万元法院恢复执行、0名参保员工、5条行政处罚记录及全渠道 B2B 店铺关闭。",
    [
      ["服务档位", "身份核查（$149）"],
      ["报告页数", `共 ${total} 页（脱敏版）`],
      ["出具日期", meta.reportDate],
      ["核查方式", "静默桌面尽调"],
    ],
  );

  const p2 = pageWrap("供应商基础身份核查（$149）", 2, total, `
    <div class="eyebrow">第 01 部分 · 执行摘要</div>
    <h2 class="h2-action">25年老牌工厂光环背后，实为拟简易注销且背负 4,050 万元执行的风险主体</h2>

    <div class="metric-strip">
      <div class="m-cell"><div class="m-k">综合风险等级</div><div class="m-v red">极高风险</div><div class="m-s">触发强制熔断</div></div>
      <div class="m-cell"><div class="m-k">工商注销动态</div><div class="m-v red">2026.11</div><div class="m-s">简易注销公告期</div></div>
      <div class="m-cell"><div class="m-k">2025 参保员工</div><div class="m-v red">0 人</div><div class="m-s">3家分支全部注销</div></div>
      <div class="m-cell"><div class="m-k">恢复执行标的</div><div class="m-v red">4,050万</div><div class="m-s">人民币法院执行</div></div>
    </div>

    <div class="sec-sub first">核心执行摘要</div>
    <p style="margin:0;color:#334155;">${esc(verdict.executiveSummary149)}</p>

    <div class="note red">
      <strong>强制熔断规则触发：</strong>${esc(verdict.criticalOverrideReason)}
    </div>

    <div class="sec-sub">报告目录</div>
    <div class="toc-grid">
      <div class="toc-row"><span><span class="toc-num">01</span>核心执行摘要</span><span class="toc-pg">02</span></div>
      <div class="toc-row"><span><span class="toc-num">05</span>历史工商变更记录</span><span class="toc-pg">06</span></div>
      <div class="toc-row"><span><span class="toc-num">02</span>风险分级与三项初筛</span><span class="toc-pg">03</span></div>
      <div class="toc-row"><span><span class="toc-num">06</span>司法执行与行政处罚</span><span class="toc-pg">07</span></div>
      <div class="toc-row"><span><span class="toc-num">03</span>工商法定注册全表</span><span class="toc-pg">04</span></div>
      <div class="toc-row"><span><span class="toc-num">07</span>B2B核查与付款防护</span><span class="toc-pg">08</span></div>
      <div class="toc-row"><span><span class="toc-num">04</span>资本轨迹与分支机构</span><span class="toc-pg">05</span></div>
      <div class="toc-row"><span><span class="toc-num">08</span>免责声明与直连通道</span><span class="toc-pg">09</span></div>
    </div>
  `);

  const p3 = pageWrap("供应商基础身份核查（$149）", 3, total, `
    <div class="eyebrow">第 02 部分 · 风险分级与三项核心初筛</div>
    <h2 class="h2-action">三项基础核查维度全部命中高风险或极高风险红线</h2>
    <p class="sub-lead">$149 供应商基础身份核查围绕三大核心支柱展开，采用清晰的四级风险定级体系。凡存在正在公示的注销公告或大额司法强制执行，系统将自动触发四级极高风险熔断。</p>

    <div class="exhibit">
      <div class="ex-k">图表 1</div>
      <div class="ex-t">GoCNScout 四级风险定级标尺</div>
      ${svgRiskScale("CRITICAL")}
      <div class="ex-src">来源：GoCNScout 买方标准风险评估体系（2026年11月）。</div>
    </div>

    <div class="sec-sub first">三项基础身份与风险初筛结论</div>
    <table class="inst">
      <thead><tr><th style="width:28%;">核查维度</th><th style="width:14%;">判定结果</th><th style="width:58%;">已核验公开记录证据</th></tr></thead>
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
      <strong>分析师提示：</strong>$149 档位专为“打样前快速排雷”设计。由于该主体已在第一项（简易注销公告）和第二项（4,050万元恢复执行）双双触及硬性红线，建议买方立即停止与该主体推进商务谈判。
    </div>
  `);

  const p4 = pageWrap("供应商基础身份核查（$149）", 4, total, `
    <div class="eyebrow">第 03 部分 · 工商法定注册信息</div>
    <h2 class="h2-action">官方工商档案证实 25 年经营历史，但当前参保员工为 0 且已启动注销</h2>
    <p class="sub-lead">所有字段均直接核验自国家企业信用信息公示系统、企业年报及中国海关公开备案记录。本服务仅报告核验后的法定登记信息，不代为提供原件营业执照扫描件。</p>

    <table class="inst compact">
      <thead><tr><th style="width:28%;">法定登记字段</th><th style="width:72%;">已核验公开登记值</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:600;">企业法定名称（脱敏）</td><td><strong>${esc(company.englishName)}</strong></td></tr>
        <tr><td style="font-weight:600;">历史曾用名</td><td>${esc(company.formerName)}</td></tr>
        <tr><td style="font-weight:600;">统一社会信用代码</td><td>${esc(company.uscc)}（组织机构代码：${esc(company.orgCode)}）</td></tr>
        <tr><td style="font-weight:600;">当前登记状态</td><td><strong style="color:#B91C1C;">${esc(company.registrationStatus)}</strong></td></tr>
        <tr><td style="font-weight:600;">法定代表人</td><td>${esc(company.legalRepresentative)}</td></tr>
        <tr><td style="font-weight:600;">成立日期 / 核准日期</td><td>${esc(company.establishmentDate)} · 最近核准：${esc(company.approvalDate)}</td></tr>
        <tr><td style="font-weight:600;">营业期限与登记机关</td><td>${esc(company.operatingTerm)} · ${esc(company.registrationAuthority)}</td></tr>
        <tr><td style="font-weight:600;">注册资本与实缴资本</td><td>${esc(company.registeredCapital)} · 实缴：${esc(company.paidInCapital)}</td></tr>
        <tr><td style="font-weight:600;">企业类型与划型规模</td><td>${esc(company.companyType)} · 规模：${esc(company.companyScale)}</td></tr>
        <tr><td style="font-weight:600;">年报社保参保人数</td><td><strong style="color:#B91C1C;">${esc(company.insuredEmployees2025)}</strong>（2024年报：0人）</td></tr>
        <tr><td style="font-weight:600;">海关进出口备案</td><td>${esc(company.customsCode)} · ${esc(company.importExportStatus)}</td></tr>
        <tr><td style="font-weight:600;">注册地址（文本）</td><td>${esc(company.registeredAddress)}</td></tr>
        <tr><td style="font-weight:600;">核准经营范围</td><td>${esc(company.businessScope)}</td></tr>
      </tbody>
    </table>
  `);

  const p5 = pageWrap("供应商基础身份核查（$149）", 5, total, `
    <div class="eyebrow">第 04 部分 · 注册资本轨迹与分支机构</div>
    <h2 class="h2-action">注册资本较 5,200 万元峰值缩水 81%，名下 3 家分支机构全部注销</h2>
    <p class="sub-lead">追踪长期资本变动与分支机构存续状态，有助于区分稳健扩张工厂与持续收缩壳体。2019 至 2021 年间，股东连续两次大幅削减注册资本。</p>

    <div class="exhibit">
      <div class="ex-k">图表 2</div>
      <div class="ex-t">注册资本历史变动轨迹（2001–2026，人民币万元）</div>
      ${svgCapitalLine(data.capitalHistory)}
      <div class="ex-src">来源：义乌市市场监督管理局历史工商变更记录（共 29 条变更，图中展示核心资本节点）。</div>
    </div>

    <div class="sec-sub first">注册分支机构清单（3 家全部已注销）</div>
    <table class="inst">
      <thead><tr><th style="width:40%;">分支机构名称（脱敏）</th><th style="width:17%;">负责人</th><th style="width:15%;">所在城市</th><th style="width:15%;">成立日期</th><th style="width:13%;">状态</th></tr></thead>
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

  const p6 = pageWrap("供应商基础身份核查（$149）", 6, total, `
    <div class="eyebrow">第 05 部分 · 历史工商变更记录</div>
    <h2 class="h2-action">九项里程碑变更完整勾勒企业由盛转衰（2001–2021）轨迹</h2>
    <p class="sub-lead">以下精选自义乌市市场监督管理局存档的 29 条历史工商变更记录。</p>

    <table class="inst">
      <thead><tr><th style="width:15%;">变更日期</th><th style="width:26%;">变更事项</th><th style="width:59%;">具体变更内容</th></tr></thead>
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
      <strong>演进规律解读：</strong>2001 至 2008 年间，该厂注册资本由 100 万元一路增至 5,200 万元并获得自营进出口权；但自 2019 年 12 月起连续两次大幅减资（−57.7% 与 −54.5%），时间线与大额银行借款担保诉讼爆发期完全重合。
    </div>
  `);

  const p7 = pageWrap("供应商基础身份核查（$149）", 7, total, `
    <div class="eyebrow">第 06 部分 · 司法执行与行政处罚初筛</div>
    <h2 class="h2-action">存在正在公示的简易注销、4,050 万元恢复执行及 5 条历史行政处罚</h2>

    <div class="sec-sub first">重大注销与法院强制执行预警</div>
    <table class="inst compact">
      <thead><tr><th style="width:14%;">日期</th><th style="width:22%;">风险类别</th><th style="width:15%;">涉案标的</th><th style="width:49%;">已核验公开记录详情</th></tr></thead>
      <tbody>
        <tr><td class="num">2026-11-06</td><td style="font-weight:600;">简易注销公告</td><td>${badge("极高风险", "极高风险")}</td><td>已向义乌市监局提交简易注销（公告期 2026年11月6日至26日），企业主体可能随时终止。</td></tr>
        <tr><td class="num">2026年</td><td style="font-weight:600;">法院强制执行</td><td class="num" style="color:#B91C1C;">48万元</td><td>案号 (2026) 浙0782执9730号 — 提供劳务者受害责任纠纷强制执行（义乌法院）。</td></tr>
        <tr><td class="num">2025-07-30</td><td style="font-weight:600;">恢复强制执行</td><td class="num" style="color:#B91C1C;">4,050万元</td><td>案号 (2025) 浙0782执恢1918号 — 金融借款担保违约恢复执行（中国华融资产）。</td></tr>
        <tr><td class="num">2020–2022</td><td style="font-weight:600;">历史失信被执行</td><td class="num" style="color:#B91C1C;">6,527万元</td><td>两起大额历史失信被执行及法定代表人限制高消费记录（华融及信达资产）。</td></tr>
      </tbody>
    </table>

    <div class="sec-sub">历史行政处罚记录（共 5 条）</div>
    <table class="inst compact">
      <thead><tr><th style="width:14%;">处罚日期</th><th style="width:20%;">处罚机关</th><th style="width:14%;">罚款金额</th><th style="width:52%;">违法事实摘要</th></tr></thead>
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

  const p8 = pageWrap("供应商基础身份核查（$149）", 8, total, `
    <div class="eyebrow">第 07 部分 · 外部平台核查与付款前防护</div>
    <h2 class="h2-action">B2B 店铺全面关闭印证经营停摆；建议严格执行五项实操防护</h2>

    <div class="sec-sub first">官网与 B2B 店铺一致性核查</div>
    <table class="inst compact">
      <thead><tr><th style="width:30%;">核查渠道</th><th style="width:16%;">核查状态</th><th style="width:54%;">分析师核验说明</th></tr></thead>
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

    <div class="sec-sub" style="margin-top:22px;">付款前实用防护建议（贴合中国外贸常规实操）</div>
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
        <div class="scope-title">$149 核查包含范围</div>
        <ul class="scope-list">
          <li>中国企业工商登记、存续与简易注销状态核查</li>
          <li>分支机构状态与历史注册资本/工商变更记录</li>
          <li>显性法院执行、失信记录及行政处罚初筛</li>
          <li>企业官网与主流 B2B 店铺一致性核查（如公开可查）</li>
        </ul>
      </div>
      <div class="scope-box red">
        <div class="scope-title">桌面尽调不包含范围</div>
        <ul class="scope-list">
          <li>不包含实地验厂、电话暗访或卫星地图审计</li>
          <li>不包含核验企业私密境内或香港离岸银行账户</li>
          <li>不包含向买方提供加盖公章的原件营业执照扫描件</li>
          <li>不包含海外实验室认证（CE / FCC / FDA / UL）审核</li>
        </ul>
      </div>
    </div>
  `);

  const p9 = renderBackCover(logoUri, data, "供应商基础身份核查（$149）", true);
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><style>${buildCss(fontCss)}</style></head><body>${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}${p9}</body></html>`;
}

/* ---------- $249 买家决策深度尽调 — 14 页中文版 ---------- */

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
    "买家决策深度尽调 · $249 旗舰档位",
    "中国供应商深度尽调与付款前风险决策报告",
    "拥有 25 年历史的老牌制造企业当前正处于简易注销公告期，名下背负 1.236 亿元有效执行与动产抵押、0 参保员工、58 项专利全部失效、ISO 证书全部撤销，且出现多家同联系方式新设贸易壳公司。",
    [
      ["服务档位", "深度决策尽调（$249）"],
      ["六维综合分", "3 / 30（触发熔断）"],
      ["报告页数", `共 ${total} 页（脱敏版）`],
      ["交付周期", `${meta.turnaroundHours} 小时 · 静默`],
    ],
  );

  const p2 = pageWrap("买家决策深度尽调（$249）", 2, total, `
    <div class="eyebrow">第 01 部分 · 核心决策结论与目录</div>
    <h2 class="h2-action">全部六个核查维度均现严重异常，触发强制禁付熔断（总分：3 / 30）</h2>

    <div class="metric-strip">
      <div class="m-cell"><div class="m-k">最终决策建议</div><div class="m-v red">暂停付款</div><div class="m-s">严禁向该主体打款</div></div>
      <div class="m-cell"><div class="m-k">六维量化得分</div><div class="m-v red">3 / 30</div><div class="m-s">触发极高风险熔断</div></div>
      <div class="m-cell"><div class="m-k">有效执行与抵押</div><div class="m-v red">1.236亿</div><div class="m-s">达剩余资本 12.4 倍</div></div>
      <div class="m-cell"><div class="m-k">参保 / ISO / 专利</div><div class="m-v red">0 · 0 · 0</div><div class="m-s">有效经营信号全归零</div></div>
    </div>

    <div class="sec-sub first">核心执行摘要</div>
    <p style="margin:0;color:#334155;">${esc(verdict.executiveSummary249)}</p>

    <div class="note red">
      <strong>强制熔断规则触发：</strong>${esc(verdict.criticalOverrideReason)}
    </div>

    <div class="sec-sub">报告目录</div>
    <div class="toc-grid">
      <div class="toc-row"><span><span class="toc-num">01</span>核心决策结论</span><span class="toc-pg">02</span></div>
      <div class="toc-row"><span><span class="toc-num">07</span>司法诉讼与债务演进</span><span class="toc-pg">08</span></div>
      <div class="toc-row"><span><span class="toc-num">02</span>六维尽调评分卡</span><span class="toc-pg">03</span></div>
      <div class="toc-row"><span><span class="toc-num">08</span>动产抵押与失信记录</span><span class="toc-pg">09</span></div>
      <div class="toc-row"><span><span class="toc-num">03</span>工商法定注册全表</span><span class="toc-pg">04</span></div>
      <div class="toc-row"><span><span class="toc-num">09</span>劳动仲裁与行政处罚</span><span class="toc-pg">10</span></div>
      <div class="toc-row"><span><span class="toc-num">04</span>资本轨迹与历史变更</span><span class="toc-pg">05</span></div>
      <div class="toc-row"><span><span class="toc-num">10</span>国内认证与知识产权</span><span class="toc-pg">11</span></div>
      <div class="toc-row"><span><span class="toc-num">05</span>股权穿透与壳体迁移</span><span class="toc-pg">06</span></div>
      <div class="toc-row"><span><span class="toc-num">11</span>外部渠道与官方信用</span><span class="toc-pg">12</span></div>
      <div class="toc-row"><span><span class="toc-num">06</span>关联企业与高管任职</span><span class="toc-pg">07</span></div>
      <div class="toc-row"><span><span class="toc-num">12</span>防护清单与询盘话术</span><span class="toc-pg">13</span></div>
    </div>
  `);

  const p3 = pageWrap("买家决策深度尽调（$249）", 3, total, `
    <div class="eyebrow">第 02 部分 · 六维尽调评分卡</div>
    <h2 class="h2-action">法律存续、债务合规与经营规模三项零分，综合评分仅 3 / 30</h2>

    <div class="exhibit">
      <div class="ex-k">图表 1</div>
      <div class="ex-t">六维风险画像雷达图（0–5 证据评分制）</div>
      ${svgRadarClean(scorecard249)}
      <div class="ex-src">评分说明：每个维度基于中国公开记录独立打分（0–5分）。任意维度出现 0 分红线即触发“暂停付款”强制熔断。</div>
    </div>

    <div class="sec-sub first">分维度评分与核心依据明细</div>
    <table class="inst compact">
      <thead><tr><th style="width:26%;">尽调评估维度</th><th style="width:14%;">风险定级</th><th style="width:11%;">得分</th><th style="width:49%;">驱动评分的关键公开证据</th></tr></thead>
      <tbody>
        ${scorecard249
          .map(
            (r) => `
          <tr>
            <td style="font-weight:600;color:#0F172A;">${esc(r.dimension)}</td>
            <td>${badge(r.status, r.status)}</td>
            <td class="num" style="color:#B91C1C;">${r.score} / 5 分</td>
            <td>${esc(r.rationale)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `);

  const p4 = pageWrap("买家决策深度尽调（$249）", 4, total, `
    <div class="eyebrow">第 03 部分 · 工商法定注册档案</div>
    <h2 class="h2-action">法定档案证实 25 年出口资质，但当前参保员工归零且 3 家分支全部注销</h2>

    <table class="inst compact">
      <thead><tr><th style="width:28%;">法定登记字段</th><th style="width:72%;">已核验公开登记值</th></tr></thead>
      <tbody>
        <tr><td style="font-weight:600;">企业法定名称（脱敏）</td><td><strong>${esc(company.englishName)}</strong></td></tr>
        <tr><td style="font-weight:600;">历史曾用名</td><td>${esc(company.formerName)}</td></tr>
        <tr><td style="font-weight:600;">统一社会信用代码</td><td>${esc(company.uscc)}（组织机构代码：${esc(company.orgCode)}）</td></tr>
        <tr><td style="font-weight:600;">当前登记状态</td><td><strong style="color:#B91C1C;">${esc(company.registrationStatus)}</strong></td></tr>
        <tr><td style="font-weight:600;">法定代表人</td><td>${esc(company.legalRepresentative)}</td></tr>
        <tr><td style="font-weight:600;">成立日期 / 核准日期</td><td>${esc(company.establishmentDate)} · 最近核准：${esc(company.approvalDate)}</td></tr>
        <tr><td style="font-weight:600;">注册资本与实缴资本</td><td>${esc(company.registeredCapital)} · 实缴：${esc(company.paidInCapital)}</td></tr>
        <tr><td style="font-weight:600;">年报社保参保人数</td><td><strong style="color:#B91C1C;">${esc(company.insuredEmployees2025)}</strong>（2024年报：0人）</td></tr>
        <tr><td style="font-weight:600;">海关进出口备案</td><td>${esc(company.customsCode)} · ${esc(company.importExportStatus)}</td></tr>
        <tr><td style="font-weight:600;">注册地址（文本）</td><td>${esc(company.registeredAddress)}</td></tr>
        <tr><td style="font-weight:600;">核准经营范围</td><td>${esc(company.businessScope)}</td></tr>
      </tbody>
    </table>

    <div class="sec-sub">注册分支机构清单（3 家全部已注销）</div>
    <table class="inst compact">
      <thead><tr><th style="width:41%;">分支机构名称（脱敏）</th><th style="width:17%;">负责人</th><th style="width:15%;">所在城市</th><th style="width:15%;">成立日期</th><th style="width:12%;">状态</th></tr></thead>
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

  const p5 = pageWrap("买家决策深度尽调（$249）", 5, total, `
    <div class="eyebrow">第 04 部分 · 注册资本收缩与历史变更</div>
    <h2 class="h2-action">2019–2021 年连续两次大幅减资，注册资本较峰值缩水 81%</h2>

    <div class="exhibit">
      <div class="ex-k">图表 2</div>
      <div class="ex-t">注册资本历史变动轨迹与收缩曲线（2001–2026，人民币万元）</div>
      ${svgCapitalLine(capitalHistory)}
      <div class="ex-src">来源：义乌市市场监督管理局历史工商变更记录（共 29 条变更记录）。</div>
    </div>

    <div class="sec-sub first">核心历史工商变更摘录（2006–2021）</div>
    <table class="inst compact">
      <thead><tr><th style="width:15%;">变更日期</th><th style="width:26%;">变更事项</th><th style="width:59%;">变更内容摘要</th></tr></thead>
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

  const p6 = pageWrap("买家决策深度尽调（$249）", 6, total, `
    <div class="eyebrow">第 05 部分 · 股权穿透与主体迁移分析</div>
    <h2 class="h2-action">股东及关联方新设多家 100 万元壳体，且与老厂共用电话与邮箱</h2>
    <p class="sub-lead">尽管直接股权自 2004 年起一直稳定由两名自然人持有，但通过对企业年报联系方式及高管任职记录的交叉比对，清晰指向业务已从负债老厂向外迁移。</p>

    <div class="exhibit">
      <div class="ex-k">图表 3</div>
      <div class="ex-t">企业控制权与关联新设壳体迁移拓扑图</div>
      ${svgEntityDiagramClean()}
      <div class="ex-src">来源：股东出资记录、法定代表人对外任职及企业年报联系方式交叉比对（2026年11月）。</div>
    </div>

    <div class="sec-sub first">直接登记股东名录</div>
    <table class="inst">
      <thead><tr><th style="width:36%;">股东及职务</th><th style="width:14%;">持股比例</th><th style="width:16%;">认缴出资</th><th style="width:16%;">实缴出资</th><th style="width:18%;">持股起始日</th></tr></thead>
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
      <strong>主体混同风险提示：</strong>当一家负债累累的老厂提交简易注销，同时其 49% 股东（J** 女士）出任新设印务公司（2023年）法人，且同一电话/邮箱下新设两家贸易公司（2022及2024年）时，买方在打款前必须核清<em>实际签约与履约的存续主体</em>。
    </div>
  `);

  const p7 = pageWrap("买家决策深度尽调（$249）", 7, total, `
    <div class="eyebrow">第 06 部分 · 关联企业与高管任职核查</div>
    <h2 class="h2-action">6 家关联企业共享联系方式，法定代表人名下过往关联公司多数已注销</h2>

    <div class="sec-sub first">疑似同联系方式关联企业及对外投资清单（共 6 家）</div>
    <table class="inst compact">
      <thead><tr><th style="width:28%;">关联企业名称（脱敏）</th><th style="width:14%;">成立日期</th><th style="width:13%;">资本 / 持股</th><th style="width:32%;">已核验关联线索</th><th style="width:13%;">状态</th></tr></thead>
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

    <div class="sec-sub">法定代表人（L** 先生）其他历史及存续对外任职</div>
    <table class="inst compact">
      <thead><tr><th style="width:42%;">企业名称（脱敏）</th><th style="width:24%;">职务 / 持股</th><th style="width:14%;">所在地区</th><th style="width:20%;">登记状态</th></tr></thead>
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

  const p8 = pageWrap("买家决策深度尽调（$249）", 8, total, `
    <div class="eyebrow">第 07 部分 · 司法诉讼与债务结构</div>
    <h2 class="h2-action">诉讼角色由追讨货款原告（2012–18）彻底逆转为大额金融违约被告（2019–26）</h2>
    <p class="sub-lead">在累计 51 起司法案件、57 份裁判文书、19 条立案信息及 35 次开庭公告中，企业自 2019 年起法律地位发生根本逆转，密集卷入千万级银行金融借款及担保违约诉讼。</p>

    <div class="exhibit">
      <div class="ex-k">图表 4</div>
      <div class="ex-t">债务及资产抵押敞口 vs. 当前剩余注册资本对比（人民币万元）</div>
      <div style="display:grid;grid-template-columns:1.45fr 0.55fr;gap:20px;align-items:center;">
        <div>${svgDebtBarsClean()}</div>
        <div style="border-left:1px solid #CBD5E1;padding-left:18px;">
          <div class="m-k">有效债资比</div>
          <div style="font-size:32pt;font-weight:700;color:#B91C1C;line-height:1.1;margin:6px 0;">12.4×</div>
          <div style="font-size:8.8pt;color:#475569;line-height:1.5;">1.236 亿元有效执行与动产抵押，对应仅剩 1,000 万元注册资本。</div>
        </div>
      </div>
      <div class="ex-src">来源：中国裁判文书网、全国法院被执行人信息查询平台、国家企业信用信息公示系统动产抵押公示。</div>
    </div>

    <div class="sec-sub first">司法诉讼与执行时间线演进（2012–2026）</div>
    <table class="inst compact">
      <thead><tr><th style="width:14%;">时间段</th><th style="width:20%;">案件类别</th><th style="width:14%;">涉及标的</th><th style="width:52%;">已核验司法与执行摘要</th></tr></thead>
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

  const p9 = pageWrap("买家决策深度尽调（$249）", 9, total, `
    <div class="eyebrow">第 08 部分 · 动产抵押与历史失信被执行</div>
    <h2 class="h2-action">背负 8,310 万元有效动产抵押及 6,527 万元历史失信被执行记录</h2>
    <p class="sub-lead">核心生产设备与存货已被大额抵押，叠加金融债权人的在途恢复执行，买方任何打入该内地企业账户的定金都面临极高的司法冻结扣划风险。</p>

    <div class="sec-sub first">有效动产抵押登记清单（共 3 笔 · 合计 8,310 万元）</div>
    <table class="inst">
      <thead><tr><th style="width:20%;">登记编号</th><th style="width:13%;">登记日期</th><th style="width:23%;">抵押权人（债权方）</th><th style="width:20%;">债务履行期限</th><th style="width:13%;">担保金额</th><th style="width:11%;">状态</th></tr></thead>
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

    <div class="sec-sub">历史失信被执行人及限制高消费记录（合计 6,527 万元）</div>
    <table class="inst">
      <thead><tr><th style="width:23%;">执行案号</th><th style="width:13%;">立案日期</th><th style="width:21%;">申请执行人</th><th style="width:13%;">涉案金额</th><th style="width:30%;">详情摘要</th></tr></thead>
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
      <strong>定金冻结风险评估：</strong>鉴于金融资产管理公司（华融资产）已于 2025 年 7 月恢复执行 4,050 万元大额标的，且名下 8,310 万元动产抵押仍处有效状态，海外买方向该主体境内银行账户支付的任何预付款均有极大概率被法院直接冻结。
    </div>
  `);

  const p10 = pageWrap("买家决策深度尽调（$249）", 10, total, `
    <div class="eyebrow">第 09 部分 · 劳动仲裁与行政处罚</div>
    <h2 class="h2-action">7 起历史劳动仲裁与 5 条监管处罚折射出长期用工与安全承压</h2>

    <div class="sec-sub first">历史劳动仲裁案件（共 7 起 · 2015–2020）</div>
    <table class="inst compact">
      <thead><tr><th style="width:18%;">立案日期</th><th style="width:22%;">仲裁案号</th><th style="width:60%;">争议案由</th></tr></thead>
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

    <div class="sec-sub">历史行政处罚记录（共 5 条 · 2017–2025）</div>
    <table class="inst compact">
      <thead><tr><th style="width:14%;">处罚日期</th><th style="width:20%;">处罚机关</th><th style="width:14%;">罚款金额</th><th style="width:52%;">违法事实摘要</th></tr></thead>
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

  const p11 = pageWrap("买家决策深度尽调（$249）", 11, total, `
    <div class="eyebrow">第 10 部分 · 国内体系认证、知识产权与标准</div>
    <h2 class="h2-action">58 项专利因未缴年费 100% 终止，近期 3 张 ISO 证书全部被撤销</h2>

    <div class="exhibit" style="padding:14px 18px 12px 18px;margin-bottom:22px;">
      <div class="ex-k">图表 5</div>
      <div class="ex-t" style="margin-bottom:10px;">认证资质、专利与分支机构衰减对比（当前有效 vs. 历史累计）</div>
      ${svgDecayBarsClean()}
      <div class="ex-src" style="margin-top:6px;">来源：国家认监委公开认证信息、国家知识产权局专利与商标库、国家企业信用信息公示系统。</div>
    </div>

    <div class="sec-sub first" style="margin-bottom:8px;">国内体系认证与海关备案明细</div>
    <table class="inst tight">
      <thead><tr><th style="width:27%;">证书名称</th><th style="width:20%;">证书编号</th><th style="width:22%;">发证机构</th><th style="width:19%;">有效期限</th><th style="width:12%;">状态</th></tr></thead>
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

    <div class="sec-sub" style="margin-top:20px;margin-bottom:8px;">知识产权与国家/行业标准核查摘要</div>
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

  const p12 = pageWrap("买家决策深度尽调（$249）", 12, total, `
    <div class="eyebrow">第 11 部分 · 外部数字化活跃度与官方信用</div>
    <h2 class="h2-action">所有外部 B2B 店铺、招聘网站与国内社媒渠道均已关闭或彻底沉寂</h2>
    <p class="sub-lead">通过人工交叉检索英文外贸平台、中文批发市场、主流招聘网站及国内内容社媒，外部市场信号与企业内部工商注销态势高度吻合。</p>

    <div class="sec-sub first">五大外部渠道活跃度人工核查明细</div>
    <table class="inst">
      <thead><tr><th style="width:28%;">核查渠道 / 平台</th><th style="width:16%;">核查状态</th><th style="width:56%;">分析师人工核验结果</th></tr></thead>
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

    <div class="sec-sub">官方国内信用评价与纳税人资质</div>
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
      <strong>多源交叉印证解读：</strong>许多经营健康的传统中国工厂确实没有独立英文官网，因此单凭“无官网”绝不应判定为风险。本案之所以构成极高风险，在于全渠道停摆（0 参保员工、BOSS直聘 0 岗位、Alibaba 与 1688 关店、58/58 专利失效）与简易注销、4,050 万元法院恢复执行同时发生。
    </div>
  `);

  const p13 = pageWrap("买家决策深度尽调（$249）", 13, total, `
    <div class="eyebrow">第 12 部分 · 买方实操防护清单与询盘话术</div>
    <h2 class="h2-action">五项贴合中国外贸实操的付款防护建议，及四句直击要害的核验提问</h2>
    <p class="sub-lead" style="margin-bottom:18px;">严格遵循中国正规出口工厂的常规配合边界——仅要求合规工厂普遍愿意提供的标准准入材料（带水印营业执照、盖章 PI、若走香港账户则附 1 页盖章付款委托函，以及 5 分钟视频看厂）。</p>

    <div class="sec-sub first">付款前核心防护行动清单</div>
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
      <h3>建议直接发送给对方业务员的四句核验提问</h3>
      <ol>
        ${rfqQuestions.map((q) => `<li>“${esc(q)}”</li>`).join("")}
      </ol>
    </div>

    <div class="note" style="margin-top:16px;padding:11px 14px;font-size:8.8pt;line-height:1.55;">
      <strong>桌面尽调与大货验货的配合方式：</strong>桌面尽调（$149–$249）用于在<em>支付定金前</em>低成本排除拟注销壳体、大额债务雷区及失效资质；一旦锁定并核验通过真正存续的承接工厂，建议大货阶段配合实物打样检测及第三方出运前验货（SGS / TÜV）。
    </div>
  `);

  const p14 = renderBackCover(logoUri, data, "买家决策深度尽调（$249）", false);
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><style>${buildCss(fontCss)}</style></head><body>${p1}${p2}${p3}${p4}${p5}${p6}${p7}${p8}${p9}${p10}${p11}${p12}${p13}${p14}</body></html>`;
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

async function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0] || "scripts/report-data/sample-zhejiang-knitting-zh.json";
  const tierIdx = args.indexOf("--tier");
  const tier = tierIdx >= 0 ? args[tierIdx + 1] : "both";

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
      const out149 = path.resolve("public/samples/gocnscout-sample-identity-check-149-zh.pdf");
      await renderPdf(browser, build149(data, logoUri, fontCss), out149);
      console.log("Generated:", out149);
    }

    if (tier === "249" || tier === "both") {
      const out249 = path.resolve("public/samples/gocnscout-sample-decision-review-249-zh.pdf");
      await renderPdf(browser, build249(data, logoUri, fontCss), out249);
      console.log("Generated:", out249);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
