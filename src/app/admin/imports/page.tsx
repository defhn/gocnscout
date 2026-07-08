import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminImportsPage() {
  const jobs = await prisma.importJob.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">导入任务</h1>
      <p className="mt-2 text-sm text-slate-600">公司数据会在完整开发、检测完成后再清洗并插入。</p>
      <div className="mt-6 grid gap-3">
        {jobs.length ? jobs.map((job) => (
          <Card key={job.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{job.fileName}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{job.status} · {job.processedRows}/{job.totalRows}</h3>
            </CardContent>
          </Card>
        )) : (
          <Card><CardContent><h2 className="text-base font-semibold text-slate-950">暂无导入任务</h2><h3 className="mt-2 text-sm font-normal text-slate-600">后续清洗 Excel 后再导入。</h3></CardContent></Card>
        )}
      </div>
    </section>
  );
}
