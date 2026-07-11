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
    if (level === 2) {
      return <h2 key={key} className="scroll-mt-24 mt-10 mb-4 text-2xl font-extrabold text-slate-900 tracking-tight leading-8">{children}</h2>;
    }
    return <h3 key={key} className="scroll-mt-24 mt-8 mb-3 text-xl font-bold text-slate-900 tracking-tight leading-7">{children}</h3>;
  }
  if (node.type === "paragraph") {
    return <p key={key} className="my-5 text-[16px] leading-7 text-slate-700 font-normal">{children}</p>;
  }
  if (node.type === "blockquote") {
    return (
      <blockquote key={key} className="my-6 border-l-4 border-teal-600 bg-slate-50 py-3 pl-5 pr-4 italic text-slate-800 rounded-r-md leading-relaxed shadow-sm">
        {(node.content ?? []).map((child, index) => block(child, `${key}-${index}`))}
      </blockquote>
    );
  }
  if (node.type === "bulletList") {
    return <ul key={key} className="my-5 list-disc pl-6 space-y-2 text-slate-700 text-[16px] leading-7">{(node.content ?? []).map((child, index) => <li key={`${key}-${index}`}>{(child.content ?? []).map((item, itemIndex) => block(item, `${key}-${index}-${itemIndex}`))}</li>)}</ul>;
  }
  if (node.type === "orderedList") {
    return <ol key={key} className="my-5 list-decimal pl-6 space-y-2 text-slate-700 text-[16px] leading-7">{(node.content ?? []).map((child, index) => <li key={`${key}-${index}`}>{(child.content ?? []).map((item, itemIndex) => block(item, `${key}-${index}-${itemIndex}`))}</li>)}</ol>;
  }
  if (node.type === "codeBlock") {
    return <pre key={key} className="my-6 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100 font-mono"><code>{(node.content ?? []).map((child) => child.text ?? "").join("")}</code></pre>;
  }
  if (node.type === "horizontalRule") {
    return <hr key={key} className="my-8 border-t border-slate-200" />;
  }
  if (node.type === "table") {
    return (
      <div key={key} className="my-8 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <tbody className="divide-y divide-slate-100">
              {(node.content ?? []).map((row, rowIndex) => {
                const isHeader = row.content?.some(cell => cell.type === "tableHeader");
                return (
                  <tr 
                    key={`${key}-${rowIndex}`} 
                    className={isHeader ? "bg-slate-50/80 font-bold" : "hover:bg-slate-50/40 transition-colors"}
                  >
                    {(row.content ?? []).map((cell, cellIndex) => {
                      const Cell = cell.type === "tableHeader" ? "th" : "td";
                      return (
                        <Cell 
                          key={`${key}-${rowIndex}-${cellIndex}`}
                          className={`px-4 py-3 text-left ${Cell === "th" ? "text-slate-900 font-bold border-b border-slate-200" : "text-slate-700"}`}
                        >
                          {(cell.content ?? []).map((item, itemIndex) => block(item, `${key}-${rowIndex}-${cellIndex}-${itemIndex}`))}
                        </Cell>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  return null;
}

export function BlogContent({ document }: { document: BlogDocument }) {
  return <div className="max-w-none">{(document.content ?? []).map((node, index) => block(node, String(index)))}</div>;
}
