import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">审计日志</h1>
      <p className="mt-2 text-sm text-slate-600">记录后台关键操作。</p>
      <div className="mt-6 grid gap-3">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{log.action}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{log.entity || "系统"} · {log.createdAt.toISOString()}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
