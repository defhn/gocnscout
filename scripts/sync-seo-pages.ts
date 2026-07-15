import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

let prisma: any;

const JUNK_KEYWORDS = new Set([
  'factory', 'manufacturer', 'exporter', 'company', 'supplier', 'ltd', 'co', 'corporation',
  'limited', 'manufacturers', 'factories', 'exporters', 'suppliers', 'companies',
  'manufacturing', 'export', 'production', 'enterprise', 'enterprises', 'industry', 'industries',
  'product', 'products', 'china', 'chinese', 'canton', 'fair', 'co.', 'ltd.', 'corp', 'corp.',
  'import', 'trade', 'group', 'trading'
]);

function slugify(value: string) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "unknown";
}

async function main() {
  console.log("Starting SEO Page synchronization script in TypeScript...");
  const dbModule = await import("../src/lib/db");
  prisma = dbModule.prisma;

  console.log("Clearing existing SEO page records to prevent unique slug collisions...");
  await prisma.cityPage.deleteMany({});
  await prisma.industryPage.deleteMany({});
  await prisma.productKeywordPage.deleteMany({});

  // 1. 同步 IndustryPage
  console.log("Syncing IndustryPage...");
  const supplierIndustries = await prisma.supplier.groupBy({
    by: ['industryName', 'industryNameCn', 'industryNameEn', 'industrySlug'],
    where: { isPublished: true },
    _count: { id: true }
  });

  console.log(`Found ${supplierIndustries.length} unique consolidated industries.`);

  for (const item of supplierIndustries) {
    if (!item.industryName) continue;
    const count = item._count.id;
    const nameEn = item.industryNameEn || item.industryName;
    const nameCn = item.industryNameCn || item.industryName;
    const slug = item.industrySlug || slugify(nameEn);

    const title = `${nameEn} China Manufacturers & Exporters | China Sourcing Atlas`;
    const metaDescription = `Browse verified Chinese ${nameEn} manufacturers, export suppliers, and factory listings. Verify corporate scale, trade details, and site domains.`;

    await prisma.industryPage.upsert({
      where: { slug },
      update: {
        industryName: nameEn,
        industryNameEn: nameEn,
        industryNameCn: nameCn,
        title,
        metaDescription,
        supplierCount: count,
        isIndexable: true,
        lastSyncedAt: new Date()
      },
      create: {
        slug,
        industryName: nameEn,
        industryNameEn: nameEn,
        industryNameCn: nameCn,
        title,
        metaDescription,
        supplierCount: count,
        isIndexable: true,
        lastSyncedAt: new Date()
      }
    });
  }
  console.log("IndustryPages synced successfully.");

  // 2. 同步 CityPage
  console.log("Syncing CityPage...");
  const supplierCities = await prisma.supplier.groupBy({
    by: ['province', 'provinceCn', 'provinceEn', 'city', 'cityCn', 'cityEn'],
    where: { 
      isPublished: true, 
      city: { not: null },
      province: { not: null }
    },
    _count: { id: true }
  });

  console.log(`Found ${supplierCities.length} unique cities in database.`);

  let indexableCitiesCount = 0;
  let nonIndexableCitiesCount = 0;

  // 按照商户数量降序排列，使得大城市（如台州）优先获得简短的 Slug，较小重名城市（如泰州）自动追加省份后缀
  supplierCities.sort((a: { _count: { id: number } }, b: { _count: { id: number } }) => b._count.id - a._count.id);
  const usedCitySlugs = new Set<string>();

  for (const item of supplierCities) {
    const count = item._count.id;
    
    // 如果商家数少于 30 个，忽略该城市页面的生成，避免极薄内容的劣质页面
    if (count < 30) continue;

    const cityEn = item.cityEn || item.city;
    const provinceEn = item.provinceEn || item.province;
    if (!item.city || !item.province) continue;

    let slug = slugify(cityEn);
    if (usedCitySlugs.has(slug)) {
      slug = slugify(`${cityEn}-${provinceEn}`);
    }
    usedCitySlugs.add(slug);

    const isIndexable = true;

    if (isIndexable) indexableCitiesCount++;
    else nonIndexableCitiesCount++;

    const title = `${cityEn} Export Manufacturers & B2B Suppliers | China Sourcing Atlas`;
    const metaDescription = `Find verified factories and export manufacturers in ${cityEn}, ${provinceEn}. Inspect product keywords, company size, website status, and trade signals.`;

    await prisma.cityPage.upsert({
      where: { province_city: { province: item.province, city: item.city } },
      update: {
        slug,
        provinceCn: item.provinceCn || item.province,
        provinceEn: provinceEn,
        cityCn: item.cityCn || item.city,
        cityEn: cityEn,
        title,
        metaDescription,
        supplierCount: count,
        isIndexable,
        lastSyncedAt: new Date()
      },
      create: {
        slug,
        province: item.province,
        provinceCn: item.provinceCn || item.province,
        provinceEn: provinceEn,
        city: item.city,
        cityCn: item.cityCn || item.city,
        cityEn: cityEn,
        title,
        metaDescription,
        supplierCount: count,
        isIndexable,
        lastSyncedAt: new Date()
      }
    });
  }
  console.log(`CityPages synced. Indexable (>=100): ${indexableCitiesCount}, Noindex (30-99): ${nonIndexableCitiesCount}.`);

  // 产品关键词页面暂时跳过 - 需要人工策划高质量关键词后再单独执行
  console.log("Skipping ProductKeywordPage sync (to be done separately with curated keywords).");

  console.log("All SEO Pages synchronized successfully!");
}

main()
  .catch(err => {
    console.error("Sync error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
