#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const STATE_DIR = ".import-state";
const CLEANED_FILE = path.join(STATE_DIR, "canton-fair-cleaned.jsonl");
const REPORT_FILE = path.join(STATE_DIR, "canton-fair-validation-report.json");

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing cleaned file: ${filePath}`);
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid JSONL line ${index + 1}: ${error.message}`);
    }
  });
}

function validateRecord(record) {
  const errors = [];
  if (!record.sourceRowHash) errors.push("missing sourceRowHash");
  if (!record.sourceRowNumber) errors.push("missing sourceRowNumber");
  if (!record.cleaned?.raw) errors.push("missing cleaned.raw");
  if (!record.cleaned?.raw?.industryCn) errors.push("missing industryCn");
  if (!record.cleaned?.raw?.exhibitorNameCn) errors.push("missing exhibitorNameCn");
  if (!record.translated?.industryEn) errors.push("missing translated industryEn");
  if (!record.translated?.exhibitorNameEn) errors.push("missing translated exhibitorNameEn");
  if (!Array.isArray(record.translated?.productsEn)) errors.push("productsEn must be an array");
  if (!Array.isArray(record.translated?.keywordsEn)) errors.push("keywordsEn must be an array");
  if (!record.cleaned?.signals) errors.push("missing signals");
  if (!record.cleaned?.website) errors.push("missing website normalization");
  return errors;
}

function main() {
  const rows = readJsonl(CLEANED_FILE);
  const seen = new Set();
  const failures = [];
  for (const row of rows) {
    const errors = validateRecord(row);
    if (seen.has(row.sourceRowHash)) errors.push("duplicate sourceRowHash in cleaned file");
    seen.add(row.sourceRowHash);
    if (errors.length) failures.push({ sourceRowNumber: row.sourceRowNumber, sourceRowHash: row.sourceRowHash, errors });
  }
  const report = {
    checkedAt: new Date().toISOString(),
    totalRows: rows.length,
    uniqueRows: seen.size,
    failureCount: failures.length,
    failures: failures.slice(0, 500),
  };
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`[validate] rows=${rows.length} unique=${seen.size} failures=${failures.length}`);
  console.log(`[validate] report=${REPORT_FILE}`);
  if (failures.length) process.exit(1);
}

main();
