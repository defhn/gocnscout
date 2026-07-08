#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const STATE_DIR = ".import-state";
const CLEANED_FILE = path.join(STATE_DIR, "canton-fair-cleaned.jsonl");
const SYNC_FAILED_FILE = path.join(STATE_DIR, "canton-fair-sync-failed.jsonl");
const SYNC_STATE_FILE = path.join(STATE_DIR, "canton-fair-sync-state.json");
const BATCH_SIZE = 250;
const MAX_BATCH_RETRIES = 2;
const RETRY_DELAY_MS = 3000;
const CONNECTION_TIMEOUT_MS = 20000;
const STATEMENT_TIMEOUT_MS = 60000;

function clean(value) {
  const text = String(value ?? "").trim();
  return text || null;
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

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`);
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid JSONL line ${index + 1}: ${error.message}`);
    }
  });
}

function appendJsonl(filePath, rows) {
  if (!rows.length) return;
  fs.appendFileSync(filePath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
}

function saveState(state) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2));
}

function archiveFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const backupPath = `${filePath}.${new Date().toISOString().replace(/[:.]/g, "-")}.bak`;
  fs.renameSync(filePath, backupPath);
  console.log(`[archive] ${filePath} -> ${backupPath}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getExistingHashes(pool) {
  const result = await pool.query('select "sourceRowHash" from "SupplierSourceRaw" where "status" = $1', ["IMPORTED"]);
  return new Set(result.rows.map((row) => row.sourceRowHash));
}

function validateRecord(record) {
  const errors = [];
  if (!record.sourceRowHash) errors.push("missing sourceRowHash");
  if (!record.sourceRowNumber) errors.push("missing sourceRowNumber");
  if (!record.cleaned?.raw) errors.push("missing raw source object");
  return errors;
}

async function syncBatch(pool, batch, totals) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const record of batch) await upsertRecord(client, record);
    await client.query("commit");
    totals.synced += batch.length;
    console.log(`[db] synced batch=${batch.length} totalSynced=${totals.synced} skipped=${totals.skipped} failed=${totals.failed}`);
    saveState(totals);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function syncBatchWithRetry(pool, batch, totals) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_BATCH_RETRIES + 1; attempt++) {
    try {
      await syncBatch(pool, batch, totals);
      return null;
    } catch (error) {
      lastError = error;
      console.log(`[retry-batch] attempt=${attempt} size=${batch.length} error=${error.message}`);
      if (attempt <= MAX_BATCH_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  return lastError;
}

async function upsertRecord(client, record) {
  const c = record.cleaned;
  const r = c.raw;
  const t = record.translated;
  const industryName = clean(t.industryEn) || r.industryCn;
  const exhibitorName = clean(t.exhibitorNameEn) || r.exhibitorNameCn;
  const province = clean(t.provinceEn) || r.provinceCn || null;
  const city = clean(t.cityEn) || r.cityCn || null;
  const productsEn = Array.isArray(t.productsEn) && t.productsEn.length ? t.productsEn : c.productsCn || [];
  const keywordsEn = Array.isArray(t.keywordsEn) && t.keywordsEn.length ? t.keywordsEn : c.keywordsCn || [];
  const slug = slugify(`${exhibitorName}-${city || ""}-${record.sourceRowNumber}`);
  const industrySlug = slugify(industryName);
  const citySlug = city ? slugify(`${city}-${province || ""}`) : null;
  const searchTextEn = [industryName, exhibitorName, province, city, productsEn.join(", "), keywordsEn.join(", "), t.companyTypeEn, t.companySizeEn, c.tradeModes?.join(", ")].filter(Boolean).join(" ");
  const searchTextCn = [r.industryCn, r.exhibitorNameCn, r.provinceCn, r.cityCn, r.productsCnText, r.keywordsCnText, r.companyTypeCn, r.companySizeCn].filter(Boolean).join(" ");

  const supplier = await client.query(
    `insert into "Supplier" (
      "slug","sourceRowId","sourceFileName","sourceSheetName","sourceRowNumber","sourceRowHash",
      "industryName","industryNameCn","industryNameEn","industrySlug",
      "exhibitorName","exhibitorNameCn","exhibitorNameEn",
      "province","provinceCn","provinceEn","city","cityCn","cityEn","citySlug",
      "websiteRaw","websiteUrl","websiteDomain","websiteStatus","websiteType",
      "productsText","productsTextCn","productsTextEn","keywordsText","keywordsTextCn","keywordsTextEn","productKeywordsCn","productKeywordsEn",
      "foundedYear","foundedYearRange","registeredCapital","registeredCapitalRaw","registeredCapitalRmb","registeredCapitalRange",
      "companySize","companySizeCn","companySizeEn","companyType","companyTypeCn","companyTypeEn",
      "tradeModesRaw","tradeModes","exhibitorHistory","exhibitionSessions","firstExhibitionSession","lastExhibitionSession","exhibitionSessionCount",
      "companyNature","companyNatureCn","companyNatureEn","searchText","searchTextCn","searchTextEn","stabilityScore","capabilityScore","dataQualityScore","updatedAt"
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,now()
    )
    on conflict ("sourceRowHash") do update set
      "industryName" = excluded."industryName",
      "industryNameCn" = excluded."industryNameCn",
      "industryNameEn" = excluded."industryNameEn",
      "exhibitorName" = excluded."exhibitorName",
      "exhibitorNameCn" = excluded."exhibitorNameCn",
      "exhibitorNameEn" = excluded."exhibitorNameEn",
      "productsText" = excluded."productsText",
      "productsTextCn" = excluded."productsTextCn",
      "productsTextEn" = excluded."productsTextEn",
      "keywordsText" = excluded."keywordsText",
      "keywordsTextCn" = excluded."keywordsTextCn",
      "keywordsTextEn" = excluded."keywordsTextEn",
      "searchText" = excluded."searchText",
      "searchTextCn" = excluded."searchTextCn",
      "searchTextEn" = excluded."searchTextEn",
      "updatedAt" = now()
    returning "id"`,
    [
      slug,
      String(record.sourceRowNumber),
      c.sourceFileName,
      c.sourceSheetName,
      c.sourceRowNumber,
      c.sourceRowHash,
      industryName,
      r.industryCn || null,
      industryName,
      industrySlug,
      exhibitorName,
      r.exhibitorNameCn || null,
      t.exhibitorNameEn || null,
      province,
      r.provinceCn || null,
      province,
      city,
      r.cityCn || null,
      city,
      citySlug,
      c.website?.raw || null,
      c.website?.url || null,
      c.website?.domain || null,
      c.website?.status || null,
      c.website?.type || null,
      productsEn.join(", ") || null,
      r.productsCnText || null,
      productsEn.join(", ") || null,
      keywordsEn.join(", ") || null,
      r.keywordsCnText || null,
      keywordsEn.join(", ") || null,
      (c.productsCn || []).concat(c.keywordsCn || []),
      Array.from(new Set(productsEn.concat(keywordsEn))),
      c.foundedYear || null,
      c.foundedYearRange || null,
      r.registeredCapitalRaw || null,
      r.registeredCapitalRaw || null,
      c.registeredCapitalRmb || null,
      c.registeredCapitalRange || null,
      t.companySizeEn || r.companySizeCn || null,
      r.companySizeCn || null,
      t.companySizeEn || null,
      t.companyTypeEn || r.companyTypeCn || null,
      r.companyTypeCn || null,
      t.companyTypeEn || null,
      r.tradeModeRaw || null,
      c.tradeModes || [],
      (c.sessions?.strings) || [],
      (c.sessions?.ints) || [],
      c.sessions?.first || null,
      c.sessions?.last || null,
      c.sessions?.count || null,
      t.companyNatureEn || r.companyNatureCn || null,
      r.companyNatureCn || null,
      t.companyNatureEn || null,
      [searchTextEn, searchTextCn].filter(Boolean).join(" "),
      searchTextCn || null,
      searchTextEn || null,
      c.stabilityScore || 0,
      c.capabilityScore || 0,
      c.dataQualityScore || 0,
    ],
  );
  const supplierId = supplier.rows[0].id;

  await client.query(
    `insert into "SupplierPrivateData" ("supplierId","contactPerson","contactPersonCn","mobile","phone","fax","email","fullAddress","fullAddressCn","fullAddressEn","postalCode","rawJson","updatedAt")
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
     on conflict ("supplierId") do update set "contactPerson" = excluded."contactPerson", "contactPersonCn" = excluded."contactPersonCn", "mobile" = excluded."mobile", "phone" = excluded."phone", "fax" = excluded."fax", "email" = excluded."email", "fullAddress" = excluded."fullAddress", "fullAddressCn" = excluded."fullAddressCn", "fullAddressEn" = excluded."fullAddressEn", "postalCode" = excluded."postalCode", "rawJson" = excluded."rawJson", "updatedAt" = now()`,
    [supplierId, r.contactPersonCn || null, r.contactPersonCn || null, r.mobile || null, r.phone || null, r.fax || null, r.email || null, r.fullAddressCn || null, r.fullAddressCn || null, t.addressEn || null, r.postalCode || null, r],
  );

  const s = c.signals || {};
  await client.query(
    `insert into "SupplierSignal" ("supplierId","innovationAward","cantonFairDesignAward","multiSessionExhibitor","brandExhibitor","chinaTimeHonoredBrand","ruralRevitalizationExhibitor","newExhibitor","specializedSpecialNewEnterprise","greenAwardExhibitor","customsCertifiedExhibitor","highTechEnterprise","hasAnyAward","hasCertificationSignal","hasBrandSignal","hasInnovationSignal","updatedAt")
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now())
     on conflict ("supplierId") do update set "innovationAward" = excluded."innovationAward", "cantonFairDesignAward" = excluded."cantonFairDesignAward", "multiSessionExhibitor" = excluded."multiSessionExhibitor", "brandExhibitor" = excluded."brandExhibitor", "chinaTimeHonoredBrand" = excluded."chinaTimeHonoredBrand", "ruralRevitalizationExhibitor" = excluded."ruralRevitalizationExhibitor", "newExhibitor" = excluded."newExhibitor", "specializedSpecialNewEnterprise" = excluded."specializedSpecialNewEnterprise", "greenAwardExhibitor" = excluded."greenAwardExhibitor", "customsCertifiedExhibitor" = excluded."customsCertifiedExhibitor", "highTechEnterprise" = excluded."highTechEnterprise", "hasAnyAward" = excluded."hasAnyAward", "hasCertificationSignal" = excluded."hasCertificationSignal", "hasBrandSignal" = excluded."hasBrandSignal", "hasInnovationSignal" = excluded."hasInnovationSignal", "updatedAt" = now()`,
    [supplierId, !!s.innovationAward, !!s.cantonFairDesignAward, !!s.multiSessionExhibitor, !!s.brandExhibitor, !!s.chinaTimeHonoredBrand, !!s.ruralRevitalizationExhibitor, !!s.newExhibitor, !!s.specializedSpecialNewEnterprise, !!s.greenAwardExhibitor, !!s.customsCertifiedExhibitor, !!s.highTechEnterprise, !!s.hasAnyAward, !!s.hasCertificationSignal, !!s.hasBrandSignal, !!s.hasInnovationSignal],
  );

  await client.query(
    `insert into "SupplierSourceRaw" ("supplierId","sourceFileName","sourceSheetName","sourceRowNumber","sourceRowHash","rawJson","cleanedJson","translatedJson","status","lastProcessedAt","updatedAt")
     values ($1,$2,$3,$4,$5,$6,$7,$8,'IMPORTED',now(),now())
     on conflict ("sourceRowHash") do update set "supplierId" = excluded."supplierId", "cleanedJson" = excluded."cleanedJson", "translatedJson" = excluded."translatedJson", "status" = 'IMPORTED', "errorMessage" = null, "lastProcessedAt" = now(), "updatedAt" = now()`,
    [supplierId, c.sourceFileName, c.sourceSheetName, c.sourceRowNumber, c.sourceRowHash, r, c, t],
  );

  await client.query('delete from "SupplierProductKeyword" where "supplierId" = $1', [supplierId]);
  const keywordRows = [];
  for (const item of c.productsCn || []) keywordRows.push([item, item, "products_cn"]);
  for (const item of productsEn) keywordRows.push([null, item, "products_en"]);
  for (const item of c.keywordsCn || []) keywordRows.push([item, item, "keywords_cn"]);
  for (const item of keywordsEn) keywordRows.push([null, item, "keywords_en"]);
  for (const [keywordCn, keywordEn, sourceField] of keywordRows) {
    const value = clean(keywordEn);
    if (!value) continue;
    await client.query(
      `insert into "SupplierProductKeyword" ("supplierId","keywordCn","keywordEn","keywordSlug","sourceField","confidence") values ($1,$2,$3,$4,$5,$6) on conflict ("supplierId","keywordSlug","sourceField") do nothing`,
      [supplierId, keywordCn, value, slugify(value), sourceField, 0.9],
    );
  }
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required in .env.local.");
  const rows = readJsonl(CLEANED_FILE);
  archiveFile(SYNC_FAILED_FILE);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    statement_timeout: STATEMENT_TIMEOUT_MS,
    query_timeout: STATEMENT_TIMEOUT_MS + 10000,
    max: 5,
  });
  const existing = await getExistingHashes(pool);
  const totals = { total: rows.length, synced: 0, skipped: 0, failed: 0 };
  let batch = [];
  const failures = [];

  for (const record of rows) {
    const validationErrors = validateRecord(record);
    if (validationErrors.length) {
      totals.failed += 1;
      failures.push({ sourceRowNumber: record.sourceRowNumber, sourceRowHash: record.sourceRowHash, errors: validationErrors });
      continue;
    }
    if (existing.has(record.sourceRowHash)) {
      totals.skipped += 1;
      continue;
    }
    batch.push(record);
    if (batch.length >= BATCH_SIZE) {
      const error = await syncBatchWithRetry(pool, batch, totals);
      if (error) {
        totals.failed += batch.length;
        failures.push(...batch.map((item) => ({ sourceRowNumber: item.sourceRowNumber, sourceRowHash: item.sourceRowHash, errorMessage: error.message })));
        console.log(`[failed-batch] size=${batch.length} error=${error.message}`);
      }
      batch = [];
    }
  }
  if (batch.length) {
    const error = await syncBatchWithRetry(pool, batch, totals);
    if (error) {
      totals.failed += batch.length;
      failures.push(...batch.map((item) => ({ sourceRowNumber: item.sourceRowNumber, sourceRowHash: item.sourceRowHash, errorMessage: error.message })));
      console.log(`[failed-batch] size=${batch.length} error=${error.message}`);
    }
  }
  appendJsonl(SYNC_FAILED_FILE, failures);
  saveState(totals);
  await pool.end();
  console.log(`[done] synced=${totals.synced} skipped=${totals.skipped} failed=${totals.failed}`);
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(`[fatal] ${error.stack || error.message}`);
  process.exit(1);
});
