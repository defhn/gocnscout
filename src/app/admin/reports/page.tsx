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
            <Input name="type" placeholder="报告类型 (默认为 FULL)" defaultValue="FULL" required />
            <Input name="priceUsdCents" placeholder="价格 cents (例如 9900 表示 $99)" required />
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
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">{report.title}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-normal text-slate-600">
                    <span>状态: <strong>{report.status}</strong></span>
                    <span>•</span>
                    <span>类型: {report.type}</span>
                    <span>•</span>
                    <span>价格: ${report.priceUsdCents / 100}</span>
                    {report.fileName && (
                      <>
                        <span>•</span>
                        <span>文件名: <code className="bg-slate-100 px-1 rounded">{report.fileName}</code></span>
                      </>
                    )}
                    {report.fileSizeBytes && (
                      <>
                        <span>•</span>
                        <span>大小: {(report.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {report.status === "DRAFT" && (
                    <form action={`/api/admin/reports/${report.id}/publish`} method="post">
                      <Button type="submit" variant="outline" className="h-8 px-3 text-xs">发布到前台</Button>
                    </form>
                  )}
                  {report.status === "PUBLISHED" && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">已上线</span>
                  )}
                </div>
              </div>

              {/* PDF Replacement Form */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <form action={`/api/admin/reports/${report.id}/replace`} method="post" encType="multipart/form-data" className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-lg">
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap">替换PDF文件:</span>
                  <Input name="file" type="file" accept="application/pdf" required className="h-8 text-xs bg-slate-50 file:border-0 file:bg-slate-200 file:text-xs file:font-semibold hover:file:bg-slate-350 cursor-pointer" />
                  <Button type="submit" variant="secondary" className="h-8 px-3 text-xs shrink-0">上传并更新</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
