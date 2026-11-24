import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DISCORD_INVITE_URL } from "@/config/community";
import { requireAppUser } from "@/server/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAppUser();
  const [savedLists, savedSuppliers, screenings] = await Promise.all([
    prisma.savedList.count({ where: { userId: user.id } }),
    prisma.savedSupplier.count({ where: { list: { userId: user.id } } }),
    prisma.supplierAnalysis.count({ where: { userId: user.id } }),
  ]);

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">Welcome{user.name ? `, ${user.name}` : ""}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your account lets you save suppliers to your shortlist across devices. Searching the company database is always free.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric title="Saved suppliers" value={String(savedSuppliers)} />
        <Metric title="Saved lists" value={String(savedLists)} />
        <Metric title="Past screenings" value={String(screenings)} />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/database"
            className="inline-flex h-9 items-center rounded-md bg-teal-600 px-4 text-sm font-semibold !text-white hover:bg-teal-700"
          >
            Search Free Company Database
          </Link>
          <Link
            href="/app/lists"
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Saved Lists
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ask on Discord (Free)
          </a>
          <Link
            href="/pricing"
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Human Verification Services
          </Link>
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
