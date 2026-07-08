import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireAppUser } from "@/server/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AppReportsPage() {
  const user = await requireAppUser();
  const purchases = await prisma.reportPurchase.findMany({
    where: { userId: user.id, status: { in: ["PAID", "FULFILLED"] } },
    include: { report: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">Report downloads</h1>
      <p className="mt-2 text-sm text-slate-600">Purchased and included reports appear here after publication.</p>
      <div className="mt-6 grid gap-4">
        {purchases.length ? purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{purchase.report.title}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{purchase.status}</h3>
              <ButtonLink href={`/api/reports/${purchase.reportId}/download`} className="mt-4">Download PDF</ButtonLink>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">No report downloads yet</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">Buy reports from the public reports page or use included plan downloads.</h3>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
