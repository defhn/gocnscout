"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalysisForm({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/supplier-analysis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error?.message || "We could not analyze this URL.");
        return;
      }

      window.location.href = json.redirectTo;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row" aria-label="Supplier analysis form">
      <div className="min-w-0 flex-1">
        <label htmlFor="supplier-url" className="sr-only">
          Alibaba store or company website URL
        </label>
        <input
          id="supplier-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste an Alibaba product page, store page, or company website URL"
          className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          required
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>
      <Button type="submit" variant="teal" className="h-12 shrink-0 px-5 font-bold" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        Analyze
      </Button>
    </form>
  );
}
