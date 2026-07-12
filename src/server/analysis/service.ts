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
const BUSINESS_RE = /(Registration No\.?:\s*[A-Z0-9-]+|Registered Capital:\s*[^.]+?|Year Established:\s*\d{4}|Store years?:\s*\d+\s*YR|Response Time\s*[^.]+?|Revenue\s*[^.]+?)(?=\s[A-Z][a-z]|\s*$)/gi;
const PRODUCT_RE = /([A-Z][A-Za-z0-9%+&' -]{3,80}(?:Serum|Lotion|Cream|Mask|Bottle|Box|Bag|Machine|Set|Kit|Powder|Capsule|Toy|Light|Cable|Case|Chair|Table|Shoes|Dress|Shirt|Packaging)[^$]{0,60})/g;
const MARKDOWN_LINK_RE = /\[([^\]]{1,120})\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g;
const IMPORTANT_PATH_RE = /(about|company|profile|product|capabilit|factory|manufactur|certificat|quality|service)/i;
const LOW_VALUE_PATH_RE = /(blog|news|privacy|terms|policy|login|signin|cart|account|search|javascript|mailto:|tel:)/i;
const ALIBABA_STORE_LINK_RE = /^https?:\/\/[a-z0-9-]+\.m?\.?en\.alibaba\.com/i;

export async function analyzeSupplierUrl(inputUrl: string, options: AnalyzeOptions = {}): Promise<SupplierAnalysisResult> {
  const initial = normalizeAnalysisUrl(inputUrl);
  let normalizedUrl = deriveHomeUrl(initial.normalizedUrl, initial.sourceType);
  let sourceType = initial.sourceType;
  let scraped: ScrapedPage[];

  if (initial.sourceType === "ALIBABA_STORE") {
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
      const rest = await scrapeSources(websiteSources.slice(1), options.fetcher);
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
  const text = page.markdown;
  const facts = new Set<string>();

  if (page.title) facts.add(`Page title: ${page.title}`);

  for (const match of text.matchAll(RATING_RE)) {
    facts.add(cleanFact(match[0]));
  }

  for (const match of text.matchAll(BUSINESS_RE)) {
    facts.add(cleanFact(match[0]));
  }

  for (const match of text.matchAll(PRODUCT_RE)) {
    facts.add(`Product signal: ${cleanFact(match[1] || match[0])}`);
    if (facts.size >= 10) break;
  }

  const companyName = extractCompanyNameFromText(text);
  if (companyName) facts.add(`Company name: ${companyName}`);

  if (facts.size <= 1 && text) {
    facts.add(`Visible text sample: ${text.slice(0, 220)}`);
  }

  return Array.from(facts).slice(0, 12);
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
  for (const pattern of COMPANY_PATTERNS) {
    const match = text.match(pattern);
    const value = match?.[1]?.trim().replace(/\s+/g, " ");
    if (value && value.length <= 120) return value.replace(/[.,\s]+$/, ".");
  }
  return null;
}

function cleanFact(input: string) {
  return input.replace(/\s+/g, " ").trim().replace(/[.,;:\s]+$/, "");
}

function buildRiskFlags(sources: SupplierAnalysisResult["sources"], unavailable: string[]) {
  const flags: string[] = [];
  const hasRatings = sources.some((source) => source.label.includes("ratings") && source.status === "AVAILABLE");
  const hasProducts = sources.some((source) => source.label.includes("product") && source.status === "AVAILABLE");

  if (hasRatings) {
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

function buildBuyerQuestions(sourceType: SupplierAnalysisResult["sourceType"]) {
  const base = [
    "Ask for a current business license and confirm the legal entity name matches the platform profile.",
    "Ask for product-specific certificates, test reports, and packaging photos for your target market.",
    "Ask whether the quoted product is made in-house, outsourced, or traded from another factory.",
  ];

  if (sourceType === "ALIBABA_STORE") {
    return [...base, "Ask for recent Alibaba order references or review context if the rating count is low."];
  }

  return [...base, "Ask for official company domain email confirmation and recent customer references."];
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
            "You write neutral supplier research summaries. Use only provided evidence. Do not claim compliance, verification, factory audit, or transaction safety.",
        },
        {
          role: "user",
          content: JSON.stringify({
            companyName: input.companyName,
            sourceType: input.sourceType,
            evidence: input.evidence.slice(0, 40),
            instruction:
              "Write 2 concise English paragraphs for an overseas buyer. Mention that this is a first-pass public-source analysis.",
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return fallbackSummary(input.companyName, input.sourceType, input.evidence.length);
  }

  const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() || fallbackSummary(input.companyName, input.sourceType, input.evidence.length);
}

function fallbackSummary(companyName: string | null, sourceType: SupplierAnalysisResult["sourceType"], evidenceCount: number) {
  const name = companyName || "This supplier";
  const sourceLabel = sourceType === "ALIBABA_STORE" ? "Alibaba public storefront" : "public website";
  return `${name} has ${evidenceCount} public signals captured from the ${sourceLabel}. Treat this as a first-pass screening result and confirm legal identity, product fit, and recent operating activity before procurement decisions.`;
}
