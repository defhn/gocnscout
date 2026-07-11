"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Mail } from "lucide-react";

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
    let href = "";
    if (network === "linkedin") {
      href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    } else if (network === "x") {
      href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (network === "facebook") {
      href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (network === "whatsapp") {
      href = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else if (network === "email") {
      href = `mailto:?subject=${text}&body=${url}`;
      window.location.href = href;
      return;
    }
    if (href) window.open(href, "_blank", "noopener,noreferrer"); 
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
      <div className="flex flex-wrap items-center gap-3 border-y border-slate-100 py-4">
        <span className="mr-2 text-xs font-semibold text-slate-500">Share:</span>
        
        {/* LinkedIn */}
        <button
          type="button"
          onClick={() => share("linkedin")}
          title="Share on LinkedIn"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#0a66c2]" aria-hidden="true">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </button>

        {/* X */}
        <button
          type="button"
          onClick={() => share("x")}
          title="Share on X"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-slate-900" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={() => share("facebook")}
          title="Share on Facebook"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#1877f2]" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={() => share("whatsapp")}
          title="Share on WhatsApp"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25d366]" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>

        {/* Email */}
        <button
          type="button"
          onClick={() => share("email")}
          title="Share via Email"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <Mail size={18} />
        </button>

        {/* Copy Link */}
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); })}
          title="Copy Link"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors shadow-2xs cursor-pointer"
        >
          {copied ? <Check size={18} /> : <Link2 size={18} />}
        </button>
      </div>
    </>
  );
}
