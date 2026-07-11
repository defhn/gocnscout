"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";

export function BlogInteractions({ slug, title }: { slug: string; title: string }) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);
  useEffect(() => {
    const update = () => setProgress(Math.min(100, Math.max(0, (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100)));
    const article = document.querySelector("article");
    const items = Array.from(article?.querySelectorAll("h2, h3") ?? []).map((node, index) => { const id = node.id || `section-${index + 1}`; node.id = id; return { id, text: node.textContent ?? "", level: Number(node.tagName.slice(1)) }; });
    const frame = window.requestAnimationFrame(() => { setHeadings(items); update(); });
    window.addEventListener("scroll", update, { passive: true });
    const source = (new URLSearchParams(window.location.search).get("utm_source") ?? "").toLowerCase();
    const channel = source.includes("google") || source.includes("bing") ? "search" : source.includes("linkedin") ? "linkedin" : source === "x" || source.includes("twitter") ? "x" : source.includes("youtube") ? "youtube" : "other";
    void fetch(`/api/blog/${slug}/view`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: channel }) }).catch(() => undefined);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, [slug]);
  const share = (network: string) => { const url = encodeURIComponent(window.location.href); const text = encodeURIComponent(title); const href = network === "linkedin" ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}` : `https://twitter.com/intent/tweet?url=${url}&text=${text}`; window.open(href, "_blank", "noopener,noreferrer"); };
  return <><div className="fixed inset-x-0 top-0 z-50 h-1 bg-slate-100"><div className="h-full bg-teal-600 transition-[width]" style={{ width: `${progress}%` }} /></div>{headings.length > 1 && <nav aria-label="Table of Contents" className="rounded-md border border-slate-200 bg-white p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Table of Contents</p><div className="space-y-1">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className={`block text-sm text-slate-600 hover:text-teal-700 ${heading.level === 3 ? "pl-4 text-xs" : "font-semibold"}`}>{heading.text}</a>)}</div></nav>}<div className="flex flex-wrap items-center gap-2 border-y border-slate-100 py-4"><span className="mr-1 text-xs font-semibold text-slate-500">Share Article:</span><button type="button" onClick={() => share("linkedin")} className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-700">LinkedIn</button><button type="button" onClick={() => share("x")} className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-700">X</button><button type="button" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); })} className="inline-flex items-center gap-1 rounded border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">{copied ? <Check size={13} /> : <Link2 size={13} />}{copied ? "Copied!" : "Copy Link"}</button></div></>;
}
