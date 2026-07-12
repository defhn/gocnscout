export type AnalysisSourceType = "ALIBABA_STORE" | "WEBSITE";
export type AnalysisSourceStatus = "AVAILABLE" | "UNAVAILABLE";
export type ManualReviewPackageCode =
  | "IDENTITY_SINGLE"
  | "IDENTITY_BUNDLE"
  | "DECISION_SINGLE"
  | "DECISION_BUNDLE";

export type AnalysisSource = {
  label: string;
  url: string;
};

export type AnalysisEvidenceSource = AnalysisSource & {
  status: AnalysisSourceStatus;
  facts: string[];
};

export type SupplierAnalysisResult = {
  sourceType: AnalysisSourceType;
  sourceUrl: string;
  normalizedUrl: string;
  companyName: string | null;
  summary: string;
  sources: AnalysisEvidenceSource[];
  unavailable: string[];
  riskFlags: string[];
  buyerQuestions: string[];
  nextSteps: string[];
  limitations: string[];
  generatedAt: string;
};

const PRIVATE_HOST_RE = /(^localhost$|\.local$)/i;
const ALIBABA_STORE_RE = /(^|\.)m?\.?en\.alibaba\.com$/i;
const BLOCKED_LINK_RE = /(message\.alibaba\.com|contactinfo|\/contact|login|signin|captcha|token=|session=)/i;

export function normalizeAnalysisUrl(input: string): {
  normalizedUrl: string;
  sourceType: AnalysisSourceType;
} {
  const raw = input.trim();
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;

  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("Enter a valid public http URL.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Enter a valid public http URL.");
  }

  if (!isPublicHostname(url.hostname)) {
    throw new Error("Enter a valid public http URL.");
  }

  url.hash = "";
  const normalizedUrl = url.toString();
  return {
    normalizedUrl,
    sourceType: isAlibabaStoreHost(url.hostname) ? "ALIBABA_STORE" : "WEBSITE",
  };
}

export function buildAnalysisSources(input: string): AnalysisSource[] {
  const { normalizedUrl, sourceType } = normalizeAnalysisUrl(input);

  if (sourceType !== "ALIBABA_STORE") {
    return [{ label: "Website page", url: normalizedUrl }];
  }

  const url = new URL(normalizedUrl);
  const shop = getAlibabaShopSlug(url.hostname);
  const mobileHost = `${shop}.m.en.alibaba.com`;
  const desktopHost = `${shop}.en.alibaba.com`;

  return [
    { label: "Alibaba storefront", url: normalizedUrl },
    { label: "Alibaba ratings", url: `https://${desktopHost}/company_profile/feedback.html` },
    {
      label: "Alibaba TrustPass summary",
      url: `https://${desktopHost}/company_profile/trustpass_profile.html?certification_type=intl_assessment`,
    },
    { label: "Alibaba product list", url: `https://${mobileHost}/productlist.html` },
  ];
}

export function sanitizeSourceLinks(links: string[]) {
  const seen = new Set<string>();
  const clean: string[] = [];

  for (const link of links) {
    try {
      const url = new URL(link);
      if (url.protocol !== "https:" && url.protocol !== "http:") continue;
      if (BLOCKED_LINK_RE.test(url.toString())) continue;
      url.hash = "";
      const normalized = url.toString();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        clean.push(normalized);
      }
    } catch {
      continue;
    }
  }

  return clean.slice(0, 12);
}

export function serializeAnalysisResult(input: Omit<SupplierAnalysisResult, "generatedAt" | "limitations"> & {
  limitations?: string[];
}): SupplierAnalysisResult {
  return {
    ...input,
    companyName: input.companyName || null,
    sources: input.sources.map((source) => ({
      ...source,
      facts: source.facts.slice(0, 12),
    })),
    unavailable: input.unavailable.slice(0, 12),
    riskFlags: input.riskFlags.slice(0, 8),
    buyerQuestions: input.buyerQuestions.slice(0, 8),
    nextSteps: input.nextSteps.slice(0, 8),
    limitations: [
      "This result is based only on publicly reachable pages captured at analysis time.",
      "It is not a legal opinion, factory audit, certificate verification, or transaction guarantee.",
      ...(input.limitations || []),
    ],
    generatedAt: new Date().toISOString(),
  };
}

function isAlibabaStoreHost(hostname: string) {
  const parts = hostname.toLowerCase().split(".");
  return parts.length >= 4 && ALIBABA_STORE_RE.test(hostname);
}

function getAlibabaShopSlug(hostname: string) {
  const parts = hostname.toLowerCase().split(".");
  return parts[0] || hostname;
}

function isPublicHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  if (PRIVATE_HOST_RE.test(lower)) return false;
  if (lower === "0.0.0.0") return false;
  if (isPrivateIp(lower)) return false;
  return lower.includes(".");
}

function isPrivateIp(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;
  if (a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}
