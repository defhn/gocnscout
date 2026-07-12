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
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row items-stretch" aria-label="Supplier analysis form">
      <div className="min-w-0 flex-1 relative">
        <label htmlFor="supplier-url" className="sr-only">
          Alibaba store or company website URL
        </label>
        <div className="relative rounded-xl shadow-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            id="supplier-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste an Alibaba product page, store page, or company website..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-xs hover:border-slate-300"
            required
          />
        </div>
        {error ? (
          <div className="absolute left-0 right-0 mt-2 bg-red-50 border border-red-150 rounded-lg p-2.5 text-xs text-red-600 animate-in fade-in slide-in-from-top-1 duration-200 z-10">
            {error}
          </div>
        ) : null}
      </div>
      <Button 
        type="submit" 
        variant="teal" 
        className="h-12 px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-75 disabled:pointer-events-none" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            <span>Analyze Free</span>
          </>
        )}
      </Button>
    </form>
  );
}

