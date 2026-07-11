import { describe, expect, it } from "vitest";
import { markdownToBlogDocument, parseMarkdownFrontMatter, readingMinutes } from "@/lib/blog/content";

describe("blog content", () => {
  it("parses front matter from a local markdown article", () => {
    const parsed = parseMarkdownFrontMatter(`---
title: Supplier Verification Guide
slug: supplier-verification-guide
tags:
  - suppliers
  - compliance
category: Sourcing
---
# Heading

Body text`);

    expect(parsed.metadata.title).toBe("Supplier Verification Guide");
    expect(parsed.metadata.slug).toBe("supplier-verification-guide");
    expect(parsed.metadata.category).toBe("Sourcing");
    expect(parsed.metadata.tags).toEqual(["suppliers", "compliance"]);
    expect(parsed.body).toContain("# Heading");
  });

  it("converts pasted markdown into a tiptap-compatible document", () => {
    const document = markdownToBlogDocument(`# Main

Intro with **bold** and [link](/database).

- First
- Second

| Field | Value |
| --- | --- |
| Industry | Hardware |`);

    expect(document.type).toBe("doc");
    expect(document.content[0]).toMatchObject({ type: "heading", attrs: { level: 1 } });
    expect(document.content[1].content?.[1]).toMatchObject({ type: "text", text: "bold", marks: [{ type: "bold" }] });
    expect(document.content[2]).toMatchObject({
      type: "bulletList",
      content: [
        { type: "listItem", content: [{ type: "paragraph" }] },
        { type: "listItem", content: [{ type: "paragraph" }] },
      ],
    });
    expect(document.content[3]).toMatchObject({ type: "table" });
  });

  it("returns at least one reading minute for short posts", () => {
    expect(readingMinutes(markdownToBlogDocument("Short post"))).toBe(1);
  });
});
