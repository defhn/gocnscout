import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { markdownToBlogDocument, parseMarkdownFrontMatter } from "../src/lib/blog/content";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const geminiApiKey = process.env.GEMINI_API_KEY;
const serperApiKey = process.env.SERPER_API_KEY;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekBase = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const deepseekModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";

const useGemini = !!geminiApiKey;
const useSerper = !!serperApiKey;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const forceOverWrite = process.argv.includes("--force");

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const currentDateStr = `${yyyy}${mm}${dd}`;
const fileDatePrefix = `${yyyy}-${mm}-${dd}`;

async function fetchGoogleSearchContext(keyword: string): Promise<any> {
  if (!useSerper) return null;
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": serperApiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: keyword, gl: "us", hl: "en" }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return {
      organic:
        data.organic?.slice(0, 5).map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        })) || [],
      peopleAlsoAsk: data.peopleAlsoAsk?.map((item: any) => item.question) || [],
    };
  } catch {
    return null;
  }
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  if (useGemini) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error("Empty response received from Gemini API.");
    return candidateText;
  } else {
    if (!deepseekApiKey) throw new Error("No LLM API keys found.");
    const response = await fetch(`${deepseekBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: deepseekModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

function parseArticleFromPlan(content: string, index: number): any {
  const startRegex = new RegExp(`###\\s*${index}\\.\\s*(.*?)(?:\\s*\\((.*?)\\))?\\s*\\r?\\n`);
  const startMatch = content.match(startRegex);
  if (!startMatch || startMatch.index === undefined) return null;

  const startIndex = startMatch.index;
  const rawTitle = startMatch[1].trim();
  const slug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const nextRegex = new RegExp(`###\\s*${index + 1}\\.\\s*`);
  const nextMatch = content.match(nextRegex);
  const endIndex = nextMatch && nextMatch.index !== undefined ? nextMatch.index : content.length;

  const articleBlock = content.substring(startIndex, endIndex);

  const templateMatch = articleBlock.match(/Template Type\s*.*?:\s*`?(.*?)`?\s*(\r?\n|$)/i);
  const primaryMatch = articleBlock.match(/Primary Keyword\s*.*?:\s*`?(.*?)`?\s*(\r?\n|$)/i);
  const lsiMatch = articleBlock.match(/LSI Keywords\s*.*?:\s*`?(.*?)`?\s*(\r?\n|$)/i);

  const templateType = templateMatch ? templateMatch[1].trim() : "A - Deep Compliance";
  const primaryKeyword = primaryMatch ? primaryMatch[1].trim() : rawTitle.toLowerCase();
  const lsiKeywords = lsiMatch ? lsiMatch[1].trim() : "";

  const h2Regex = /H2_\d+:\s*(.*?)(?:\s*\(.*?\))?\r?\n/g;
  const h2Titles: string[] = [];
  let h2Match;
  while ((h2Match = h2Regex.exec(articleBlock)) !== null) {
    h2Titles.push(h2Match[1].trim());
  }

  const outlineStart = articleBlock.indexOf("Bilingual Outline");
  const outline = outlineStart !== -1 ? articleBlock.substring(outlineStart).trim() : articleBlock.trim();

  return { title: rawTitle, slug, templateType, primaryKeyword, lsiKeywords, outline, h2Titles };
}

async function findLocalMarkdown(slug: string): Promise<string | null> {
  const articleBase = path.resolve(__dirname, "../seo-blog/article");
  if (!fs.existsSync(articleBase)) return null;

  const subdirs = fs.readdirSync(articleBase);
  for (const dir of subdirs) {
    const fullDir = path.join(articleBase, dir);
    if (!fs.statSync(fullDir).isDirectory()) continue;
    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      if (f.includes(slug)) {
        return fs.readFileSync(path.join(fullDir, f), "utf-8");
      }
    }
  }
  return null;
}

async function generateMarkdownForArticle(parsedArticle: any, index: number, guidelines: string): Promise<string> {
  const searchContext = await fetchGoogleSearchContext(parsedArticle.primaryKeyword);
  const systemPrompt = `You are a world-class B2B sourcing and SEO content optimization expert.
Your task is to write a highly professional, engaging, and in-depth blog post in Markdown format based on guidelines, article details, and search context.
Target: Rank in Top 3 on Google for high-competition B2B keywords.

CRITICAL RULE ON MARKDOWN TABLES:
Never pad cells in Markdown tables with extra spaces. Keep raw tables extremely compact without extra padding spaces. Maximum 1 space next to pipe "|".`;

  let searchContextText = "";
  if (searchContext) {
    searchContextText = `
[REAL-TIME GOOGLE SEARCH CONTEXT]
Top organic snippets for "${parsedArticle.primaryKeyword}":
${searchContext.organic.map((o: any, i: number) => `${i + 1}. Title: ${o.title}\n   Snippet: ${o.snippet}`).join("\n\n")}
PAA Questions:
${searchContext.peopleAlsoAsk.map((q: string) => `- ${q}`).join("\n")}
`;
  }

  const userPrompt = `
Please write the blog post following these strict specifications:

[WRITING GUIDELINES]
${guidelines}

[ARTICLE METADATA]
- Title (H1): ${parsedArticle.title}
- Primary Keyword: ${parsedArticle.primaryKeyword}
- LSI Keywords: ${parsedArticle.lsiKeywords}
- Slug: ${parsedArticle.slug}
- Outline:
${parsedArticle.outline}
${searchContextText}

[GOOGLE TOP 3 CRITERIA]
1. Standard Markdown format only.
2. File MUST begin with YAML Front Matter:
---
Title: "${parsedArticle.title}"
Slug: "${parsedArticle.slug}"
Category: "Supplier Verification"
Primary_Keyword: "${parsedArticle.primaryKeyword}"
LSI_Keywords:
  - "${parsedArticle.lsiKeywords}"
Template_Type: "${parsedArticle.templateType}"
Precautions_And_Tone:
  - "禁止使用 AI 高频词: Tapestry, Testament, Furthermore, Delve, In conclusion."
  - "第一手经验: 必须融入采购失败/欺诈的真实故事背景并做脱敏标记。"
  - "全局年份锁定: 提到年份必须且只能是 2026 年。"
---

3. Author Bio block immediately below title:
**Written by**: David Chen | Founder of GoCNScout  
*10+ years helping international buyers verify Chinese suppliers and audit global supply chains.*

4. Include an Actionable Intro Checklist of 5 critical things to verify before paying.
5. Markdown Image Placeholders: Cover Image and 3 Body Section Images.
6. Year Lock 2026.
7. Include Legal Disclaimer blockquote at the end.
`;

  const rawGenerated = await callLLM(systemPrompt, userPrompt);
  let cleanMd = rawGenerated.trim();
  if (cleanMd.startsWith("```markdown")) cleanMd = cleanMd.substring(11);
  else if (cleanMd.startsWith("```")) cleanMd = cleanMd.substring(3);
  if (cleanMd.endsWith("```")) cleanMd = cleanMd.substring(0, cleanMd.length - 3);
  return cleanMd.trim();
}

async function main() {
  console.log("🚀 Starting Full Batch 50-Blog SEO Content Generation & Database Sync...");

  const guidelinesPath = path.resolve(__dirname, "../docs/seo-blog-writing-guidelines.md");
  const guidelines = fs.readFileSync(guidelinesPath, "utf-8");

  const planPath = path.resolve(__dirname, "../docs/seo-blog-plan.md");
  const planContent = fs.readFileSync(planPath, "utf-8");

  const outputDir = path.resolve(__dirname, `../seo-blog/article/${currentDateStr}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 1; i <= 50; i++) {
    const parsedArticle = parseArticleFromPlan(planContent, i);
    if (!parsedArticle) {
      console.log(`⚠️ [Skip] Could not parse Article ${i} from plan.`);
      continue;
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`📌 Processing Article ${i}/50: "${parsedArticle.title}"`);
    console.log(`   Slug: ${parsedArticle.slug}`);

    try {
      const existingDbPost = await prisma.blogPost.findUnique({
        where: { slug: parsedArticle.slug },
      });

      if (existingDbPost && !forceOverWrite) {
        console.log(`✅ [SKIP DB] Article ${i} already published in DB as "${existingDbPost.slug}".`);
        skippedCount++;
        continue;
      }

      let markdownContent = await findLocalMarkdown(parsedArticle.slug);

      if (!markdownContent) {
        console.log(`🤖 [Generating] Calling LLM API for Article ${i}...`);
        markdownContent = await generateMarkdownForArticle(parsedArticle, i, guidelines);
        const fileName = `${fileDatePrefix}-${String(i).padStart(2, "0")}-${parsedArticle.slug}.md`;
        fs.writeFileSync(path.join(outputDir, fileName), markdownContent, "utf-8");
        console.log(`💾 Saved Markdown file: ${fileName}`);
      } else {
        console.log(`📂 [Found Local Markdown] Using existing Markdown for Article ${i}.`);
      }

      const { metadata, body } = parseMarkdownFrontMatter(markdownContent);
      const blogDoc = markdownToBlogDocument(body);

      const titleStr = String(metadata.Title || metadata.title || parsedArticle.title);
      const categoryStr = String(metadata.Category || metadata.category || "Supplier Verification");

      // Extract a short excerpt (first paragraph)
      const excerptStr = body
        .replace(/^#+.*$/gm, "")
        .replace(/\*\*.*?\*\*/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .trim()
        .slice(0, 260) + "...";

      await prisma.blogPost.upsert({
        where: { slug: parsedArticle.slug },
        update: {
          title: titleStr,
          excerpt: excerptStr,
          content: blogDoc as any,
          category: categoryStr,
          status: "PUBLISHED",
          authorName: "David Chen | Founder of GoCNScout",
          coverImage: `/images/${parsedArticle.slug}-cover.png`,
          sourceFileName: `${fileDatePrefix}-${String(i).padStart(2, "0")}-${parsedArticle.slug}.md`,
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          slug: parsedArticle.slug,
          title: titleStr,
          excerpt: excerptStr,
          content: blogDoc as any,
          category: categoryStr,
          status: "PUBLISHED",
          authorName: "David Chen | Founder of GoCNScout",
          coverImage: `/images/${parsedArticle.slug}-cover.png`,
          sourceFileName: `${fileDatePrefix}-${String(i).padStart(2, "0")}-${parsedArticle.slug}.md`,
          publishedAt: new Date(),
        },
      });

      console.log(`🎉 [PUBLISHED TO DB] Article ${i} (${parsedArticle.slug}) live on site!`);
      successCount++;
    } catch (err: any) {
      console.error(`❌ [ERROR] Failed on Article ${i}: ${err?.message || err}`);
      failedCount++;
    }
  }

  console.log(`\n==================================================`);
  console.log(`🏁 Full Batch Complete! Summary:`);
  console.log(`- Total Processed: 50`);
  console.log(`- Newly Published: ${successCount}`);
  console.log(`- Already Existed: ${skippedCount}`);
  console.log(`- Failed: ${failedCount}`);
  console.log(`==================================================`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
