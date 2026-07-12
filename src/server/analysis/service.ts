import { env } from "@/lib/env";
import {
  buildAnalysisSources,
  normalizeAnalysisUrl,
  serializeAnalysisResult,
  type AnalysisSource,
  type SupplierAnalysisResult,
} from "./contract";
import { scrapeAnalysisSource, type ScrapedPage } from "./firecrawl";

type AnalyzeOptions = {
  fetcher?: typeof fetch;
  aiGenerator?: (input: {
    companyName: string | null;
    sourceType: SupplierAnalysisResult["sourceType"];
    evidence: string[];
  }) => Promise<string>;
};

const COMPANY_PATTERNS = [
  /Company Name:\s*([^|]+?)(?: Registration| Registered| Date| Year|$)/i,
  /([A-Z][A-Za-z0-9&.,' -]+(?:Co\.,?\s*Ltd\.?|Company Limited|Ltd\.))/,
];

const RATING_RE = /(Overall Ratings?\s*[0-9.]+\/5|[0-9.]+\s*Reviews?|Supplier Service\s*[0-9.]+|On-time Shipment\s*[0-9.]+|Product Quality\s*[0-9.]+)/gi;
const BUSINESS_RE = /(Registration No\.?:\s*[A-Z0-9-]+|Date of Issue:\s*\d{4}-\d{2}-\d{2}|Registered Capital:\s*(?:RMB|USD|CNY)?\s*[\d,.]+|Year Established:\s*\d{4}|Store years?:\s*\d+\s*YR|Response time\s*(?:<=|<|>|>=)?\s*\d+\s*h|Revenue\s*[^.]+?)(?=\s[A-Z][a-z]|\s*$)/gi;
const PRODUCT_RE = /([A-Z][A-Za-z0-9%+&' -]{3,80}(?:Serum|Lotion|Cream|Mask|Bottle|Box|Bag|Machine|Set|Kit|Powder|Capsule|Toy|Light|Cable|Case|Chair|Table|Shoes|Dress|Shirt|Packaging)[^$]{0,60})/g;
const MARKDOWN_LINK_RE = /\[([^\]]{1,120})\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g;
const IMPORTANT_PATH_RE = /(about|company|profile|product|capabilit|factory|manufactur|certificat|quality|service)/i;
const LOW_VALUE_PATH_RE = /(blog|news|privacy|terms|policy|login|signin|cart|account|search|javascript|mailto:|tel:)/i;
const ALIBABA_STORE_LINK_RE = /^https?:\/\/[a-z0-9-]+\.m?\.?en\.alibaba\.com/i;
const WEBSITE_CERT_RE = /\b(SGS|Sedex|BSCI|ISO\s?14001|ISO\s?9001|ISO\s?\d{3,5}|RoHS|REACH|CE|FDA|MSDS)\b/gi;
const WEBSITE_CATEGORY_RE = /\b(stationery|desk accessor(?:y|ies)|art material|arts? and hobby craft|erasable pens?|pencil case|office products?|DIY craft|packaging|cosmetics?|skin care|electronics?|hardware|furniture|textiles?|toys?|plastic products?)\b/gi;
const WEBSITE_BUSINESS_MODEL_RE = /\b(OEM|ODM|private labels?|own branded|audited factories|retail chains?|manufacturer|factory|sourcing team|sample makers?|product developers?)\b/gi;

export async function analyzeSupplierUrl(inputUrl: string, options: AnalyzeOptions = {}): Promise<SupplierAnalysisResult> {
  const initial = normalizeAnalysisUrl(inputUrl);
  let normalizedUrl = deriveHomeUrl(initial.normalizedUrl, initial.sourceType);
  let sourceType = initial.sourceType;
  let scraped: ScrapedPage[];

  if (isAlibabaProductContext(initial.normalizedUrl)) {
    const entryPage = await scrapeAnalysisSource(
      { label: "Alibaba product page context", url: initial.normalizedUrl },
      { fetcher: options.fetcher },
    );
    const linkedStoreUrl = findAlibabaStoreUrl(entryPage.markdown);

    if (linkedStoreUrl) {
      normalizedUrl = deriveHomeUrl(linkedStoreUrl, "ALIBABA_STORE");
      sourceType = "ALIBABA_STORE";
      scraped = [
        entryPage,
        ...(await scrapeSources(buildAnalysisSources(normalizedUrl), options.fetcher)),
      ];
    } else {
      scraped = [entryPage];
    }
  } else if (initial.sourceType === "ALIBABA_STORE") {
    const sources = buildAnalysisSources(normalizedUrl);
    scraped = await scrapeSources(sources, options.fetcher);
  } else {
    const isEntryPage = !sameUrl(initial.normalizedUrl, normalizedUrl);
    const entryPage = isEntryPage
      ? await scrapeAnalysisSource({ label: getEntryContextLabel(initial.normalizedUrl), url: initial.normalizedUrl }, { fetcher: options.fetcher })
      : null;
    const homepage = await scrapeAnalysisSource({ label: "Website homepage", url: normalizedUrl }, { fetcher: options.fetcher });
    const linkedStoreUrl = isAlibabaProductContext(initial.normalizedUrl)
      ? findAlibabaStoreUrl(`${entryPage?.markdown || ""} ${homepage.markdown}`)
      : null;

    if (linkedStoreUrl) {
      normalizedUrl = deriveHomeUrl(linkedStoreUrl, "ALIBABA_STORE");
      sourceType = "ALIBABA_STORE";
      const storeSources = buildAnalysisSources(normalizedUrl);
      scraped = [
        ...(entryPage ? [entryPage] : []),
        ...(await scrapeSources(storeSources, options.fetcher)),
      ];
    } else {
      const websiteSources = buildWebsiteSources(normalizedUrl, homepage.markdown);
      const restSources = websiteSources
        .slice(1)
        .filter((source) => !entryPage || !sameUrl(source.url, entryPage.source.url));
      const rest = await scrapeSources(restSources, options.fetcher);
      scraped = [
        ...(entryPage ? [entryPage] : []),
        { ...homepage, source: websiteSources[0] },
        ...rest,
      ];
    }
  }

  const evidenceSources = scraped.map((page) => ({
    label: page.source.label,
    url: page.source.url,
    status: page.status,
    facts: page.status === "AVAILABLE" ? extractFacts(page) : [],
  }));

  const evidence = evidenceSources.flatMap((source) => source.facts);
  const companyName = extractCompanyName(scraped) || null;
  const unavailable = scraped
    .filter((page) => page.status === "UNAVAILABLE")
    .map((page) => `${page.source.label}: ${page.reason || "not publicly reachable"}`);
  const aiGenerator = options.aiGenerator || generateDeepSeekSummary;
  const summary = await aiGenerator({ companyName, sourceType, evidence }).catch(() =>
    fallbackSummary(companyName, sourceType, evidenceSources.filter((source) => source.status === "AVAILABLE").length),
  );

  return serializeAnalysisResult({
    sourceType,
    sourceUrl: inputUrl,
    normalizedUrl,
    companyName,
    summary,
    sources: evidenceSources,
    unavailable,
    riskFlags: buildRiskFlags(evidenceSources, unavailable),
    buyerQuestions: buildBuyerQuestions(sourceType),
    nextSteps: buildNextSteps(sourceType),
  });
}

function deriveHomeUrl(urlString: string, sourceType: SupplierAnalysisResult["sourceType"]) {
  const url = new URL(urlString);

  if (sourceType === "ALIBABA_STORE") {
    const shop = url.hostname.toLowerCase().split(".")[0] || url.hostname;
    return `https://${shop}.m.en.alibaba.com/`;
  }

  return `${url.protocol}//${url.hostname}/`;
}

function sameUrl(a: string, b: string) {
  return new URL(a).toString() === new URL(b).toString();
}

function getEntryContextLabel(urlString: string) {
  return isAlibabaProductContext(urlString) ? "Alibaba product page context" : "Website entry page context";
}

async function scrapeSources(sources: AnalysisSource[], fetcher?: typeof fetch) {
  return Promise.all(sources.map((source) => scrapeAnalysisSource(source, { fetcher })));
}

function findAlibabaStoreUrl(markdown: string) {
  const links = extractMarkdownLinks(markdown, "https://example.com");
  const store = links.find((link) => ALIBABA_STORE_LINK_RE.test(link.url));
  return store?.url || null;
}

function buildWebsiteSources(homeUrl: string, markdown: string): AnalysisSource[] {
  const home = new URL(homeUrl);
  const homepage = home.toString();
  const candidates = extractMarkdownLinks(markdown, homepage)
    .filter((link) => isSameSitePublicPage(home, link.url))
    .sort((a, b) => scoreWebsiteLink(b) - scoreWebsiteLink(a));
  const selected = uniqueByUrl(candidates).slice(0, 4);

  return [
    { label: "Website homepage", url: homepage },
    ...selected.map((link) => ({ label: `Website page: ${link.label}`, url: link.url })),
  ];
}

function extractMarkdownLinks(markdown: string, baseUrl: string) {
  const links: Array<{ label: string; url: string }> = [];

  for (const match of markdown.matchAll(MARKDOWN_LINK_RE)) {
    const label = cleanFact(match[1] || "Linked page");
    const href = match[2] || "";
    try {
      const url = new URL(href, baseUrl);
      url.hash = "";
      links.push({ label, url: url.toString() });
    } catch {
      continue;
    }
  }

  return links;
}

function isSameSitePublicPage(home: URL, urlString: string) {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.hostname !== home.hostname) return false;
    if (url.pathname === home.pathname || LOW_VALUE_PATH_RE.test(url.toString())) return false;
    return true;
  } catch {
    return false;
  }
}

function scoreWebsiteLink(link: { label: string; url: string }) {
  const value = `${link.label} ${link.url}`;
  let score = 0;
  if (IMPORTANT_PATH_RE.test(value)) score += 10;
  if (/about|company|profile/i.test(value)) score += 5;
  if (/product/i.test(value)) score += 4;
  if (/certificat|quality/i.test(value)) score += 4;
  if (/factory|manufactur|capabilit/i.test(value)) score += 3;
  return score;
}

function uniqueByUrl(links: Array<{ label: string; url: string }>) {
  const seen = new Set<string>();
  const output: Array<{ label: string; url: string }> = [];

  for (const link of links) {
    if (seen.has(link.url)) continue;
    seen.add(link.url);
    output.push(link);
  }

  return output;
}

function isAlibabaProductContext(urlString: string) {
  try {
    const url = new URL(urlString);
    return /(^|\.)alibaba\.com$/i.test(url.hostname) && !/\.m?\.?en\.alibaba\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function extractFacts(page: ScrapedPage) {
  const text = cleanEvidenceText(page.markdown);
  const facts = new Set<string>();

  if (page.title) facts.add(`Page title: ${cleanEvidenceText(page.title)}`);

  for (const match of text.matchAll(RATING_RE)) {
    addCleanFact(facts, match[0]);
  }

  for (const match of text.matchAll(BUSINESS_RE)) {
    addCleanFact(facts, normalizeBusinessFact(match[0]));
  }

  for (const match of text.matchAll(PRODUCT_RE)) {
    addCleanFact(facts, `Product signal: ${match[1] || match[0]}`);
    if (facts.size >= 10) break;
  }

  const companyName = extractCompanyNameFromText(text);
  if (companyName) facts.add(`Company name: ${companyName}`);

  if (page.source.label.startsWith("Website")) {
    addWebsiteFootprintFacts(facts, text);
  }

  if (facts.size <= 1 && text) {
    addCleanFact(facts, `Visible text sample: ${text.slice(0, 220)}`);
  }

  return Array.from(facts).slice(0, 12);
}

function addWebsiteFootprintFacts(facts: Set<string>, text: string) {
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) || /(?:\+?\d[\d\s().-]{7,}\d|0\d{2,3}[-\s]?\d{7,8})/.test(text)) {
    facts.add("Website contact signal: public email or phone is present");
  }

  if (/\b(Shanghai|Shenzhen|Guangzhou|Dongguan|Ningbo|Yiwu|Xiamen|Suzhou|Hangzhou|China)\b/i.test(text) && /\b(address|building|road|district|province|city|china)\b/i.test(text)) {
    const city = text.match(/\b(Shanghai|Shenzhen|Guangzhou|Dongguan|Ningbo|Yiwu|Xiamen|Suzhou|Hangzhou)\b/i)?.[1] || "China";
    facts.add(`Website address signal: ${city} address mentioned`);
  }

  for (const match of text.matchAll(WEBSITE_CERT_RE)) {
    const claim = normalizeCertificateClaim(match[1] || match[0]);
    if (claim) facts.add(`Certificate claim: ${claim}`);
  }

  for (const match of text.matchAll(WEBSITE_CATEGORY_RE)) {
    const category = normalizeLowerSignal(match[1] || match[0]);
    if (category) facts.add(`Product category signal: ${category}`);
  }

  for (const match of text.matchAll(WEBSITE_BUSINESS_MODEL_RE)) {
    const model = normalizeLowerSignal(match[1] || match[0]);
    if (model) facts.add(`Business model signal: ${model}`);
  }
}

function normalizeCertificateClaim(input: string) {
  return input.replace(/\s+/g, "").replace(/^Iso/i, "ISO").replace(/^Sgs$/i, "SGS").replace(/^BSCI$/i, "BSCI").replace(/^Sedex$/i, "Sedex");
}

function normalizeLowerSignal(input: string) {
  const normalized = input.replace(/\s+/g, " ").trim().toLowerCase();
  if (normalized === "private labels") return "private label";
  if (normalized === "own branded") return "own brand";
  return normalized;
}

function extractCompanyName(pages: ScrapedPage[]) {
  for (const page of pages) {
    const fromTitle = page.title ? extractCompanyNameFromText(page.title) : null;
    if (fromTitle) return fromTitle;
    const fromText = extractCompanyNameFromText(page.markdown);
    if (fromText) return fromText;
  }
  return null;
}

function extractCompanyNameFromText(text: string) {
  const cleaned = cleanEvidenceText(text).replace(/^Company Overview -\s*/i, "");
  for (const pattern of COMPANY_PATTERNS) {
    const match = cleaned.match(pattern);
    const value = dedupeRepeatedPhrase(match?.[1]?.trim().replace(/\s+/g, " ") || "");
    if (value && value.length <= 120) return value.replace(/[.,\s]+$/, ".");
  }
  return null;
}

function cleanFact(input: string) {
  return dedupeRepeatedPhrase(cleanEvidenceText(input)).replace(/[.,;:\s]+$/, "");
}

function addCleanFact(facts: Set<string>, input: string) {
  const fact = cleanFact(input);
  if (!fact || fact.length < 3) return;
  if (/\.(?:jpg|jpeg|png|webp|gif)\b/i.test(fact)) return;
  if (/^https?:\/\//i.test(fact)) return;
  facts.add(fact);
}

function cleanEvidenceText(input: string) {
  return input
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\S+\.(?:jpg|jpeg|png|webp|gif)(?:\?\S*)?/gi, " ")
    .replace(/鈮\?/g, "<=")
    .replace(/鈮/g, "<=")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBusinessFact(input: string) {
  const cleaned = input.replace(/^Registration No\./i, "Registration no.").replace(/^Date of Issue/i, "Date of issue").replace(/^Registered Capital/i, "Registered capital");
  return cleaned;
}

function dedupeRepeatedPhrase(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);

  if (words.length % 2 === 0) {
    const half = words.length / 2;
    const left = words.slice(0, half).join(" ");
    const right = words.slice(half).join(" ");
    if (left.toLowerCase() === right.toLowerCase()) return left;
  }

  return trimmed.replace(/\b(.{12,80}?)\s+\1\b/gi, "$1");
}

function buildRiskFlags(sources: SupplierAnalysisResult["sources"], unavailable: string[]) {
  const flags: string[] = [];
  const hasRatings = sources.some((source) => source.label.includes("ratings") && source.status === "AVAILABLE");
  const hasProducts = sources.some((source) => source.label.includes("product") && source.status === "AVAILABLE");
  const isWebsite = sources.some((source) => source.label.startsWith("Website"));
  const confidence = buildConfidenceLabel(sources, unavailable);

  flags.push(`Initial buyer confidence: ${confidence}`);
  if (isWebsite) {
    flags.push("Website public footprint is available, but business registration and certificate authenticity still need manual verification.");
  } else if (hasRatings) {
    flags.push("Alibaba ratings are available, but they should be checked against recent review text and order context.");
  } else {
    flags.push("Public marketplace rating evidence was not available in this automated pass.");
  }

  if (!hasProducts) {
    flags.push("Product coverage is incomplete, so product-category fit needs manual confirmation.");
  }

  if (unavailable.length > 0) {
    flags.push("Some public pages were unavailable during capture; treat the result as a partial signal set.");
  }

  return flags;
}

function buildConfidenceLabel(sources: SupplierAnalysisResult["sources"], unavailable: string[]) {
  const availableCount = sources.filter((source) => source.status === "AVAILABLE").length;
  const hasRatings = sources.some((source) => source.label.includes("ratings") && source.status === "AVAILABLE");
  const hasTrustPass = sources.some((source) => source.label.includes("TrustPass") && source.status === "AVAILABLE");
  const hasProducts = sources.some((source) => source.label.includes("product") && source.status === "AVAILABLE");
  const score = availableCount + (hasRatings ? 1 : 0) + (hasTrustPass ? 1 : 0) + (hasProducts ? 1 : 0) - unavailable.length;

  if (score >= 6) return "Medium-high public-source coverage, still needs manual verification before payment.";
  if (score >= 3) return "Medium public-source coverage, needs manual verification before purchase decisions.";
  return "Low public-source coverage, manual verification strongly recommended.";
}

function buildBuyerQuestions(sourceType: SupplierAnalysisResult["sourceType"]) {
  const base = [
    "Ask for a current business license and confirm the legal entity name matches the platform profile.",
    "Ask for product-specific certificates, test reports, and packaging photos for your target market.",
    "Ask whether the quoted product is made in-house, outsourced, or traded from another factory.",
  ];

  if (sourceType === "ALIBABA_STORE") {
    return [...base, "Ask for recent Alibaba order references or review context if the rating count is low."];
  }

  return [
    ...base,
    "Ask the supplier which legal entity owns the website domain and whether it matches the business license.",
    "Ask for certificate numbers, issuing bodies, validity dates, and holder names for any website certificate claims.",
    "Ask whether the website products are made in-house, subcontracted to audited factories, or sourced through trading partners.",
  ];
}

function buildNextSteps(sourceType: SupplierAnalysisResult["sourceType"]) {
  return [
    "Ask the supplier for business license, export records, product certificates, and recent production photos before payment.",
    "Compare the public company name, product line, and social/website footprint before sending a deposit.",
    sourceType === "ALIBABA_STORE"
      ? "Use this automated result as a first-pass screen, then request a human review for cross-platform verification."
      : "Use this automated result as a first-pass screen, then request a human review for business and social-source consistency.",
  ];
}

async function generateDeepSeekSummary(input: {
  companyName: string | null;
  sourceType: SupplierAnalysisResult["sourceType"];
  evidence: string[];
}) {
  if (!env.DEEPSEEK_API_KEY) {
    return fallbackSummary(input.companyName, input.sourceType, input.evidence.length);
  }

  const response = await fetch(`${(env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You write neutral supplier research summaries. Use only provided evidence. Do not claim compliance, verification, factory audit, or transaction safety. Return plain text only. Do not use Markdown, bullet symbols, tables, URLs, image syntax, or source links.",
        },
        {
          role: "user",
          content: JSON.stringify({
            companyName: input.companyName,
            sourceType: input.sourceType,
            evidence: input.evidence.slice(0, 40),
            instruction:
              "Write 2 concise English paragraphs for an overseas buyer. Mention that this is a first-pass public-source analysis. Use plain text sentences only. Do not include raw URLs, Markdown links, image fragments, brackets, bullet points, headings, or code fences.",
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return fallbackSummary(input.companyName, input.sourceType, input.evidence.length);
  }

  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return cleanGeneratedPlainText(json.choices?.[0]?.message?.content) || fallbackSummary(input.companyName, input.sourceType, input.evidence.length);
}

function fallbackSummary(companyName: string | null, sourceType: SupplierAnalysisResult["sourceType"], evidenceCount: number) {
  const name = companyName || "This supplier";
  const sourceLabel = sourceType === "ALIBABA_STORE" ? "Alibaba public storefront" : "public website";
  return `${name} has ${evidenceCount} public signals captured from the ${sourceLabel}. Treat this as a first-pass screening result and confirm legal identity, product fit, and recent operating activity before procurement decisions.`;
}

export function cleanGeneratedPlainText(input?: string) {
  if (!input) return "";
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
