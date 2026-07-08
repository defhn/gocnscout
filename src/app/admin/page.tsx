import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [suppliers, reports, imports, inquiries, users] = await Promise.all([
    prisma.supplier.count(),
    prisma.report.count(),
    prisma.importJob.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.user.count(),
  ]);

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">管理后台概览</h1>
      <p className="mt-2 text-sm text-slate-600">这里管理数据、报告、咨询和用户订阅状态。</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric title="供应商" value={suppliers} />
        <Metric title="报告" value={reports} />
        <Metric title="导入任务" value={imports} />
        <Metric title="新咨询" value={inquiries} />
        <Metric title="用户" value={users} />
      </div>
    </section>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <h2 className="text-sm font-medium text-slate-500">{title}</h2>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">{value.toLocaleString("en-US")}</h3>
      </CardContent>
    </Card>
  );
}
