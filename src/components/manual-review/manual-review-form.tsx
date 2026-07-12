"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type ManualReviewFormProps = {
  reviewId: string;
  supplierUrl: string;
  supplierSlots: number;
};

export function ManualReviewForm({ reviewId, supplierUrl, supplierSlots }: ManualReviewFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const additionalSupplierUrls = [form.get("supplierUrl2"), form.get("supplierUrl3")]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    try {
      const response = await fetch(`/api/manual-review/${reviewId}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          buyerName: form.get("buyerName"),
          buyerEmail: form.get("buyerEmail"),
          companyName: form.get("companyName"),
          supplierUrl: form.get("supplierUrl"),
          additionalSupplierUrls,
          targetProduct: form.get("targetProduct"),
          destinationMarket: form.get("destinationMarket"),
          procurementStage: form.get("procurementStage"),
          estimatedOrderValue: form.get("estimatedOrderValue"),
          notes: form.get("notes"),
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(json.error || "Please check the form and try again.");
        return;
      }

      setStatus("success");
      setMessage(json.message || "Submitted. We will deliver within 24-48 hours.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="buyerName" label="Your name" required />
        <Field name="buyerEmail" label="Email for delivery" type="email" required />
        <Field name="companyName" label="Your company" />
        <Field name="destinationMarket" label="Destination market" placeholder="United States, EU, Singapore..." required />
      </div>

      <Field name="supplierUrl" label="Supplier URL" defaultValue={supplierUrl} required />

      {supplierSlots > 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="supplierUrl2" label="Second supplier URL" />
          <Field name="supplierUrl3" label="Third supplier URL" />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field name="targetProduct" label="Target product" placeholder="Example: vitamin C serum, pet carrier, LED lamp" required />
        <Field name="procurementStage" label="Procurement stage" placeholder="Before sample order, comparing quotes, before deposit..." required />
        <Field name="estimatedOrderValue" label="Estimated order value" placeholder="Optional, e.g. $3,000 first order" />
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Notes</span>
        <textarea
          name="notes"
          rows={5}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          placeholder="Any concerns, screenshots to check manually, or questions you want answered."
        />
      </label>

      {message ? (
        <p className={status === "success" ? "text-sm font-semibold text-teal-700" : "text-sm font-semibold text-red-600"}>
          {message}
        </p>
      ) : null}

      <Button type="submit" variant="teal" disabled={status === "loading" || status === "success"} className="w-full font-bold">
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit review details
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
      />
    </label>
  );
}
