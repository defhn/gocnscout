import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

let prisma: any;

async function main() {
  console.log("Starting DeepSeek AI Industries Description Generator...");
  const dbModule = await import("../src/lib/db");
  prisma = dbModule.prisma;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("Error: DEEPSEEK_API_KEY environment variable not found.");
    process.exit(1);
  }

  // 查出所有允许收录的行业页面
  const industries = await prisma.industryPage.findMany({
    where: { isIndexable: true },
    orderBy: { supplierCount: "desc" }
  });

  console.log(`Found ${industries.length} indexable industries to process.`);

  let processedCount = 0;

  for (const industry of industries) {
    processedCount++;
    console.log(`\n[${processedCount}/${industries.length}] Processing ${industry.industryName} (Exporters: ${industry.supplierCount})...`);

    // 断点续传：若已经生成过高质量的 intro 介绍段落，直接跳过
    if (industry.intro && industry.intro.length > 100) {
      console.log(`  -> Already generated. Skipping.`);
      continue;
    }

    // 查出在这个行业中供应厂家最多的前三大城市，作为真实数据织入 Prompt
    const topCitiesGroup = await prisma.supplier.groupBy({
      by: ["city", "province"],
      where: { isPublished: true, industryName: industry.industryName, city: { not: null }, province: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 3
    });

    const topCity1 = topCitiesGroup[0] ? `${topCitiesGroup[0].city} in ${topCitiesGroup[0].province} (${topCitiesGroup[0]._count.id} exporters)` : "None";
    const topCity2 = topCitiesGroup[1] ? `${topCitiesGroup[1].city} in ${topCitiesGroup[1].province} (${topCitiesGroup[1]._count.id} exporters)` : "None";
    const topCity3 = topCitiesGroup[2] ? `${topCitiesGroup[2].city} in ${topCitiesGroup[2].province} (${topCitiesGroup[2]._count.id} exporters)` : "None";

    const prompt = `You are a senior global B2B procurement consultant and SEO expert.
Write a professional sourcing overview and SEO meta description for the industry category: ${industry.industryName}.

Database Facts:
- Total active Chinese exporters cataloged: ${industry.supplierCount}
- Top 3 manufacturing city hubs:
  1. ${topCity1}
  2. ${topCity2}
  3. ${topCity3}

Instructions:
- Use professional, engaging B2B English.
- Seamlessly weave the exact facts and counts above into your writing. DO NOT fabricate other statistics.
- Analyze China's manufacturing cluster locations for this category, B2B cost advantages, raw material availability, shipping logistics channels, and procurement checklists for foreign buyers.
- Output MUST be a valid JSON object containing exactly two keys:
  1. "metaDescription": A concise SEO description (150-160 characters) to optimize Google click-through rates.
  2. "intro": A detailed sourcing category overview (about 250-300 words, split into 2-3 logical paragraphs using HTML <p> tags for structure) suitable for landing page display.`;

    try {
      console.log(`  Calling DeepSeek API for ${industry.industryName}...`);
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
      const intro = resJson.intro;

      if (!metaDescription || !intro) {
        throw new Error("Parsed JSON structure does not contain expected keys.");
      }

      console.log(`  Successfully generated text. Updating database...`);
      await prisma.industryPage.update({
        where: { id: industry.id },
        data: {
          metaDescription,
          intro
        }
      });
      console.log(`  Database record updated for ${industry.industryName}.`);

      // 睡眠 1.5 秒以防止超出速率限制
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error: any) {
      console.error(`  Error processing industry ${industry.industryName}:`, error.message || error);
      // 若出现错误，稍作休眠并继续，确保脚本稳定性
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\nAll indexable industries processed successfully!");
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
