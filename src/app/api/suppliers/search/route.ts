import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { clampSearchPage, resolveSearchPageSize } from "@/server/quota";
import { searchSuppliersCached } from "@/server/suppliers";

const MAX_PARAM_LENGTH = 120;

function readParam(url: URL, name: string) {
  const value = url.searchParams.get(name)?.trim();
  return value ? value.slice(0, MAX_PARAM_LENGTH) : undefined;
}

export async function GET(request: Request) {
  const limit = rateLimit(`supplier-search:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const url = new URL(request.url);
  // searchSuppliers 只返回 supplierPublicSelect 中的公开字段,不含联系人/电话/邮箱等私密字段。
  const results = await searchSuppliersCached({
    q: readParam(url, "q"),
    industry: readParam(url, "industry"),
    province: readParam(url, "province"),
    city: readParam(url, "city"),
    companyType: readParam(url, "companyType"),
    companySize: readParam(url, "companySize"),
    companyNature: readParam(url, "companyNature"),
    foundedYear: readParam(url, "foundedYear"),
    registeredCapital: readParam(url, "registeredCapital"),
    tradeMode: readParam(url, "tradeMode"),
    page: clampSearchPage(Number(url.searchParams.get("page") || 1)),
    pageSize: resolveSearchPageSize(Number(url.searchParams.get("pageSize") || 20)),
  });
  return NextResponse.json(results);
}
