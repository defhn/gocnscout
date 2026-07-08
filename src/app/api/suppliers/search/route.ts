import { NextResponse } from "next/server";
import { searchSuppliers } from "@/server/suppliers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const results = await searchSuppliers({
    q: url.searchParams.get("q") || undefined,
    industry: url.searchParams.get("industry") || undefined,
    province: url.searchParams.get("province") || undefined,
    city: url.searchParams.get("city") || undefined,
    companyType: url.searchParams.get("companyType") || undefined,
    companySize: url.searchParams.get("companySize") || undefined,
    companyNature: url.searchParams.get("companyNature") || undefined,
    foundedYear: url.searchParams.get("foundedYear") || undefined,
    registeredCapital: url.searchParams.get("registeredCapital") || undefined,
    tradeMode: url.searchParams.get("tradeMode") || undefined,
    page: Number(url.searchParams.get("page") || 1),
    pageSize: Number(url.searchParams.get("pageSize") || 20),
  });
  return NextResponse.json(results);
}
