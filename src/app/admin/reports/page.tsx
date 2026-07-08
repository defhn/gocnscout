import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">PDF报告管理</h1>
      <p className="mt-2 text-sm text-slate-600">后台人工上传 PDF 后，会同步 R2 文件、数据库记录、前台报告页和用户下载权限。</p>
      <Card className="mt-6">
        <CardContent>
          <h2 className="text-lg font-semibold text-slate-950">上传新报告</h2>
          <h3 className="mt-2 text-sm font-normal text-slate-600">价格单位为美元分，例如 9900 表示 $99。</h3>
          <form action="/api/admin/reports" method="post" encType="multipart/form-data" className="mt-4 grid gap-3 md:grid-cols-2">
            <Input name="title" placeholder="报告标题" required />
            <Input name="slug" placeholder="URL slug" required />
            <Input name="type" placeholder="BASIC / FULL / PREMIUM / CANTON_FAIR_INTELLIGENCE" required />
            <Input name="priceUsdCents" placeholder="价格 cents" required />
            <Input name="industryName" placeholder="行业名称，可空" />
            <Textarea name="description" placeholder="报告说明，不要夸大内容" className="md:col-span-2" />
            <Input name="file" type="file" accept="application/pdf" required className="md:col-span-2" />
            <Button type="submit" className="md:w-fit">上传并保存为草稿</Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent>
              <h2 className="text-base font-semibold text-slate-950">{report.title}</h2>
              <h3 className="mt-2 text-sm font-normal text-slate-600">{report.status} · {report.type} · ${report.priceUsdCents / 100}</h3>
              <form action={`/api/admin/reports/${report.id}/publish`} method="post" className="mt-4">
                <Button type="submit" variant="outline">发布/更新前台</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
