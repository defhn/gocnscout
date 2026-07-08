import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { updatedAt: "desc" }, take: 50 });
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">供应商管理</h1>
      <p className="mt-2 text-sm text-slate-600">这里显示最近 50 条供应商公开记录。私人字段只允许后台内部排查，不对外展示。</p>
      <div className="mt-6 grid gap-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{supplier.exhibitorName}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{supplier.industryName} · {supplier.city || "城市未填"}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
