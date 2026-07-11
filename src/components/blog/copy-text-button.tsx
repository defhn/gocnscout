"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyTextButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        });
      }}
      className="inline-flex h-7 items-center gap-1 rounded border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {label}
    </button>
  );
}
