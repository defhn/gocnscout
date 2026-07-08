import { Card, CardContent } from "@/components/ui/card";
import { requireAppUser } from "@/server/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ExportsPage() {
  const user = await requireAppUser();
  const jobs = await prisma.exportJob.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">Exports</h1>
      <p className="mt-2 text-sm text-slate-600">Download CSV files containing non-sensitive supplier fields.</p>
      <div className="mt-6 grid gap-4">
        {jobs.length ? jobs.map((job) => (
          <Card key={job.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{job.fileName || "Supplier export"}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{job.status} · {job.deliveredCount} rows</h3>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">No exports yet</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">Export jobs appear here after they are requested.</h3>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
