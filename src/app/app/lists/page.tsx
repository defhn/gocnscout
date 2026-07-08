import { Card, CardContent } from "@/components/ui/card";
import { requireAppUser } from "@/server/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const user = await requireAppUser();
  const lists = await prisma.savedList.findMany({
    where: { userId: user.id },
    include: { _count: { select: { suppliers: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">Saved lists</h1>
      <p className="mt-2 text-sm text-slate-600">Organize suppliers into private research lists.</p>
      <div className="mt-6 grid gap-4">
        {lists.length ? lists.map((list) => (
          <Card key={list.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{list.name}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{list._count.suppliers} suppliers</h3>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">No saved lists yet</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">Create lists from supplier actions after importing data.</h3>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
