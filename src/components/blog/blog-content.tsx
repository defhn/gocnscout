import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogDocument, BlogNode } from "@/lib/blog/content";

function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  if (value.startsWith("/") || value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function inline(node: BlogNode, key: string): ReactNode {
  if (node.type === "text") {
    let value: ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") value = <strong key={`${key}-b`}>{value}</strong>;
      if (mark.type === "italic") value = <em key={`${key}-i`}>{value}</em>;
      if (mark.type === "strike") value = <s key={`${key}-s`}>{value}</s>;
      if (mark.type === "code") value = <code key={`${key}-c`}>{value}</code>;
      if (mark.type === "link") {
        const href = safeUrl(mark.attrs?.href);
        value = href?.startsWith("/") ? <Link key={`${key}-l`} href={href}>{value}</Link> : href ? <a key={`${key}-l`} href={href} target="_blank" rel="noreferrer">{value}</a> : value;
      }
    }
    return value;
  }
  if (node.type === "hardBreak") return <br key={key} />;
  if (node.type === "image") {
    const src = safeUrl(node.attrs?.src);
    return src ? <img key={key} src={src} alt={String(node.attrs?.alt ?? "")} loading="lazy" className="my-6 h-auto max-w-full rounded-md border border-slate-200" /> : null;
  }
  return <>{(node.content ?? []).map((child, index) => inline(child, `${key}-${index}`))}</>;
}

function block(node: BlogNode, key: string): ReactNode {
  const children = (node.content ?? []).map((child, index) => inline(child, `${key}-${index}`));
  if (node.type === "heading") {
    const level = Math.min(3, Math.max(2, Number(node.attrs?.level ?? 2)));
    const Tag = `h${level}` as "h2" | "h3";
    return <Tag key={key} className="scroll-mt-24 text-slate-950">{children}</Tag>;
  }
  if (node.type === "paragraph") return <p key={key}>{children}</p>;
  if (node.type === "blockquote") return <blockquote key={key}>{(node.content ?? []).map((child, index) => block(child, `${key}-${index}`))}</blockquote>;
  if (node.type === "bulletList") return <ul key={key}>{(node.content ?? []).map((child, index) => <li key={`${key}-${index}`}>{(child.content ?? []).map((item, itemIndex) => block(item, `${key}-${index}-${itemIndex}`))}</li>)}</ul>;
  if (node.type === "orderedList") return <ol key={key}>{(node.content ?? []).map((child, index) => <li key={`${key}-${index}`}>{(child.content ?? []).map((item, itemIndex) => block(item, `${key}-${index}-${itemIndex}`))}</li>)}</ol>;
  if (node.type === "codeBlock") return <pre key={key}><code>{(node.content ?? []).map((child) => child.text ?? "").join("")}</code></pre>;
  if (node.type === "horizontalRule") return <hr key={key} />;
  if (node.type === "table") return <div key={key} className="overflow-x-auto"><table><tbody>{(node.content ?? []).map((row, rowIndex) => <tr key={`${key}-${rowIndex}`}>{(row.content ?? []).map((cell, cellIndex) => { const Cell = cell.type === "tableHeader" ? "th" : "td"; return <Cell key={`${key}-${rowIndex}-${cellIndex}`}>{(cell.content ?? []).map((item, itemIndex) => block(item, `${key}-${rowIndex}-${cellIndex}-${itemIndex}`))}</Cell>; })}</tr>)}</tbody></table></div>;
  return null;
}

export function BlogContent({ document }: { document: BlogDocument }) {
  return <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline">{(document.content ?? []).map((node, index) => block(node, String(index)))}</div>;
}
