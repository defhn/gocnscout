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
    const items = Array.from(article?.querySelectorAll("h2, h3") ?? []).map((node, index) => { 
      const id = node.id || `section-${index + 1}`; 
      node.id = id; 
      return { id, text: node.textContent ?? "", level: Number(node.tagName.slice(1)) }; 
    });
    const frame = window.requestAnimationFrame(() => { setHeadings(items); update(); });
    window.addEventListener("scroll", update, { passive: true });
    const source = (new URLSearchParams(window.location.search).get("utm_source") ?? "").toLowerCase();
    const channel = source.includes("google") || source.includes("bing") ? "search" : source.includes("linkedin") ? "linkedin" : source === "x" || source.includes("twitter") ? "x" : source.includes("youtube") ? "youtube" : "other";
    void fetch(`/api/blog/${slug}/view`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: channel }) }).catch(() => undefined);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, [slug]);

  const share = (network: string) => { 
    const url = encodeURIComponent(window.location.href); 
    const text = encodeURIComponent(title); 
    const href = network === "linkedin" ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}` : `https://twitter.com/intent/tweet?url=${url}&text=${text}`; 
    window.open(href, "_blank", "noopener,noreferrer"); 
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-slate-100">
        <div className="h-full bg-teal-600 transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      {headings.length > 1 && (
        <nav aria-label="Table of Contents" className="rounded-md border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Table of Contents</p>
          <div className="space-y-1">
            {headings.map((heading) => (
              <a key={heading.id} href={`#${heading.id}`} className={`block text-sm text-slate-600 hover:text-teal-700 ${heading.level === 3 ? "pl-4 text-xs" : "font-semibold"}`}>{heading.text}</a>
            ))}
          </div>
        </nav>
      )}
      <div className="flex flex-wrap items-center gap-2 border-y border-slate-100 py-4">
        <span className="mr-1 text-xs font-semibold text-slate-500">Share Article:</span>
        <button
          type="button"
          onClick={() => share("linkedin")}
          className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#0a66c2]" aria-hidden="true">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          LinkedIn
        </button>
        <button
          type="button"
          onClick={() => share("x")}
          className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-slate-900" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </button>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); })}
          className="inline-flex items-center gap-1.5 rounded border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
        >
          {copied ? <Check size={13} /> : <Link2 size={13} />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </>
  );
}
