import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

let prisma: any;

async function main() {
  console.log("Starting DeepSeek AI City Description Generator...");
  const dbModule = await import("../src/lib/db");
  prisma = dbModule.prisma;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("Error: DEEPSEEK_API_KEY environment variable not found.");
    process.exit(1);
  }

  // 查出所有允许索引的高价值城市
  const cities = await prisma.cityPage.findMany({
    where: { isIndexable: true },
    orderBy: { supplierCount: "desc" }
  });

  console.log(`Found ${cities.length} indexable cities to process.`);

  let processedCount = 0;

  for (const city of cities) {
    processedCount++;
    console.log(`\n[${processedCount}/${cities.length}] Processing ${city.cityEn || city.city} (Exporters: ${city.supplierCount})...`);

    // 如果该城市已经拥有生成的 industrialCluster 介绍文案，我们可以跳过，实现断点续传
    if (city.industrialCluster && city.industrialCluster.length > 100) {
      console.log(`  -> Already generated. Skipping.`);
      continue;
    }

    // 查询该城市的前三大行业数据，作为真实数据注入 Prompt
    const industryGroups = await prisma.supplier.groupBy({
      by: ["industryName"],
      where: { isPublished: true, city: city.city, province: city.province },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 3
    });

    const top1 = industryGroups[0] ? `${industryGroups[0].industryName} (${industryGroups[0]._count.id} suppliers)` : "None";
    const top2 = industryGroups[1] ? `${industryGroups[1].industryName} (${industryGroups[1]._count.id} suppliers)` : "None";
    const top3 = industryGroups[2] ? `${industryGroups[2].industryName} (${industryGroups[2]._count.id} suppliers)` : "None";

    const prompt = `You are a senior global B2B procurement consultant and SEO expert.
Write a professional sourcing overview and SEO meta description for the city of ${city.cityEn || city.city} (located in ${city.provinceEn || city.province} province, China).

Database Facts for ${city.cityEn || city.city}:
- Total verified B2B exporters: ${city.supplierCount}
- Top 3 manufacturing sectors:
  1. ${top1}
  2. ${top2}
  3. ${top3}

Instructions:
- Use professional, engaging B2B English.
- Seamlessly weave the exact data facts above into your writing. DO NOT fabricate other counts or statistics.
- Analyze the city's geographical manufacturing advantages, transport hubs (e.g. proximity to regional logistics channels or ports), OEM/ODM industrial cluster strengths, and vendor suitability.
- Output MUST be a valid JSON object containing exactly two keys:
  1. "metaDescription": A concise SEO description (150-160 characters) to optimize Google click-through rates.
  2. "industrialClusterText": A detailed sourcing cluster overview (about 250-300 words, split into 2-3 logical paragraphs using HTML <p> tags for structure) suitable for landing page display.`;

    try {
      console.log(`  Calling DeepSeek API for ${city.cityEn || city.city}...`);
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a helpful assistant that outputs only valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status code ${response.status}`);
      }

      const resBody = await response.json();
      const rawText = resBody.choices[0].message.content;
      
      const resJson = JSON.parse(rawText);
      const metaDescription = resJson.metaDescription;
      const industrialClusterText = resJson.industrialClusterText;

      if (!metaDescription || !industrialClusterText) {
        throw new Error("Parsed JSON structure does not contain expected keys.");
      }

      console.log(`  Successfully generated text. Updating database...`);
      await prisma.cityPage.update({
        where: { id: city.id },
        data: {
          metaDescription: metaDescription,
          industrialCluster: industrialClusterText
        }
      });
      console.log(`  Database record updated for ${city.cityEn || city.city}.`);

      // 睡眠 1.5 秒以防止速率超限
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error: any) {
      console.error(`  Error processing city ${city.cityEn || city.city}:`, error.message || error);
      // 如果出现错误，我们可以等 5 秒后继续处理下一个，以确保脚本稳定运行不中断
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\nAll indexable cities processed successfully!");
}

main()
  .catch(err => {
    console.error("Fatal generator error:", err);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
