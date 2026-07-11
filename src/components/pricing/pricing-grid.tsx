"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlanDefinition } from "@/config/plans";
import { formatUsd } from "@/lib/utils";

type PricingGridProps = {
  plans: PlanDefinition[];
};

export function PricingGrid({ plans }: PricingGridProps) {
  const [billingPeriod, setBillingPeriod] = useState<"MONTH" | "YEAR">("MONTH");
  const isAnnual = billingPeriod === "YEAR";

  return (
    <div className="space-y-10">
      {/* Billing Period Switcher Toggle Tab */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setBillingPeriod("MONTH")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
              billingPeriod === "MONTH"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod("YEAR")}
            className={`relative rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              billingPeriod === "YEAR"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[9px] font-extrabold text-teal-600 uppercase tracking-wide">
              Save up to 40%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        {plans.map((plan) => {
          const isPro = plan.code === "PRO";
          const btnVariant = isPro ? "teal" : plan.code === "FREE" ? "outline" : "dark";
          
          // Calculate price details dynamically from database config
          let mainPrice = plan.monthlyUsdCents;
          let subNote = "/mo";
          let savingBadge = "";
          let annualBilledNote = "";

          if (plan.code !== "FREE" && plan.yearlyUsdCents) {
            if (isAnnual) {
              const monthlyEquivalent = Math.floor(plan.yearlyUsdCents / 12);
              mainPrice = monthlyEquivalent;
              subNote = "/mo";
              annualBilledNote = `Billed annually (${formatUsd(plan.yearlyUsdCents)}/yr)`;
              
              if (plan.code === "STARTER") savingBadge = "Save 20%";
              if (plan.code === "PRO") savingBadge = "Save 30%";
              if (plan.code === "TEAM") savingBadge = "Save 40%";
            } else {
              annualBilledNote = `${formatUsd(plan.yearlyUsdCents)}/year billed annually`;
            }
          } else if (plan.code === "FREE") {
            annualBilledNote = "No credit card required";
          }

          return (
            <Card
              key={plan.code}
              className={`flex flex-col h-full rounded-2xl transition-all duration-300 ${
                isPro
                  ? "border-teal-500 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-xl scale-[1.03] relative border-2 hover:shadow-teal-500/10"
                  : "border-slate-200 bg-white hover:-translate-y-1 hover:shadow-md"
              }`}
            >
              {isPro && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center space-x-1 rounded-full bg-teal-500 px-3 py-1 text-xs font-bold text-slate-950 uppercase tracking-wider shadow">
                  <Sparkles className="h-3 w-3" />
                  <span>Best Sourcing Value</span>
                </span>
              )}

              <CardHeader className="p-6 pb-4">
                <div className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${isPro ? "text-teal-400" : "text-teal-600"}`}>
                  <span>{plan.name}</span>
                  {savingBadge && (
                    <span className="rounded bg-teal-500/15 text-teal-400 border border-teal-500/25 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                      {savingBadge}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {formatUsd(mainPrice)}
                  </span>
                  <span className={`text-sm ml-1 font-semibold ${isPro ? "text-slate-400" : "text-slate-500"}`}>{subNote}</span>
                </div>
                <p className={`text-xs mt-1 font-medium ${isPro ? "text-teal-300/80" : "text-teal-600"}`}>
                  {annualBilledNote}
                </p>
              </CardHeader>

              <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                  <p className={`text-xs leading-relaxed ${isPro ? "text-slate-300" : "text-slate-600"}`}>
                    <strong>Ideal for</strong>: {bestFor(plan.code)}
                  </p>

                  <ul className="mt-5 space-y-3.5 text-xs">
                    <FeatureItem isPro={isPro}>
                      {plan.searchPages === "unlimited" ? "Unlimited search queries" : `${plan.searchPages} search pages`}
                    </FeatureItem>
                    <FeatureItem isPro={isPro}>
                      {plan.profileViewsPerMonth === "unlimited" ? "Unlimited profile views" : `${plan.profileViewsPerMonth} profile details/mo`}
                    </FeatureItem>
                    <FeatureItem isPro={isPro}>
                      {plan.exportRowsPerMonth > 0 ? `${plan.exportRowsPerMonth.toLocaleString("en-US")} CSV rows/mo` : "No CSV data exports"}
                    </FeatureItem>
                    <FeatureItem isPro={isPro}>
                      {plan.includedReportsPerMonth > 0 ? `${plan.includedReportsPerMonth} industry report${plan.includedReportsPerMonth > 1 ? "s" : ""}/mo` : "Standalone report purchases only"}
                    </FeatureItem>
                  </ul>
                </div>

                <ButtonLink
                  href={plan.code === "FREE" ? "/database" : `/api/billing/checkout?plan=${plan.code}&interval=${billingPeriod}`}
                  className="mt-6 w-full text-xs font-bold py-2.5 rounded-xl transition-all"
                  variant={btnVariant}
                >
                  {plan.code === "FREE" ? "Explore for Free" : `Subscribe ${plan.name}`}
                </ButtonLink>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function bestFor(code: string) {
  if (code === "FREE") return "Browsing structure and SEO pages.";
  if (code === "STARTER") return "Sole importers, Amazon and Shopify e-commerce retailers, and individual buyers.";
  if (code === "PRO") return "Sourcing professionals, trade advisors, wholesale procurement teams, and category managers.";
  return "Procurement companies, import corporations, custom sourcing bureaus, and research departments.";
}

function FeatureItem({ children, isPro }: { children: React.ReactNode; isPro: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isPro ? "text-teal-400" : "text-teal-600"}`} />
      <span className={isPro ? "text-slate-300" : "text-slate-600"}>{children}</span>
    </li>
  );
}
