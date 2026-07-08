"use client";

import Link from "next/link";
import { Filter } from "lucide-react";
import { useState } from "react";

type DatabaseFacetProps = {
  title: string;
  param: string;
  items: Array<[string, number]>;
  currentQuery: string;
};

export default function DatabaseFacet({ title, param, items, currentQuery }: DatabaseFacetProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 10);

  return (
    <section className="rounded-md border border-[#cfd9e5] bg-white p-3">
      <h2 className="flex items-center justify-between text-sm font-medium text-slate-700">
        {title}
        <Filter className="h-4 w-4 text-brand" />
      </h2>
      <div className="mt-3 grid gap-2">
        {visibleItems.length ? (
          visibleItems.map(([label, count]) => (
            <Link
              key={`${param}-${label}`}
              href={facetHref(currentQuery, param, label)}
              className="flex items-start justify-between gap-3 text-sm text-slate-700 hover:text-brand"
            >
              <span className="flex min-w-0 items-start gap-2">
                <span className="mt-0.5 h-4 w-4 flex-none rounded bg-slate-200" aria-hidden />
                <h3 className="truncate text-sm font-normal">{label}</h3>
              </span>
              <span className="text-slate-500">{count.toLocaleString("en-US")}</span>
            </Link>
          ))
        ) : (
          <h3 className="text-sm font-normal text-slate-500">No data before import</h3>
        )}
      </div>
      {items.length > 10 ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mx-auto mt-3 block rounded-md border border-[#cfd9e5] px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          aria-expanded={expanded}
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      ) : null}
    </section>
  );
}

function facetHref(currentQuery: string, param: string, label: string) {
  const next = new URLSearchParams(currentQuery);
  next.set(param, label);
  next.delete("page");
  return `/database?${next.toString()}`;
}
