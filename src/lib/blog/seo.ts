import type { BlogDocument, BlogNode } from "@/lib/blog/content";

export type ImageStats = {
  total: number;
  withAlt: number;
};

export function extractBlogText(node: BlogDocument | BlogNode | Record<string, unknown> | null | undefined): string {
  if (!node || typeof node !== "object") return "";
  if ((node as BlogNode).type === "text") return String((node as BlogNode).text ?? "");
  const children = (node as { content?: unknown }).content;
  if (!Array.isArray(children)) return "";
  return children.map((child) => extractBlogText(child as BlogNode)).join(" ");
}

export function getBlogImageStats(node: BlogDocument | BlogNode | Record<string, unknown> | null | undefined): ImageStats {
  if (!node || typeof node !== "object") return { total: 0, withAlt: 0 };
  let total = 0;
  let withAlt = 0;
  const typed = node as BlogNode;
  if (typed.type === "image") {
    total += 1;
    if (typeof typed.attrs?.alt === "string" && typed.attrs.alt.trim()) withAlt += 1;
  }
  const children = (node as { content?: unknown }).content;
  if (Array.isArray(children)) {
    for (const child of children) {
      const stats = getBlogImageStats(child as BlogNode);
      total += stats.total;
      withAlt += stats.withAlt;
    }
  }
  return { total, withAlt };
}

export function seoLengthStatus(value: string | null | undefined, min: number, max: number) {
  const length = value?.length ?? 0;
  if (length === 0) return { length, label: "未填写", tone: "muted" as const };
  if (length < min) return { length, label: "Too Short", tone: "warn" as const };
  if (length > max) return { length, label: "Too Long", tone: "danger" as const };
  return { length, label: "Excellent", tone: "good" as const };
}

export function withGeneratedImageAlts(document: BlogDocument, title: string): { document: BlogDocument; count: number } {
  let count = 0;
  const cleanTitle = title.trim() || "GoCNScout blog illustration";
  const visit = (node: BlogNode): BlogNode => {
    if (node.type === "image") {
      const attrs = { ...(node.attrs ?? {}) };
      if (typeof attrs.alt !== "string" || !attrs.alt.trim()) {
        attrs.alt = cleanTitle;
        count += 1;
      }
      return { ...node, attrs };
    }
    return { ...node, content: node.content?.map(visit) };
  };
  return { document: { ...document, content: document.content.map(visit) }, count };
}
