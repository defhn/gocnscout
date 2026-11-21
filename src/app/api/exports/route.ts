import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/server/auth";
import { createSupplierExport } from "@/server/exports";

const schema = z.object({
  q: z.string().optional(),
  industry: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  companyType: z.string().optional(),
  companySize: z.string().optional(),
  companyNature: z.string().optional(),
  foundedYear: z.string().optional(),
  registeredCapital: z.string().optional(),
  tradeMode: z.string().optional(),
  requestedCount: z.coerce.number().int().min(1).max(8000),
});

// CSV 导出不再对普通访客开放,仅管理员可为人工服务(定制名单/数据授权)生成文件。
export async function POST(request: Request) {
  const { user } = await requireAdminUser();
  const body = await request.json();
  const parsed = schema.parse(body);
  const { requestedCount, ...filters } = parsed;
  const job = await createSupplierExport(user.id, user.planCode, filters, requestedCount);
  return NextResponse.json(job);
}
