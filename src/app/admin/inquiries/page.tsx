import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">咨询表单</h1>
      <p className="mt-2 text-sm text-slate-600">Data License 和其他咨询提交后会进入这里。</p>
      <div className="mt-6 grid gap-3">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{inquiry.name} · {inquiry.email}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{inquiry.type} · {inquiry.status}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{inquiry.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
