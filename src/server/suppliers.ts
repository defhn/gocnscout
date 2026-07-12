import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export type SupplierSearchParams = {
  q?: string;
  industry?: string;
  province?: string;
  city?: string;
  companyType?: string;
  companySize?: string;
  companyNature?: string;
  foundedYear?: string;
  registeredCapital?: string;
  tradeMode?: string;
  page?: number;
  pageSize?: number;
};

export function supplierPublicSelect() {
  return {
    id: true,
    slug: true,
    industryName: true,
    industrySlug: true,
    exhibitorName: true,
    province: true,
    city: true,
    websiteUrl: true,
    productsText: true,
    keywordsText: true,
    foundedYear: true,
    registeredCapital: true,
    companySize: true,
    companyType: true,
    tradeModes: true,
    exhibitorHistory: true,
    exhibitionSessionCount: true,
    companyNature: true,
    updatedAt: true,
  } satisfies Prisma.SupplierSelect;
}

/** 数据库页面专用 select，额外包含 signals 关联（用于权限判断后展示） */
export function supplierDatabaseSelect() {
  return {
    id: true,
    slug: true,
    industryName: true,
    exhibitorName: true,
    province: true,
    city: true,
    websiteUrl: true,
    productsText: true,
    keywordsText: true,
    foundedYear: true,
    registeredCapital: true,
    companySize: true,
    companyType: true,
    tradeModes: true,
    exhibitionSessionCount: true,
    companyNature: true,
    updatedAt: true,
    signals: {
      select: {
        innovationAward: true,
        brandExhibitor: true,
        customsCertifiedExhibitor: true,
        highTechEnterprise: true,
        hasAnyAward: true,
        hasCertificationSignal: true,
      },
    },
  } satisfies Prisma.SupplierSelect;
}

export function buildSupplierWhere(params: SupplierSearchParams): Prisma.SupplierWhereInput {
  const and: Prisma.SupplierWhereInput[] = [{ isPublished: true }];
  const q = params.q?.trim();

  if (q) {
    and.push({
      OR: [
        { exhibitorName: { contains: q, mode: "insensitive" } },
        { industryName: { contains: q, mode: "insensitive" } },
        { productsText: { contains: q, mode: "insensitive" } },
        { keywordsText: { contains: q, mode: "insensitive" } },
        { province: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (params.industry) and.push({ industryName: params.industry });
  if (params.province) and.push({ province: params.province });
  if (params.city) and.push({ city: params.city });
  if (params.companyType) and.push({ companyType: params.companyType });
  if (params.companySize) and.push({ companySize: params.companySize });
  if (params.companyNature) and.push({ companyNature: params.companyNature });
  if (params.foundedYear) {
    const year = Number(params.foundedYear);
    if (Number.isInteger(year)) and.push({ foundedYear: year });
  }
  if (params.registeredCapital) and.push({ registeredCapital: params.registeredCapital });
  if (params.tradeMode) and.push({ tradeModes: { has: params.tradeMode } });

  return { AND: and };
}

export async function searchSuppliers(params: SupplierSearchParams) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(Math.max(1, params.pageSize || 20), 100);
  const where = buildSupplierWhere(params);

  const [total, suppliers] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      select: supplierPublicSelect(),
      orderBy: [{ exhibitorName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    suppliers,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** 数据库页面专用搜索（含 signals 关联），需要登录才能调用 */
export async function searchSuppliersForDatabase(params: SupplierSearchParams) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(Math.max(1, params.pageSize || 20), 100);
  const where = buildSupplierWhere(params);

  const [total, suppliers] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      select: supplierDatabaseSelect(),
      orderBy: [{ exhibitorName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    suppliers,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getSupplierBySlug(slug: string) {
  return prisma.supplier.findFirst({
    where: { slug, isPublished: true },
    select: supplierPublicSelect(),
  });
}

type FacetCount = { _count: { _all: number } };
type DatabaseFacets = {
  industries: Array<{ industryName: string } & FacetCount>;
  provinces: Array<{ province: string | null } & FacetCount>;
  cities: Array<{ city: string | null } & FacetCount>;
  companyTypes: Array<{ companyType: string | null } & FacetCount>;
  companySizes: Array<{ companySize: string | null } & FacetCount>;
  companyNatures: Array<{ companyNature: string | null } & FacetCount>;
  foundedYears: Array<{ foundedYear: number | null } & FacetCount>;
  registeredCapitals: Array<{ registeredCapital: string | null } & FacetCount>;
  tradeModes: Array<{ label: string; count: number }>;
  websiteCount: number;
};

let cachedFacets: DatabaseFacets | null = null;
let cachedFacetsExpiry = 0;

export async function getDatabaseFacets() {
  const now = Date.now();
  if (cachedFacets && now < cachedFacetsExpiry) {
    return cachedFacets;
  }

  const [industries, provinces, cities, companyTypes, companySizes, companyNatures, foundedYears, registeredCapitals, tradeModes, websiteCount] = await Promise.all([
    prisma.supplier.groupBy({
      by: ["industryName"],
      where: { isPublished: true },
      _count: { _all: true },
      orderBy: { _count: { industryName: "desc" } },
      take: 50,
    }),
    prisma.supplier.groupBy({
      by: ["province"],
      where: { isPublished: true, province: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { province: "desc" } },
      take: 40,
    }),
    prisma.supplier.groupBy({
      by: ["city"],
      where: { isPublished: true, city: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 40,
    }),
    prisma.supplier.groupBy({
      by: ["companyType"],
      where: { isPublished: true, companyType: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { companyType: "desc" } },
      take: 20,
    }),
    prisma.supplier.groupBy({
      by: ["companySize"],
      where: { isPublished: true, companySize: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { companySize: "desc" } },
      take: 20,
    }),
    prisma.supplier.groupBy({
      by: ["companyNature"],
      where: { isPublished: true, companyNature: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { companyNature: "desc" } },
      take: 20,
    }),
    prisma.supplier.groupBy({
      by: ["foundedYear"],
      where: { isPublished: true, foundedYear: { not: null } },
      _count: { _all: true },
      orderBy: { foundedYear: "desc" },
      take: 20,
    }),
    prisma.supplier.groupBy({
      by: ["registeredCapital"],
      where: { isPublished: true, registeredCapital: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { registeredCapital: "desc" } },
      take: 20,
    }),
    prisma.supplier.findMany({
      where: { isPublished: true, NOT: { tradeModes: { isEmpty: true } } },
      select: { tradeModes: true },
      take: 1000,
    }),
    prisma.supplier.count({ where: { isPublished: true, websiteUrl: { not: null } } }),
  ]);

  const tradeModeCounts = new Map<string, number>();
  for (const supplier of tradeModes) {
    for (const mode of supplier.tradeModes) {
      if (!mode.trim()) continue;
      tradeModeCounts.set(mode, (tradeModeCounts.get(mode) || 0) + 1);
    }
  }

  const result = {
    industries,
    provinces,
    cities,
    companyTypes,
    companySizes,
    companyNatures,
    foundedYears,
    registeredCapitals,
    tradeModes: [...tradeModeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([label, count]) => ({ label, count })),
    websiteCount,
  };

  cachedFacets = result;
  cachedFacetsExpiry = now + 1000 * 60 * 10; // Cache for 10 minutes
  return result;
}

export async function getHomeStats() {
  const [supplierCount, industryCount] = await Promise.all([
    prisma.supplier.count({ where: { isPublished: true } }),
    prisma.supplier.groupBy({ by: ["industryName"], where: { isPublished: true } }),
  ]);

  return {
    supplierCount,
    industryCount: industryCount.length,
    provinceCount: 34,
    reportsCount: industryCount.length * 4,
  };
}

export async function listIndustryPages(limit = 200) {
  const pages = await prisma.industryPage.findMany({
    orderBy: [{ supplierCount: "desc" }, { industryName: "asc" }],
    take: limit,
  });

  if (pages.length) return pages;

  const groups = await prisma.supplier.groupBy({
    by: ["industryName"],
    where: { isPublished: true },
    _count: { _all: true },
    orderBy: { _count: { industryName: "desc" } },
    take: limit,
  });

  return groups.map((group) => ({
    id: group.industryName,
    slug: slugify(group.industryName),
    industryName: group.industryName,
    title: `${group.industryName} suppliers`,
    metaDescription: `Research public ${group.industryName} supplier profiles in the gocnscout database.`,
    intro: null,
    supplierCount: group._count._all,
    isIndexable: group._count._all >= 30,
    lastSyncedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function listProductPages(limit = 200) {
  return prisma.productKeywordPage.findMany({
    orderBy: [{ supplierCount: "desc" }, { keyword: "asc" }],
    take: limit,
  });
}

export async function listCityPages(limit = 200) {
  const pages = await prisma.cityPage.findMany({
    orderBy: [{ supplierCount: "desc" }, { province: "asc" }, { city: "asc" }],
    take: limit,
  });

  if (pages.length) return pages;

  const groups = await prisma.supplier.groupBy({
    by: ["province", "city"],
    where: { isPublished: true, city: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { city: "desc" } },
    take: limit,
  });

  return groups.map((group) => ({
    id: `${group.province || ""}-${group.city || ""}`,
    slug: slugify([group.city, group.province].filter(Boolean).join("-")),
    province: group.province || "",
    city: group.city || "",
    title: `${group.city} suppliers`,
    metaDescription: `Research public supplier profiles in ${group.city}${group.province ? `, ${group.province}` : ""}.`,
    supplierCount: group._count._all,
    isIndexable: group._count._all >= 30,
    lastSyncedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function getIndustryPage(slug: string) {
  const industry = await prisma.industryPage.findUnique({ where: { slug } });
  if (!industry) return null;

  const [
    suppliers,
    hasWebsiteCount,
    hasCapitalCount,
    stableExhibitorCount,
    topCitiesGroup
  ] = await Promise.all([
    searchSuppliers({ industry: industry.industryName, pageSize: 30 }),
    // 信号 1: 拥有官网的商户数量
    prisma.supplier.count({
      where: { isPublished: true, industryName: industry.industryName, websiteUrl: { not: null } }
    }),
    // 信号 2: 拥有注册资本商户数量
    prisma.supplier.count({
      where: { isPublished: true, industryName: industry.industryName, registeredCapital: { not: null } }
    }),
    // 信号 3: 参展届数 >= 3 届的稳定展商数量
    prisma.supplier.count({
      where: { isPublished: true, industryName: industry.industryName, exhibitionSessionCount: { gte: 3 } }
    }),
    // 行业主要生产城市（Top 6）
    prisma.supplier.groupBy({
      by: ["province", "city"],
      where: { isPublished: true, industryName: industry.industryName, city: { not: null }, province: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6
    })
  ]);

  // 反查这 6 个城市在 CityPage 中对应的 Slug
  const cityPages = topCitiesGroup.length > 0 ? await prisma.cityPage.findMany({
    where: {
      city: { in: topCitiesGroup.map(g => g.city as string) },
      province: { in: topCitiesGroup.map(g => g.province as string) }
    },
    select: { city: true, slug: true, cityEn: true }
  }) : [];

  const topCities = topCitiesGroup.map(g => {
    const matched = cityPages.find(cp => cp.city === g.city);
    return {
      city: g.city as string,
      province: g.province as string,
      cityEn: matched?.cityEn || (g.city as string),
      slug: matched?.slug || null,
      supplierCount: g._count.id
    };
  });

  return {
    industry,
    suppliers,
    hasWebsiteCount,
    hasCapitalCount,
    stableExhibitorCount,
    topCities
  };
}

export async function getCityPage(slug: string) {
  const city = await prisma.cityPage.findUnique({ where: { slug } });
  if (!city) return null;

  const [
    suppliers,
    industryGroups,
    companyTypeGroups,
    relatedCities,
    hasWebsiteCount,
    hasCapitalCount,
    stableExhibitorCount
  ] = await Promise.all([
    searchSuppliers({ province: city.province, city: city.city, pageSize: 30 }),
    // 该城市的行业分布（前6大行业）
    prisma.supplier.groupBy({
      by: ["industryName", "industryNameCn", "industrySlug"],
      where: { isPublished: true, city: city.city, province: city.province },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
    // 企业类型分布
    prisma.supplier.groupBy({
      by: ["companyTypeEn"],
      where: { isPublished: true, city: city.city, province: city.province, companyTypeEn: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    // 同省份的其他城市（按商户数量排序，取前5）
    prisma.cityPage.findMany({
      where: { province: city.province, city: { not: city.city }, supplierCount: { gte: 30 } },
      orderBy: { supplierCount: "desc" },
      take: 5,
      select: { slug: true, city: true, cityEn: true, supplierCount: true },
    }),
    // 信号 1: 拥有官网的商户数量
    prisma.supplier.count({
      where: { isPublished: true, city: city.city, province: city.province, websiteUrl: { not: null } }
    }),
    // 信号 2: 拥有注册资本商户数量
    prisma.supplier.count({
      where: { isPublished: true, city: city.city, province: city.province, registeredCapital: { not: null } }
    }),
    // 信号 3: 参展届数 >= 3 届的稳定展商数量
    prisma.supplier.count({
      where: { isPublished: true, city: city.city, province: city.province, exhibitionSessionCount: { gte: 3 } }
    })
  ]);

  return {
    city,
    suppliers,
    industryGroups,
    companyTypeGroups,
    relatedCities,
    hasWebsiteCount,
    hasCapitalCount,
    stableExhibitorCount
  };
}

export async function getProductPage(slug: string) {
  const product = await prisma.productKeywordPage.findUnique({ where: { slug } });
  if (!product) return null;
  const suppliers = await searchSuppliers({ q: product.keyword, pageSize: 12 });
  return { product, suppliers };
}

export function createSupplierSlug(name: string, city?: string | null) {
  return slugify([name, city].filter(Boolean).join(" "));
}
