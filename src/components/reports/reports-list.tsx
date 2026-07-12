"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Home, Hammer, Shirt, Cpu, Gift, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatUsd } from "@/lib/utils";

// Define categories
const REPORT_CATEGORIES = [
  {
    id: "home-kitchen",
    label: "Home & Kitchen",
    icon: Home,
    slugs: [
      "household-items", "kitchen-tableware", "furniture", "home-textiles",
      "home-decor", "bathroom-equipment", "garden-supplies", "daily-use-ceramics",
      "home-decorations", "home-supplies", "artistic-ceramics", "daily-ceramics"
    ]
  },
  {
    id: "industrial-tools",
    label: "Industrial & Tools",
    icon: Hammer,
    slugs: [
      "hardware", "tools", "building-and-decoration-materials",
      "general-machinery-and-mechanical-basic-parts", "power-and-electrical-equipment",
      "industrial-automation-and-intelligent-manufacturing", "woven-and-rattan-iron-crafts",
      "agricultural-machinery-indoor", "construction-machinery-indoor"
    ]
  },
  {
    id: "apparel-fashion",
    label: "Apparel & Fashion",
    icon: Shirt,
    slugs: [
      "men-s-and-women-s-clothing", "shoes", "bags-luggage", "footwear", "underwear",
      "sportswear-casual-wear", "garment-accessories-trimmings", "clothing-accessories-parts",
      "children-s-clothing"
    ]
  },
  {
    id: "electronics-tech",
    label: "Electronics & Tech",
    icon: Cpu,
    slugs: [
      "home-appliances", "household-appliances", "electronic-consumer-goods-and-information-products",
      "electronic-and-electrical-products", "lighting-products", "new-energy", "motorcycles",
      "personal-care-appliances", "electronic-consumer-products-and-information-products",
      "new-energy-vehicles-and-smart-mobility"
    ]
  },
  {
    id: "crafts-gifts",
    label: "Crafts & Gifts",
    icon: Gift,
    slugs: [
      "gifts-premiums", "food", "glass-crafts", "festive-supplies", "office-stationery",
      "sports-and-tourism-leisure-products", "sports-and-travel-leisure-products",
      "pet-supplies", "pharmaceuticals-health-products-and-medical-devices",
      "baby-children-products", "office-stationery-draft", "festival-supplies",
      "medical-and-health-products-and-medical-devices"
    ]
  }
];

type Report = {
  id: string;
  slug: string;
  title: string;
  type: string;
  priceUsdCents: number;
  industryName: string | null;
  description: string | null;
  status: string;
  fileKey: string | null;
};

interface ReportsListProps {
  initialReports: Report[];
}

export function ReportsList({ initialReports }: ReportsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // 1. Sort reports by exporter count descending dynamically
  const sortedReports = [...initialReports].sort((a, b) => {
    const aMatch = a.description?.match(/analyzing\s+([\d,]+)/i);
    const bMatch = b.description?.match(/analyzing\s+([\d,]+)/i);
    const aCount = aMatch ? parseInt(aMatch[1].replace(/,/g, ""), 10) : 0;
    const bCount = bMatch ? parseInt(bMatch[1].replace(/,/g, ""), 10) : 0;
    return bCount - aCount;
  });

  // 2. Global search filter function
  const matchesSearch = (r: Report) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      (r.description || "").toLowerCase().includes(term) ||
      (r.industryName || "").toLowerCase().includes(term)
    );
  };

  // 3. Categorize sorted reports & filter
  const categorizedData = REPORT_CATEGORIES.map(cat => {
    const matchedReports = sortedReports.filter(r => {
      // Must match search term
      if (!matchesSearch(r)) return false;
      // Must match category if activeCategory is specific
      if (activeCategory !== "all" && activeCategory !== cat.id) return false;
      // Match slug
      return cat.slugs.includes(r.slug);
    });

    return {
      ...cat,
      reports: matchedReports
    };
  });

  // Collect reports that don't match any defined category and match search
  const uncategorizedReports = sortedReports.filter(r => {
    if (!matchesSearch(r)) return false;
    if (activeCategory !== "all") return false; // only show uncategorized when showing all
    return !REPORT_CATEGORIES.some(cat => cat.slugs.includes(r.slug));
  });

  // Combine categorization structure
  const visibleCategories = categorizedData.filter(cat => cat.reports.length > 0);
  const totalVisibleCount = visibleCategories.reduce((sum, cat) => sum + cat.reports.length, 0) + uncategorizedReports.length;

  return (
    <div>
      {/* Search & Filter Controls Block */}
      <div className="flex flex-col gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-10">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search industry or category (e.g. kitchen, textile, clothing)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories Tabs */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Filter by Category</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`inline-flex items-center justify-center h-9 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeCategory === "all"
                  ? "bg-brand text-white border-brand shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              All Categories
            </button>
            {REPORT_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-brand text-white border-brand shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid List View */}
      {totalVisibleCount > 0 ? (
        <div className="space-y-12">
          {/* Categorized groups */}
          {visibleCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {cat.label} <span className="text-xs text-slate-400 font-normal ml-2">({cat.reports.length} {cat.reports.length === 1 ? 'Report' : 'Reports'})</span>
                  </h3>
                </div>

                {/* Cards grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {cat.reports.map((report) => {
                    const countMatch = report.description?.match(/analyzing\s+([\d,]+)/i);
                    const countVal = countMatch ? countMatch[1] : "100+";
                    const totalExporters = countMatch ? parseInt(countMatch[1].replace(/,/g, ""), 10) : 100;
                    const factoryText = totalExporters < 100 ? `All ${totalExporters} Stable Factories` : "Top 100 Stable Factories";

                    return (
                      <Card 
                        key={report.id} 
                        className="border border-slate-200 bg-white hover:border-teal-500/20 hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs"
                      >
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            {/* Header tags */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                                Standard Report
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                {countVal} Exporters Vetted
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-950 mt-4 leading-snug line-clamp-2 hover:text-teal-655 transition-colors">
                              <Link href={`/reports/${report.slug}`}>{report.title}</Link>
                            </h3>
                            
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                              {report.description || "Aggregated category overview mapping manufacturing hubs, corporate sizes, website domains, and compliance checklists."}
                            </p>

                            {/* Features outline bullet points */}
                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-slate-600 font-medium">
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                                <span className="truncate">{factoryText}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                                <span>Corporate USCCs</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                                <span className="truncate">Website Domains</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                                <span className="truncate">Regional Density</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions row */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PDF Guide Price</span>
                            <span className="text-xl font-extrabold text-slate-900">{formatUsd(report.priceUsdCents)}</span>
                          </div>
                          
                          <a
                            href={`/api/reports/${report.id}/checkout`}
                            className="inline-flex w-full h-10 items-center justify-center rounded-xl bg-brand !text-white hover:bg-brand-strong text-xs font-bold transition shadow-sm hover:shadow"
                          >
                            Get Sourcing Guide
                          </a>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Uncategorized group if any */}
          {uncategorizedReports.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900">Other Industry Guides</h3>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {uncategorizedReports.map((report) => {
                  const countMatch = report.description?.match(/analyzing\s+([\d,]+)/i);
                  const countVal = countMatch ? countMatch[1] : "100+";
                  const totalExporters = countMatch ? parseInt(countMatch[1].replace(/,/g, ""), 10) : 100;
                  const factoryText = totalExporters < 100 ? `All ${totalExporters} Stable Factories` : "Top 100 Stable Factories";

                  return (
                    <Card 
                      key={report.id} 
                      className="border border-slate-200 bg-white hover:border-teal-500/20 hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs"
                    >
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                              Standard Report
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                              {countVal} Exporters Vetted
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-950 mt-4 leading-snug line-clamp-2 hover:text-teal-655 transition-colors">
                            <Link href={`/reports/${report.slug}`}>{report.title}</Link>
                          </h3>
                          
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                            {report.description || "Aggregated category overview mapping manufacturing hubs, corporate sizes, website domains, and compliance checklists."}
                          </p>

                          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-slate-600 font-medium">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                              <span className="truncate">{factoryText}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                              <span>Corporate USCCs</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                              <span className="truncate">Website Domains</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                              <span className="truncate">Regional Density</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PDF Guide Price</span>
                          <span className="text-xl font-extrabold text-slate-900">{formatUsd(report.priceUsdCents)}</span>
                        </div>
                        
                        <a
                          href={`/api/reports/${report.id}/checkout`}
                          className="inline-flex w-full h-10 items-center justify-center rounded-xl bg-brand !text-white hover:bg-brand-strong text-xs font-bold transition shadow-sm hover:shadow"
                        >
                          Get Sourcing Guide
                        </a>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center max-w-xl mx-auto my-10">
          <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-500 flex items-center justify-center rounded-xl mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No matching reports found</h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            We couldn't find any report matching "{searchTerm}". Try checking your spelling or selecting another category filter.
          </p>
        </div>
      )}
    </div>
  );
}
