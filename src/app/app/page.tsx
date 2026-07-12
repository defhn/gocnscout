import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlan } from "@/config/plans";
import { requireAppUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { monthKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAppUser();
  const plan = getPlan(user.planCode);
  const [savedLists, exports, reports, usage, screenings] = await Promise.all([
    prisma.savedList.count({ where: { userId: user.id } }),
    prisma.exportJob.count({ where: { userId: user.id } }),
    prisma.reportPurchase.count({ where: { userId: user.id, status: { in: ["PAID", "FULFILLED"] } } }),
    prisma.usageCounter.findMany({ where: { userId: user.id, periodKey: monthKey() } }),
    prisma.supplierAnalysis.count({ where: { userId: user.id } }),
  ]);

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">Overview</h1>
      <p className="mt-2 text-sm text-slate-600">Your current plan is {plan.name}. Usage resets monthly.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Metric title="Export quota" value={`${usage.find((u) => u.kind === "export_rows")?.used || 0}/${plan.exportRowsPerMonth}`} />
        <Metric title="Profile views" value={`${usage.find((u) => u.kind === "profile_view")?.used || 0}/${plan.profileViewsPerMonth}`} />
        <Metric title="Saved lists" value={String(savedLists)} />
        <Metric title="Reports owned" value={String(reports)} />
        <Metric title="Screened suppliers" value={String(screenings)} />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent export jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-sm font-semibold text-slate-950">Export history</h2>
          <p className="mt-2 text-sm text-slate-600">{exports ? `${exports} export jobs created.` : "No export jobs yet."}</p>
          <h3 className="mt-4 text-sm font-semibold text-slate-950">Data policy</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Exports include public supplier fields only and exclude personal contact fields.</p>
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <h2 className="text-sm font-medium text-slate-500">{title}</h2>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  );
}
