import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { requireAppUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { Link2, Building2, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ScreeningsPage() {
  const user = await requireAppUser();
  const screenings = await prisma.supplierAnalysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Supplier Screenings</h1>
        <p className="mt-1.5 text-sm text-slate-650">
          History of Chinese manufacturers and standalone vendor domains you have analyzed.
        </p>
      </div>

      <div className="grid gap-4">
        {screenings.length ? (
          screenings.map((record) => {
            const isAlibaba = record.sourceType === "ALIBABA_STORE";
            return (
              <Card key={record.id} className="hover:border-teal-200 transition-colors">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isAlibaba ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-teal-700"}`}>
                      {isAlibaba ? <Building2 className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                        {record.companyName || "Audited Chinese Supplier"}
                      </h3>
                      <div className="text-xs text-slate-500 truncate max-w-lg flex items-center gap-1">
                        <span className="font-semibold text-slate-600">Source:</span>
                        <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5">
                          {record.normalizedUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Audited on: {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                    <ButtonLink href={`/supplier-check/${record.id}`} variant="outline" className="text-xs font-semibold py-2 px-3 shadow-2xs">
                      View Report
                    </ButtonLink>
                    <ButtonLink 
                      href={`/api/manual-review/checkout?package=DECISION_SINGLE&analysisId=${record.id}&supplierUrl=${encodeURIComponent(record.normalizedUrl)}`} 
                      variant="teal" 
                      className="text-xs font-bold py-2 px-3.5 shadow-sm"
                    >
                      Upgrade Review
                    </ButtonLink>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-950">No screening history</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Start scanning Alibaba stores or manufacturing domains to build your supplier database screening history.
                </p>
              </div>
              <ButtonLink href="/supplier-check" variant="teal" className="text-xs font-bold py-2.5 px-4 shadow-sm">
                Run a Free Supplier Scan
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </ButtonLink>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
