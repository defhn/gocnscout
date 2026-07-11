import { prisma } from "../src/lib/db";

async function run() {
  const staticRoutes = [
    "https://gocnscout.com/",
    "https://gocnscout.com/database",
    "https://gocnscout.com/pricing",
    "https://gocnscout.com/about",
    "https://gocnscout.com/contact",
    "https://gocnscout.com/methodology",
    "https://gocnscout.com/china-exporter-database",
    "https://gocnscout.com/exhibitor-intelligence-report",
    "https://gocnscout.com/blog"
  ];

  const blogSlugs = [
    "how-to-verify-a-chinese-supplier-complete-due-diligence-guide-for-importers",
    "step-by-step-guide-how-to-verify-a-china-business-license-online",
    "how-to-avoid-china-sourcing-scams-10-red-flags-every-buyer-must-know",
    "is-your-chinese-supplier-legitimate-how-to-match-corporate-names-bank-details",
    "how-to-check-the-chinese-supplier-blacklist-and-exporter-licenses"
  ];
  const blogRoutes = blogSlugs.map(slug => `https://gocnscout.com/blog/${slug}`);

  // Fetch data directly from Supplier table since Page tables are unpopulated in dev
  const [suppliers, rawCities, rawIndustries] = await Promise.all([
    prisma.supplier.findMany({ where: { isPublished: true }, select: { slug: true }, take: 10 }).catch(() => []),
    prisma.supplier.groupBy({
      by: ["cityEn", "city"],
      where: { isPublished: true, city: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10
    }).catch(() => []),
    prisma.supplier.groupBy({
      by: ["industrySlug", "industryNameEn"],
      where: { isPublished: true, industrySlug: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10
    }).catch(() => [])
  ]);

  const slugify = (value: string) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const supplierRoutes = suppliers.map((item: any) => `https://gocnscout.com/suppliers/${item.slug}`);
  const cityRoutes = rawCities.map((item: any) => `https://gocnscout.com/cities/${slugify(item.cityEn || item.city)}`);
  const industryRoutes = rawIndustries.map((item: any) => `https://gocnscout.com/industries/${item.industrySlug}`);

  const allUrls = [
    ...staticRoutes,
    ...blogRoutes,
    ...industryRoutes,
    ...cityRoutes,
    ...supplierRoutes
  ];

  console.log("=== SEPARATOR ===");
  allUrls.slice(0, 30).forEach(url => console.log(url));
  console.log("=== END ===");
}

run().catch(console.error);
