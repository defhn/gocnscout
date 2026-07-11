import { describe, expect, it } from "vitest";
import type { BlogDocument } from "@/lib/blog/content";
import { extractBlogText, getBlogImageStats, seoLengthStatus, withGeneratedImageAlts } from "@/lib/blog/seo";

describe("blog seo helpers", () => {
  it("extracts text and image alt stats from blog documents", () => {
    const document: BlogDocument = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Intro" }] },
        { type: "image", attrs: { src: "https://example.com/factory.webp", alt: "Factory floor" } },
        { type: "image", attrs: { src: "https://example.com/missing.webp", alt: "" } },
      ],
    };

    expect(extractBlogText(document)).toContain("Intro");
    expect(getBlogImageStats(document)).toEqual({ total: 2, withAlt: 1 });
  });

  it("fills missing image alt text with the article title", () => {
    const document: BlogDocument = { type: "doc", content: [{ type: "image", attrs: { src: "https://example.com/missing.webp", alt: "" } }] };

    const result = withGeneratedImageAlts(document, "Supplier verification checklist");

    expect(result.count).toBe(1);
    expect(result.document.content[0].attrs?.alt).toBe("Supplier verification checklist");
  });

  it("classifies seo field lengths", () => {
    expect(seoLengthStatus("short", 50, 60).tone).toBe("warn");
    expect(seoLengthStatus("x".repeat(55), 50, 60).tone).toBe("good");
    expect(seoLengthStatus("x".repeat(65), 50, 60).tone).toBe("danger");
  });
});
