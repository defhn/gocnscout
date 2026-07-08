import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAppUser } from "@/server/auth";
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

export async function POST(request: Request) {
  const user = await requireAppUser();
  const body = await request.json();
  const parsed = schema.parse(body);
  const { requestedCount, ...filters } = parsed;
  const job = await createSupplierExport(user.id, user.planCode, filters, requestedCount);
  return NextResponse.json(job);
}
