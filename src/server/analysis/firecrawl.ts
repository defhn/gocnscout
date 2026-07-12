import { env } from "@/lib/env";
import type { AnalysisSource } from "./contract";

export type ScrapedPage = {
  source: AnalysisSource;
  status: "AVAILABLE" | "UNAVAILABLE";
  title: string | null;
  markdown: string;
  reason?: string;
};

type FirecrawlResponse = {
  success?: boolean;
  data?: {
    markdown?: string;
    metadata?: {
      title?: string;
      sourceURL?: string;
    };
  };
  error?: string;
};

const BLOCKED_PAGE_RE = /(captcha|404-error|404 error|access denied|robot check|verify you are human)/i;
const MAX_MARKDOWN_LENGTH = 14000;

export async function scrapeAnalysisSource(
  source: AnalysisSource,
  options: { fetcher?: typeof fetch; timeoutMs?: number } = {},
): Promise<ScrapedPage> {
  const fetcher = options.fetcher || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);

  try {
    const response = await fetcher(`${env.FIRECRAWL_BASE_URL.replace(/\/$/, "")}/v2/scrape`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.FIRECRAWL_API_KEY || "missing-firecrawl-key"}`,
        "content-type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        url: source.url,
        formats: ["markdown"],
        onlyMainContent: true,
        maxAge: 0,
        location: { country: "US" },
        proxy: "auto",
      }),
    });

    if (!response.ok) {
      return unavailable(source, `Firecrawl returned ${response.status}`);
    }

    const json = (await response.json()) as FirecrawlResponse;
    const title = json.data?.metadata?.title || null;
    const markdown = normalizeMarkdown(json.data?.markdown || "");

    if (!json.success || !markdown || BLOCKED_PAGE_RE.test(`${title || ""} ${markdown.slice(0, 500)}`)) {
      return unavailable(source, "The page was not publicly reachable.");
    }

    return {
      source,
      status: "AVAILABLE",
      title,
      markdown,
    };
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError" ? "The page timed out." : "The page could not be scraped.";
    return unavailable(source, reason);
  } finally {
    clearTimeout(timeout);
  }
}

function unavailable(source: AnalysisSource, reason: string): ScrapedPage {
  return {
    source,
    status: "UNAVAILABLE",
    title: null,
    markdown: "",
    reason,
  };
}

function normalizeMarkdown(input: string) {
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_MARKDOWN_LENGTH);
}
