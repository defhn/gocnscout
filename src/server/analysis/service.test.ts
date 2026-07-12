import { describe, expect, it, vi } from "vitest";
import { analyzeSupplierUrl } from "./service";

describe("supplier analysis service", () => {
  it("scrapes public Alibaba evidence pages and skips blocked pages", async () => {
    const fetcher = vi.fn(async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || "{}")) as { url: string };
      const page = body.url.includes("feedback")
        ? {
            title: "Ratings",
            markdown: "Overall Ratings 4.8/5 23 Reviews Supplier Service 4.9 On-time Shipment 4.7 Product Quality 4.8",
          }
        : body.url.includes("trustpass")
          ? {
              title: "TrustPass",
              markdown:
                "Company Name: Newo Biotechnology Co., Ltd. Registration No.: 91441900MA123 Registered Capital: RMB 500,000 Year Established: 2021",
            }
          : body.url.includes("productlist")
            ? {
                title: "Products",
                markdown: "Vitamin C Serum $1.20 Min. order: 100 pieces Sunscreen Lotion $2.50 Min. order: 200 pieces",
              }
            : {
                title: "Newo Biotechnology Co., Ltd.",
                markdown:
                  "Newo Biotechnology Co., Ltd. 5YR supplier OEM ODM skin care manufacturer Response Time 3h Revenue US$2.5M+",
              };

      return Response.json({
        success: true,
        data: {
          markdown: page.markdown,
          metadata: {
            title: page.title,
            sourceURL: body.url,
          },
        },
      });
    });

    const result = await analyzeSupplierUrl(
      "https://newo.m.en.alibaba.com/?productId=1601382467425",
      { fetcher, aiGenerator: async (input) => `AI summary for ${input.companyName}` },
    );

    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(result.companyName).toBe("Newo Biotechnology Co., Ltd.");
    expect(result.summary).toBe("AI summary for Newo Biotechnology Co., Ltd.");
    expect(result.sources.filter((source) => source.status === "AVAILABLE")).toHaveLength(4);
    expect(result.riskFlags).toContain("Alibaba ratings are available, but they should be checked against recent review text and order context.");
    expect(result.nextSteps).toContain("Ask the supplier for business license, export records, product certificates, and recent production photos before payment.");
  });

  it("marks captcha and 404 pages as unavailable", async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        success: true,
        data: {
          markdown: "captcha verification required",
          metadata: { title: "captcha" },
        },
      }),
    );

    const result = await analyzeSupplierUrl("https://example.com", { fetcher });

    expect(result.sources[0]?.status).toBe("UNAVAILABLE");
    expect(result.unavailable[0]).toContain("Website homepage");
  });

  it("uses an Alibaba product page as context and analyzes the linked supplier storefront", async () => {
    const requestedUrls: string[] = [];
    const fetcher = vi.fn(async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || "{}")) as { url: string };
      requestedUrls.push(body.url);

      const page = body.url.includes("www.alibaba.com/product-detail")
        ? {
            title: "Vitamin C Serum Product Detail",
            markdown:
              "Vitamin C Serum private label product. Supplier: [Newo Biotechnology Co., Ltd.](https://newo.m.en.alibaba.com/?from=detail_company_card)",
          }
        : body.url.includes("feedback")
          ? { title: "Ratings", markdown: "Overall Ratings 4.8/5 23 Reviews" }
          : body.url.includes("trustpass")
            ? { title: "TrustPass", markdown: "Company Name: Newo Biotechnology Co., Ltd. Year Established: 2021" }
            : body.url.includes("productlist")
              ? { title: "Products", markdown: "Vitamin C Serum Sunscreen Lotion Face Cream" }
              : { title: "Newo Biotechnology Co., Ltd.", markdown: "Newo Biotechnology Co., Ltd. 5YR OEM ODM skin care manufacturer" };

      return Response.json({
        success: true,
        data: { markdown: page.markdown, metadata: { title: page.title, sourceURL: body.url } },
      });
    });

    const result = await analyzeSupplierUrl("https://www.alibaba.com/product-detail/vitamin-c-serum_1601382467425.html", {
      fetcher,
      aiGenerator: async () => "Combined product and supplier storefront analysis.",
    });

    expect(result.sourceType).toBe("ALIBABA_STORE");
    expect(result.sourceUrl).toBe("https://www.alibaba.com/product-detail/vitamin-c-serum_1601382467425.html");
    expect(result.normalizedUrl).toBe("https://newo.m.en.alibaba.com/");
    expect(result.sources.map((source) => source.label)).toEqual([
      "Alibaba product page context",
      "Alibaba storefront",
      "Alibaba ratings",
      "Alibaba TrustPass summary",
      "Alibaba product list",
    ]);
    expect(requestedUrls).toContain("https://newo.en.alibaba.com/company_profile/feedback.html");
  });

  it("chooses up to five important same-site pages for a company website", async () => {
    const requestedUrls: string[] = [];
    const fetcher = vi.fn(async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || "{}")) as { url: string };
      requestedUrls.push(body.url);

      const markdown =
        body.url === "https://supplier.example.com/"
          ? [
              "Example Manufacturing Co., Ltd.",
              "[About Us](/about-us)",
              "[Products](/products)",
              "[Certifications](/certifications)",
              "[Factory Tour](/factory)",
              "[Contact](/contact)",
              "[Blog](/blog)",
              "[Privacy](/privacy)",
              "[Alibaba](https://example.m.en.alibaba.com)",
            ].join(" ")
          : `${body.url} public company page`;

      return Response.json({
        success: true,
        data: { markdown, metadata: { title: body.url, sourceURL: body.url } },
      });
    });

    const result = await analyzeSupplierUrl("https://supplier.example.com", {
      fetcher,
      aiGenerator: async () => "Five-page website analysis.",
    });

    expect(result.sourceType).toBe("WEBSITE");
    expect(requestedUrls).toEqual([
      "https://supplier.example.com/",
      "https://supplier.example.com/about-us",
      "https://supplier.example.com/products",
      "https://supplier.example.com/certifications",
      "https://supplier.example.com/factory",
    ]);
    expect(result.sources).toHaveLength(5);
    expect(result.sources.map((source) => source.label)).toEqual([
      "Website homepage",
      "Website page: About Us",
      "Website page: Products",
      "Website page: Certifications",
      "Website page: Factory Tour",
    ]);
  });

  it("keeps a website product page as context and analyzes the website homepage plus discovered pages", async () => {
    const requestedUrls: string[] = [];
    const fetcher = vi.fn(async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || "{}")) as { url: string };
      requestedUrls.push(body.url);

      const markdown =
        body.url === "https://supplier.example.com/products/serum"
          ? "Vitamin C Serum product detail page. Private label skin care product."
          : body.url === "https://supplier.example.com/"
            ? [
                "Example Manufacturing Co., Ltd.",
                "[About](/about)",
                "[Product Catalog](/products)",
                "[Quality Certificates](/quality-certificates)",
                "[Factory](/factory)",
              ].join(" ")
            : `${body.url} public supplier page`;

      return Response.json({
        success: true,
        data: { markdown, metadata: { title: body.url, sourceURL: body.url } },
      });
    });

    const result = await analyzeSupplierUrl("https://supplier.example.com/products/serum", {
      fetcher,
      aiGenerator: async () => "Product context plus website homepage analysis.",
    });

    expect(result.sourceType).toBe("WEBSITE");
    expect(result.sourceUrl).toBe("https://supplier.example.com/products/serum");
    expect(result.normalizedUrl).toBe("https://supplier.example.com/");
    expect(requestedUrls).toEqual([
      "https://supplier.example.com/products/serum",
      "https://supplier.example.com/",
      "https://supplier.example.com/about",
      "https://supplier.example.com/products",
      "https://supplier.example.com/quality-certificates",
      "https://supplier.example.com/factory",
    ]);
    expect(result.sources.map((source) => source.label)).toEqual([
      "Website entry page context",
      "Website homepage",
      "Website page: About",
      "Website page: Product Catalog",
      "Website page: Quality Certificates",
      "Website page: Factory",
    ]);
  });

  it("normalizes an Alibaba store subpage to the supplier storefront before expanding pages", async () => {
    const requestedUrls: string[] = [];
    const fetcher = vi.fn(async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || "{}")) as { url: string };
      requestedUrls.push(body.url);

      return Response.json({
        success: true,
        data: {
          markdown: body.url.includes("feedback")
            ? "Overall Ratings 4.8/5 23 Reviews"
            : "Newo Biotechnology Co., Ltd. OEM ODM skin care manufacturer",
          metadata: { title: "Newo Biotechnology Co., Ltd.", sourceURL: body.url },
        },
      });
    });

    const result = await analyzeSupplierUrl("https://newo.m.en.alibaba.com/productlist.html", {
      fetcher,
      aiGenerator: async () => "Alibaba storefront analysis.",
    });

    expect(result.normalizedUrl).toBe("https://newo.m.en.alibaba.com/");
    expect(requestedUrls[0]).toBe("https://newo.m.en.alibaba.com/");
    expect(result.sources[0]?.label).toBe("Alibaba storefront");
  });
});
