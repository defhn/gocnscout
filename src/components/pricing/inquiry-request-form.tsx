"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Lock, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { WHATSAPP_URL } from "@/config/community";

export type ServiceOptionItem = {
  value: string;
  query: string;
  label: string;
};

export const INQUIRY_SERVICE_OPTIONS: ServiceOptionItem[] = [
  { value: "HUMAN_REVIEW_DECISION_SINGLE", query: "DECISION_SINGLE", label: "Buyer Decision Review (from $249 · Recommended)" },
  { value: "HUMAN_REVIEW_IDENTITY_SINGLE", query: "IDENTITY_SINGLE", label: "Supplier Identity Check (from $149)" },
  { value: "HUMAN_REVIEW_DECISION_BUNDLE", query: "DECISION_BUNDLE", label: "Buyer Decision Review - 3 Suppliers (from $499)" },
  { value: "DATA_LICENSE", query: "DATA_LICENSE", label: "Enterprise Data License ($6,000/yr)" },
  { value: "OTHER_RESEARCH", query: "OTHER", label: "Something else / Not sure which tier" },
];

export function InquiryRequestForm({
  defaultServiceQuery,
  defaultSupplier = "",
  initiallySubmitted = false,
  redirectTo = "/pricing#human-review",
}: {
  defaultServiceQuery?: string;
  defaultSupplier?: string;
  initiallySubmitted?: boolean;
  redirectTo?: string;
}) {
  const initialOption =
    INQUIRY_SERVICE_OPTIONS.find((item) => item.query === defaultServiceQuery) ?? INQUIRY_SERVICE_OPTIONS[0];

  const [selectedValue, setSelectedValue] = useState(initialOption.value);
  const [submitted, setSubmitted] = useState(initiallySubmitted);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ query?: string }>;
      const matched = INQUIRY_SERVICE_OPTIONS.find((item) => item.query === custom.detail?.query);
      if (matched) {
        setSelectedValue(matched.value);
        setSubmitted(false);
      }
    };
    window.addEventListener("gocnscout:select-service", handler);
    return () => window.removeEventListener("gocnscout:select-service", handler);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok) {
        setErrorMsg(payload.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      formEl.reset();
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const defaultMessage = defaultSupplier ? `Supplier: ${defaultSupplier}\n` : "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
      {submitted && (
        <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Request received — no payment is charged yet.</p>
            <p className="mt-1 text-xs text-teal-800 leading-relaxed">
              Our analyst team will check public record availability for your target supplier and email you to confirm
              the exact scope, price, and delivery window before sending a Stripe payment link.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800">
          {errorMsg}
        </div>
      )}

      <form action="/api/inquiries" method="post" onSubmit={handleSubmit} className="grid gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          Verification Package
          <select
            name="type"
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {INQUIRY_SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
            Your Name *
            <Input name="name" placeholder="e.g. Alex Mercer" required />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
            Work / Contact Email *
            <Input name="email" type="email" placeholder="you@company.com" required />
          </label>
        </div>

        <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
          Your Company / Storefront (Optional)
          <Input name="companyName" placeholder="Brand, importer, or e-commerce store name" />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
          Supplier Details &amp; What You Want Checked *
          <Textarea
            name="message"
            defaultValue={defaultMessage}
            rows={4}
            placeholder="Paste supplier English/Chinese name, Alibaba or website URL (if any), target product, approximate order value, and any specific concerns (e.g. factory vs trading claim, ownership, lawsuits, or deregistration risk)..."
            required
          />
        </label>

        {/* Honeypot field */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm cursor-pointer"
        >
          {submitting ? "Submitting Request..." : "Request Free Scope Confirmation"}
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 pt-1 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> Scope &amp; price confirmed before payment
          </span>
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-slate-400" /> Confidential — we never contact the supplier
          </span>
        </div>

        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-emerald-950">
            <strong>Prefer faster 1-on-1 chat?</strong> Send the supplier name, Alibaba link, or PI directly on WhatsApp.
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold !text-white hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat on WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}
