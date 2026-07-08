import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Connecting to database for single industry generation...");
  const { prisma } = await import("../src/lib/db");
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("Error: DEEPSEEK_API_KEY environment variable not found.");
    process.exit(1);
  }

  const slug = "household-items";
  const industry = await prisma.industryPage.findUnique({ where: { slug } });
  if (!industry) {
    console.error(`Error: Industry with slug '${slug}' not found in database.`);
    process.exit(1);
  }

  console.log(`Processing industry '${industry.industryName}' (Total Exporters: ${industry.supplierCount})...`);

  const prompt = `You are a senior global B2B procurement consultant and SEO expert.
Write a professional sourcing overview and SEO meta description for the industry category: ${industry.industryName}.

Database Facts:
- Total active Chinese exporters cataloged: ${industry.supplierCount}

Instructions:
- Use professional, engaging B2B English.
- Seamlessly weave the exact exporter count above into your writing. DO NOT fabricate other statistics.
- Analyze China's manufacturing cluster locations for this category (such as key hubs in Guangdong, Zhejiang, etc.), raw material supply chains, B2B cost parameters, and procurement advice.
- Output MUST be a valid JSON object containing exactly two keys:
  1. "metaDescription": A concise SEO description (150-160 characters) to optimize Google click-through rates.
  2. "intro": A detailed sourcing category overview (about 250-300 words, split into 2-3 logical paragraphs using HTML <p> tags for structure) suitable for landing page display.`;

  try {
    console.log("Calling DeepSeek API for Household Items...");
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

    console.log("Successfully generated AI content. Updating database...");
    await prisma.industryPage.update({
      where: { id: industry.id },
      data: {
        metaDescription,
        intro
      }
    });

    console.log("Database updated successfully for Household Items!");

  } catch (error: any) {
    console.error("Error processing industry:", error.message || error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
