#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const XLSX = require("xlsx");
require("dotenv").config({ path: ".env.local" });

const SOURCE_FILE = "139th Canton Fair Exhibitor Database (Full Version).xlsx";
const STATE_DIR = ".import-state";
const CLEANED_FILE = path.join(STATE_DIR, "canton-fair-cleaned.jsonl");
const FAILED_FILE = path.join(STATE_DIR, "canton-fair-failed.jsonl");
const STATE_FILE = path.join(STATE_DIR, "canton-fair-clean-state.json");
const CONCURRENCY = 10;
const TEST_ROWS = Number(process.env.DEEPSEEK_TEST_ROWS || 10);
const TEST_ONLY = process.env.DEEPSEEK_TEST_ONLY === "1";
const LOCAL_FLUSH_SIZE = 250;
const PROGRESS_INTERVAL = 500;
const PROGRESS_PAUSE_MS = 30000;
const REQUEST_TIMEOUT_MS = 20000;
const MAX_RETRIES = 2;
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

const COL = {
  industry: 0,
  exhibitorName: 1,
  contactPerson: 2,
  mobile: 3,
  phone: 4,
  fax: 5,
  email: 6,
  website: 7,
  province: 8,
  city: 9,
  address: 10,
  postalCode: 11,
  products: 12,
  keywords: 13,
  foundedYear: 14,
  registeredCapital: 15,
  companySize: 16,
  companyType: 17,
  tradeMode: 18,
  exhibitionHistory: 19,
  companyNature: 20,
  innovationAward: 21,
  cantonFairDesignAward: 22,
  multiSessionExhibitor: 23,
  brandExhibitor: 24,
  chinaTimeHonoredBrand: 25,
  ruralRevitalizationExhibitor: 26,
  newExhibitor: 27,
  specializedSpecialNewEnterprise: 28,
  greenAwardExhibitor: 29,
  customsCertifiedExhibitor: 30,
  highTechEnterprise: 31,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clean(value) {
  const text = String(value ?? "").trim();
  const emptyValues = new Set(["", "N/A", "n/a", "NA", "/", "-", "0", "null", "none", "None", "NO", "no", "\u65e0", "\u6682\u65e0"]);
  if (emptyValues.has(text)) return "";
  return text;
}

function splitList(value) {
  return clean(value).split(/[,閿?閿涙稏鈧箺n\r]+/g).map((item) => item.trim()).filter(Boolean);
}

function yn(value) {
  return String(value || "").trim().toUpperCase() === "Y";
}

function splitInputList(value) {
  return clean(value).split(/[,;|/\\\n\r\u3001\uff0c\uff1b]+/g).map((item) => item.trim()).filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "unknown";
}

function parseYear(value) {
  const match = clean(value).match(/\d{4}/);
  if (!match) return null;
  const year = Number(match[0]);
  return year >= 1800 && year <= new Date().getFullYear() + 1 ? year : null;
}

function yearRange(year) {
  if (!year) return null;
  if (year < 2000) return "BEFORE_2000";
  if (year <= 2009) return "2000_2009";
  if (year <= 2015) return "2010_2015";
  if (year <= 2020) return "2016_2020";
  return "2021_PLUS";
}

function parseCapital(raw) {
  const text = clean(raw);
  if (!text) return { numeric: null, range: null };
  const numeric = Number(text.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric)) return { numeric: null, range: null };
  const rmb = numeric * 10000;
  if (rmb >= 50000000) return { numeric: rmb, range: "50M_PLUS_RMB" };
  if (rmb >= 10000000) return { numeric: rmb, range: "10M_50M_RMB" };
  if (rmb >= 5000000) return { numeric: rmb, range: "5M_10M_RMB" };
  if (rmb >= 1000000) return { numeric: rmb, range: "1M_5M_RMB" };
  return { numeric: rmb, range: "UNDER_1M_RMB" };
}

function parseWebsite(rawValue) {
  const raw = clean(rawValue);
  if (!raw) return { raw: String(rawValue || "").trim(), url: null, domain: null, status: "MISSING", type: "NONE" };
  if (/@/.test(raw) && !/^https?:\/\//i.test(raw)) return { raw, url: null, domain: null, status: "INVALID_EMAIL_IN_FIELD", type: "INVALID" };
  let value = raw;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (!url.hostname || !url.hostname.includes(".")) throw new Error("invalid host");
    const domain = url.hostname.replace(/^www\./i, "").toLowerCase();
    const type = /alibaba|made-in-china|globalsources|cantonfair/i.test(domain + url.pathname) ? "MARKETPLACE_STOREFRONT" : "COMPANY_DOMAIN";
    return { raw, url: url.toString(), domain, status: "VALID", type };
  } catch {
    return { raw, url: null, domain: null, status: "INVALID", type: "INVALID" };
  }
}

function parseSessions(raw) {
  const ints = [...new Set(splitInputList(raw).map(Number).filter((item) => Number.isInteger(item)))].sort((a, b) => a - b);
  return {
    strings: ints.map(String),
    ints,
    first: ints[0] || null,
    last: ints[ints.length - 1] || null,
    count: ints.length || null,
  };
}

function rowHash(row) {
  return crypto.createHash("sha256").update(JSON.stringify(row)).digest("hex");
}

function rowToRaw(row) {
  return {
    industryCn: clean(row[COL.industry]),
    exhibitorNameCn: clean(row[COL.exhibitorName]),
    contactPersonCn: clean(row[COL.contactPerson]),
    mobile: clean(row[COL.mobile]),
    phone: clean(row[COL.phone]),
    fax: clean(row[COL.fax]),
    email: clean(row[COL.email]),
    websiteRaw: clean(row[COL.website]),
    provinceCn: clean(row[COL.province]),
    cityCn: clean(row[COL.city]),
    fullAddressCn: clean(row[COL.address]),
    postalCode: clean(row[COL.postalCode]),
    productsCnText: clean(row[COL.products]),
    keywordsCnText: clean(row[COL.keywords]),
    foundedYearRaw: clean(row[COL.foundedYear]),
    registeredCapitalRaw: clean(row[COL.registeredCapital]),
    companySizeCn: clean(row[COL.companySize]),
    companyTypeCn: clean(row[COL.companyType]),
    tradeModeRaw: clean(row[COL.tradeMode]),
    exhibitionHistoryRaw: clean(row[COL.exhibitionHistory]),
    companyNatureCn: clean(row[COL.companyNature]),
    signalsRaw: {
      innovationAward: clean(row[COL.innovationAward]),
      cantonFairDesignAward: clean(row[COL.cantonFairDesignAward]),
      multiSessionExhibitor: clean(row[COL.multiSessionExhibitor]),
      brandExhibitor: clean(row[COL.brandExhibitor]),
      chinaTimeHonoredBrand: clean(row[COL.chinaTimeHonoredBrand]),
      ruralRevitalizationExhibitor: clean(row[COL.ruralRevitalizationExhibitor]),
      newExhibitor: clean(row[COL.newExhibitor]),
      specializedSpecialNewEnterprise: clean(row[COL.specializedSpecialNewEnterprise]),
      greenAwardExhibitor: clean(row[COL.greenAwardExhibitor]),
      customsCertifiedExhibitor: clean(row[COL.customsCertifiedExhibitor]),
      highTechEnterprise: clean(row[COL.highTechEnterprise]),
    },
  };
}

function normalizeRow(row, rowNumber) {
  const raw = rowToRaw(row);
  const sessions = parseSessions(raw.exhibitionHistoryRaw);
  const foundedYear = parseYear(raw.foundedYearRaw);
  const capital = parseCapital(raw.registeredCapitalRaw);
  const website = parseWebsite(raw.websiteRaw);
  const productsCn = splitInputList(raw.productsCnText);
  const keywordsCn = splitInputList(raw.keywordsCnText);
  const tradeModes = splitInputList(raw.tradeModeRaw).map((mode) => mode.toUpperCase()).filter((mode) => ["OEM", "ODM", "OBM"].includes(mode));
  const signals = {
    innovationAward: yn(raw.signalsRaw.innovationAward),
    cantonFairDesignAward: yn(raw.signalsRaw.cantonFairDesignAward),
    multiSessionExhibitor: yn(raw.signalsRaw.multiSessionExhibitor) || sessions.count > 1,
    brandExhibitor: yn(raw.signalsRaw.brandExhibitor),
    chinaTimeHonoredBrand: yn(raw.signalsRaw.chinaTimeHonoredBrand),
    ruralRevitalizationExhibitor: yn(raw.signalsRaw.ruralRevitalizationExhibitor),
    newExhibitor: yn(raw.signalsRaw.newExhibitor),
    specializedSpecialNewEnterprise: yn(raw.signalsRaw.specializedSpecialNewEnterprise),
    greenAwardExhibitor: yn(raw.signalsRaw.greenAwardExhibitor),
    customsCertifiedExhibitor: yn(raw.signalsRaw.customsCertifiedExhibitor),
    highTechEnterprise: yn(raw.signalsRaw.highTechEnterprise),
  };
  signals.hasAnyAward = signals.innovationAward || signals.cantonFairDesignAward || signals.greenAwardExhibitor;
  signals.hasCertificationSignal = signals.customsCertifiedExhibitor || signals.highTechEnterprise || signals.specializedSpecialNewEnterprise;
  signals.hasBrandSignal = signals.brandExhibitor || signals.chinaTimeHonoredBrand;
  signals.hasInnovationSignal = signals.innovationAward || signals.highTechEnterprise || signals.specializedSpecialNewEnterprise;

  const dataQualityScore = [raw.industryCn, raw.exhibitorNameCn, raw.provinceCn, raw.cityCn, productsCn.length || keywordsCn.length, website.url].filter(Boolean).length;
  const stabilityScore = [sessions.count && sessions.count >= 4, signals.multiSessionExhibitor, foundedYear && foundedYear <= 2015, capital.numeric && capital.numeric >= 5000000, website.url].filter(Boolean).length;
  const capabilityScore = [raw.companyTypeCn, tradeModes.includes("OEM"), tradeModes.includes("ODM"), signals.highTechEnterprise, signals.specializedSpecialNewEnterprise, signals.brandExhibitor].filter(Boolean).length;

  return {
    sourceFileName: SOURCE_FILE,
    sourceSheetName: "Sheet1",
    sourceRowNumber: rowNumber,
    sourceRowHash: rowHash(row),
    raw,
    productsCn,
    keywordsCn,
    tradeModes,
    website,
    sessions,
    foundedYear,
    foundedYearRange: yearRange(foundedYear),
    registeredCapitalRmb: capital.numeric,
    registeredCapitalRange: capital.range,
    signals,
    dataQualityScore,
    stabilityScore,
    capabilityScore,
  };
}

function buildPrompt(cleaned) {
  return [
    {
      role: "system",
      content: "Translate Chinese Canton Fair exhibitor data for a B2B supplier research database. Return strict JSON only. Do not invent websites, certifications, supplier verification, factory status, or products. Keep translations concise and searchable for English-speaking buyers. If a source field is empty, return the normal empty value for that field: an empty string for text fields and an empty array for list fields. Do not fail or invent content for missing source data. productsEn should translate row.productsCn when row.productsCn has values. If row.productsCn is empty, productsEn may be an empty array.",
    },
    {
      role: "user",
      content: JSON.stringify({
        outputSchema: {
          industryEn: "string",
          exhibitorNameEn: "string",
          provinceEn: "string",
          cityEn: "string",
          companySizeEn: "string",
          companyTypeEn: "string",
          companyNatureEn: "string",
          productsEn: ["string"],
          keywordsEn: ["string"],
          addressEn: "string",
        },
        row: cleaned,
      }),
    },
  ];
}

function normalizeTranslated(parsed, cleaned) {
  const keywordsEn = Array.isArray(parsed.keywordsEn) ? parsed.keywordsEn.map(clean).filter(Boolean) : [];
  let productsEn = Array.isArray(parsed.productsEn) ? parsed.productsEn.map(clean).filter(Boolean) : [];

  if (!productsEn.length && keywordsEn.length && (cleaned.productsCn.length || cleaned.keywordsCn.length)) {
    productsEn = keywordsEn.slice(0, Math.max(1, Math.min(5, keywordsEn.length)));
  }

  const translated = {
    industryEn: clean(parsed.industryEn),
    exhibitorNameEn: clean(parsed.exhibitorNameEn),
    provinceEn: clean(parsed.provinceEn),
    cityEn: clean(parsed.cityEn),
    companySizeEn: clean(parsed.companySizeEn),
    companyTypeEn: clean(parsed.companyTypeEn),
    companyNatureEn: clean(parsed.companyNatureEn),
    productsEn,
    keywordsEn,
    addressEn: clean(parsed.addressEn),
  };

  return translated;
}

async function deepseek(cleaned) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${BASE_URL.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: buildPrompt(cleaned),
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}: ${await response.text()}`);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("DeepSeek returned empty content.");
      const parsed = JSON.parse(content);
      return normalizeTranslated(parsed, cleaned);
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      console.log(`[retry] row=${cleaned.sourceRowNumber} attempt=${attempt} error=${error.message}`);
      if (attempt <= MAX_RETRIES) await sleep(1000 * attempt);
    }
  }
  throw lastError;
}

function loadRows() {
  const workbook = XLSX.readFile(SOURCE_FILE, { raw: false });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false, blankrows: false });
  return rows.slice(1).map((row, index) => normalizeRow(row, index + 2));
}

function readJsonlHashes(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  return new Set(fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line).sourceRowHash));
}

function appendJsonl(filePath, rows) {
  if (!rows.length) return;
  fs.appendFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2));
}

async function runPool(items, worker) {
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index++];
      await worker(item);
    }
  }));
}

async function processRows(rows, phase, totals) {
  const cleanBuffer = [];
  const failedBuffer = [];
  const failedRows = [];

  async function flush(force = false) {
    if (cleanBuffer.length >= LOCAL_FLUSH_SIZE || (force && cleanBuffer.length)) appendJsonl(CLEANED_FILE, cleanBuffer.splice(0, cleanBuffer.length));
    if (failedBuffer.length) appendJsonl(FAILED_FILE, failedBuffer.splice(0, failedBuffer.length));
    saveState(totals);
  }

  await runPool(rows, async (cleaned) => {
    try {
      const translated = await deepseek(cleaned);
      cleanBuffer.push({ status: "CLEANED", sourceRowHash: cleaned.sourceRowHash, sourceRowNumber: cleaned.sourceRowNumber, cleaned, translated });
      totals.cleaned += 1;
      console.log(`[ok] phase=${phase} row=${cleaned.sourceRowNumber} cleaned=${totals.cleaned} failed=${totals.failed}`);
    } catch (error) {
      const failed = { status: "FAILED", sourceRowHash: cleaned.sourceRowHash, sourceRowNumber: cleaned.sourceRowNumber, errorMessage: error.message, cleaned };
      failedRows.push(cleaned);
      failedBuffer.push(failed);
      totals.failed += 1;
      console.log(`[failed] phase=${phase} row=${cleaned.sourceRowNumber} error=${error.message}`);
    }

    const done = totals.cleaned + totals.failed + totals.skipped;
    if (done % LOCAL_FLUSH_SIZE === 0) await flush(false);
    if (done > 0 && done % PROGRESS_INTERVAL === 0) {
      await flush(true);
      console.log(`[progress] done=${done}/${totals.total} cleaned=${totals.cleaned} failed=${totals.failed} skipped=${totals.skipped}. Pausing 30 seconds...`);
      await sleep(PROGRESS_PAUSE_MS);
    }
  });
  await flush(true);
  return failedRows;
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is required in .env.local.");
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const rows = loadRows();
  const existing = readJsonlHashes(CLEANED_FILE);
  const pending = rows.filter((row) => !existing.has(row.sourceRowHash));
  const totals = { total: rows.length, cleaned: 0, failed: 0, skipped: existing.size };
  console.log(`[start] rows=${rows.length} alreadyCleaned=${existing.size} pending=${pending.length} concurrency=${CONCURRENCY}`);

  const testRows = pending.slice(0, TEST_ROWS);
  const testFailures = await processRows(testRows, "test", totals);
  if (testFailures.length) throw new Error(`Test ${TEST_ROWS} rows failed. Fix failed rows before full run.`);
  if (TEST_ONLY) {
    console.log(`[test] ${TEST_ROWS} rows succeeded. TEST_ONLY=1, stopping before full local cleaning.`);
    return;
  }
  console.log(`[test] ${TEST_ROWS} rows succeeded. Continuing full local cleaning.`);

  const mainFailures = await processRows(pending.slice(TEST_ROWS), "full", totals);
  if (mainFailures.length) {
    console.log(`[rerun] retrying ${mainFailures.length} failed rows once more`);
    totals.failed -= mainFailures.length;
    const finalFailures = await processRows(mainFailures, "final-rerun", totals);
    console.log(`[done] local cleaning completed. cleaned=${totals.cleaned} skipped=${totals.skipped} finalFailed=${finalFailures.length}`);
  } else {
    console.log(`[done] local cleaning completed. cleaned=${totals.cleaned} skipped=${totals.skipped} finalFailed=0`);
  }
  console.log(`[files] cleaned=${CLEANED_FILE} failed=${FAILED_FILE}`);
}

main().catch((error) => {
  console.error(`[fatal] ${error.stack || error.message}`);
  process.exit(1);
});
