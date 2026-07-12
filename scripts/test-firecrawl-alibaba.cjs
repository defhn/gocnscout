#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const targetUrl =
  process.argv[2] ||
  "https://dgypsw.m.en.alibaba.com/?spm=a2700.details.0.0.507b5885RUrMKS&wx_navbar_transparent=true&wx_screen_direc=portrait&productId=1601782138774&from=detail_company_card";
const shouldExpand = process.argv.includes("--expand");
const apiBaseUrl = (process.env.FIRECRAWL_BASE_URL || "https://api.firecrawl.dev").replace(/\/$/, "");

function buildScrapeRequest(url, country = "US") {
  return {
    url,
    formats: ["markdown", "links", "screenshot"],
    onlyMainContent: true,
    blockAds: true,
    proxy: "auto",
    location: { country },
    timeout: 60000,
    storeInCache: false,
  };
}

function summarize(data) {
  const markdown = data?.markdown || "";
  const metadata = data?.metadata || {};
  const lower = markdown.toLowerCase();
  const signals = {
    pageTitle: metadata.title || "",
    companyName: /company|limited|ltd\.?|co\.,?\s*ltd/i.test(markdown),
    products: /product|category|catalog|wholesale/i.test(lower),
    location: /guangdong|dongguan|china|province|city/i.test(lower),
    contact: /contact|email|telephone|phone/i.test(lower),
    certifications: /certificate|certification|iso|audit|verified/i.test(lower),
  };

  return {
    statusCode: metadata.statusCode || null,
    markdownCharacters: markdown.length,
    linkCount: Array.isArray(data?.links) ? data.links.length : 0,
    signals,
    usefulSignalCount: Object.values(signals).filter(Boolean).length - (signals.pageTitle ? 1 : 0),
    preview: markdown.replace(/\s+/g, " ").slice(0, 600),
  };
}

async function post(endpoint, payload) {
  const response = await fetch(`${apiBaseUrl}/v2/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.error || body.code || `HTTP ${response.status}`);
  }
  return body;
}

function chooseFollowUpUrls(links, origin) {
  const keywords = /company|about|profile|product|catalog|contact|certificate|audit/i;
  return links
    .map((link) => (typeof link === "string" ? link : link.url))
    .filter((url) => url && url.startsWith(origin) && keywords.test(url))
    .slice(0, 4);
}

async function main() {
  if (!process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY === "fc_your_firecrawl_api_key") {
    throw new Error("请先在 .env.local 中设置 FIRECRAWL_API_KEY。");
  }

  console.log("开始单页抓取测试…");
  const startedAt = Date.now();
  const single = await post("scrape", buildScrapeRequest(targetUrl));
  const singleSummary = summarize(single.data);
  const result = {
    targetUrl,
    testedAt: new Date().toISOString(),
    singlePage: { elapsedMs: Date.now() - startedAt, ...singleSummary },
    recommendedMode:
      singleSummary.usefulSignalCount >= 3 ? "single-page" : "targeted-multi-page",
  };

  if (shouldExpand && result.recommendedMode === "targeted-multi-page") {
    console.log("单页信号不足，开始仅发现相关页面（最多 4 个）…");
    const origin = new URL(targetUrl).origin;
    const map = await post("map", { url: origin, limit: 30, ignoreQueryParameters: true, timeout: 60000 });
    const followUpUrls = chooseFollowUpUrls(map.links || [], origin);
    result.followUpPages = [];
    for (const url of followUpUrls) {
      const pageStartedAt = Date.now();
      try {
        const page = await post("scrape", buildScrapeRequest(url));
        result.followUpPages.push({ url, elapsedMs: Date.now() - pageStartedAt, ...summarize(page.data) });
      } catch (error) {
        result.followUpPages.push({ url, error: error.message });
      }
    }
  }

  fs.mkdirSync(path.resolve(process.cwd(), "tmp"), { recursive: true });
  const outputPath = path.resolve(process.cwd(), "tmp/firecrawl-alibaba-test-result.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  console.log(`结果已写入 ${outputPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`测试失败：${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { buildScrapeRequest, summarize };
