import { describe, expect, it } from "vitest";

import { buildScrapeRequest } from "../../scripts/test-firecrawl-alibaba.cjs";

describe("buildScrapeRequest", () => {
  it("requests one public page with structured extraction fields", () => {
    expect(
      buildScrapeRequest("https://example.com/supplier", "CN"),
    ).toMatchObject({
      url: "https://example.com/supplier",
      formats: ["markdown", "links", "screenshot"],
      location: { country: "CN" },
      onlyMainContent: true,
      proxy: "auto",
    });
  });

  it("uses a US location by default for Alibaba's international site", () => {
    expect(buildScrapeRequest("https://example.com/supplier").location).toEqual({ country: "US" });
  });
});
