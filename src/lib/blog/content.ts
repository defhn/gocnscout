import { marked, type Tokens } from "marked";

export type BlogNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: BlogNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

export type BlogDocument = {
  type: "doc";
  content: BlogNode[];
};

type TokenWithChildren = { tokens?: Tokens.Generic[] };

export function emptyBlogDocument(): BlogDocument {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

function inlineTokens(tokens: Tokens.Generic[] | undefined): BlogNode[] {
  if (!tokens) return [];
  const output: BlogNode[] = [];

  for (const token of tokens) {
    if (token.type === "text") {
      output.push({ type: "text", text: token.text });
    } else if (token.type === "strong" || token.type === "em" || token.type === "del") {
      const markType = token.type === "strong" ? "bold" : token.type === "em" ? "italic" : "strike";
      for (const node of inlineTokens(token.tokens)) {
        output.push({ ...node, marks: [...(node.marks ?? []), { type: markType }] });
      }
    } else if (token.type === "codespan") {
      output.push({ type: "text", text: token.text, marks: [{ type: "code" }] });
    } else if (token.type === "link") {
      for (const node of inlineTokens(token.tokens)) {
        output.push({
          ...node,
          marks: [...(node.marks ?? []), { type: "link", attrs: { href: token.href } }],
        });
      }
    } else if (token.type === "image") {
      output.push({ type: "image", attrs: { src: token.href, alt: token.text || "" } });
    } else if (token.type === "br") {
      output.push({ type: "hardBreak" });
    } else if (token.type === "escape") {
      output.push({ type: "text", text: token.text });
    } else if ("raw" in token && token.raw) {
      output.push({ type: "text", text: token.raw });
    }
  }

  return output;
}

function blockTokens(tokens: Tokens.Generic[] | undefined): BlogNode[] {
  if (!tokens) return [];
  const output: BlogNode[] = [];

  for (const token of tokens) {
    if (token.type === "heading") {
      output.push({ type: "heading", attrs: { level: token.depth }, content: inlineTokens(token.tokens) });
    } else if (token.type === "paragraph") {
      output.push({ type: "paragraph", content: inlineTokens(token.tokens) });
    } else if (token.type === "blockquote") {
      output.push({ type: "blockquote", content: blockTokens(token.tokens) });
    } else if (token.type === "list") {
      output.push({
        type: token.ordered ? "orderedList" : "bulletList",
        attrs: token.ordered ? { start: token.start ?? 1 } : undefined,
        content: (token.items as TokenWithChildren[]).map((item) => ({ type: "listItem", content: blockTokens(item.tokens) })),
      });
    } else if (token.type === "code") {
      output.push({ type: "codeBlock", attrs: { language: token.lang || null }, content: [{ type: "text", text: token.text }] });
    } else if (token.type === "hr") {
      output.push({ type: "horizontalRule" });
    } else if (token.type === "table") {
      const rows: BlogNode[] = [];
      const headerCells = (token.header as TokenWithChildren[]).map((cell) => ({ type: "tableHeader", content: [{ type: "paragraph", content: inlineTokens(cell.tokens) }] }));
      rows.push({ type: "tableRow", content: headerCells });
      for (const row of token.rows) {
        rows.push({ type: "tableRow", content: (row as TokenWithChildren[]).map((cell) => ({ type: "tableCell", content: [{ type: "paragraph", content: inlineTokens(cell.tokens) }] })) });
      }
      output.push({ type: "table", content: rows });
    } else if (token.type === "space") {
      continue;
    } else if (token.type === "html") {
      output.push({ type: "paragraph", content: [{ type: "text", text: token.text }] });
    } else if ("text" in token) {
      output.push({ type: "paragraph", content: inlineTokens(token.tokens) || [{ type: "text", text: token.text }] });
    }
  }

  return output;
}

export function markdownToBlogDocument(markdown: string): BlogDocument {
  const parsed = blockTokens(marked.lexer(markdown)) || [];
  return { type: "doc", content: parsed.length > 0 ? parsed : [{ type: "paragraph" }] };
}

export function parseMarkdownFrontMatter(raw: string): { metadata: Record<string, string | string[]>; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!normalized.startsWith("---\n")) return { metadata: {}, body: normalized };
  const end = normalized.indexOf("\n---\n", 4);
  if (end < 0) return { metadata: {}, body: normalized };
  const metadata: Record<string, string | string[]> = {};
  let currentKey = "";
  for (const line of normalized.slice(4, end).split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      const value = match[2].trim().replace(/^['"]|['"]$/g, "");
      metadata[currentKey] = value;
    } else if (line.trim().startsWith("-") && currentKey) {
      const value = line.trim().slice(1).trim().replace(/^['"]|['"]$/g, "");
      const current = metadata[currentKey];
      metadata[currentKey] = [...(Array.isArray(current) ? current : []), value];
    }
  }
  return { metadata, body: normalized.slice(end + 5).trim() };
}

export function isBlogDocument(value: unknown): value is BlogDocument {
  return Boolean(value && typeof value === "object" && (value as { type?: unknown }).type === "doc");
}

export function countWords(document: BlogDocument): number {
  const text = JSON.stringify(document).match(/[A-Za-z0-9\u4e00-\u9fff]+/g) ?? [];
  return text.length;
}

export function readingMinutes(document: BlogDocument): number {
  return Math.max(1, Math.round(countWords(document) / 200));
}
