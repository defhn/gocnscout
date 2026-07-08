import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">用户订阅</h1>
      <p className="mt-2 text-sm text-slate-600">查看用户套餐、Stripe Customer ID 和订阅状态。</p>
      <div className="mt-6 grid gap-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{user.email}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{user.planCode} · {user.subscriptionStatus}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
