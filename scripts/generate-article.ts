import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// API Keys from environment
const geminiApiKey = process.env.GEMINI_API_KEY;
const serperApiKey = process.env.SERPER_API_KEY;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekBase = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const deepseekModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";

// Determine which model to use (Prefer Gemini if Key exists, otherwise fallback to DeepSeek)
const useGemini = !!geminiApiKey;
const useSerper = !!serperApiKey;

// Get the article index from CLI arguments
const args = process.argv.slice(2);
const articleIndex = parseInt(args[0], 10);

if (isNaN(articleIndex) || articleIndex < 1 || articleIndex > 50) {
  console.error("\n❌ Error: Please specify a valid article index between 1 and 50.");
  console.error("Usage: npx tsx scripts/generate-article.ts <index>");
  console.error("Example: npx tsx scripts/generate-article.ts 2\n");
  process.exit(1);
}

// Setup Date variables dynamically based on current local date
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const currentDateStr = `${yyyy}${mm}${dd}`;
const fileDatePrefix = `${yyyy}-${mm}-${dd}`;

// Fetch Google Search context using Serper API
async function fetchGoogleSearchContext(keyword: string): Promise<any> {
  if (!useSerper) {
    console.log("ℹ️ [Serper Info] SERPER_API_KEY not found in .env.local. Skipping Google Search context integration.");
    return null;
  }

  console.log(`🔍 [Serper] Fetching real-time Google search data for: "${keyword}"...`);
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": serperApiKey!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: keyword,
        gl: "us",
        hl: "en"
      })
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      organic: data.organic?.slice(0, 5).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      })) || [],
      peopleAlsoAsk: data.peopleAlsoAsk?.map((item: any) => item.question) || []
    };
  } catch (error) {
    console.warn("⚠️ [Serper Warning] Google Search query failed. Proceeding without real-time search context.", error);
    return null;
  }
}

// Complete LLM completions request
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  if (useGemini) {
    console.log(`🤖 [Model] Using Google Gemini 2.5 Flash...`);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    // Structure payload for Gemini API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Empty response received from Gemini API.");
    }
    return candidateText;
  } else {
    if (!deepseekApiKey) {
      throw new Error("No LLM keys found. Please configure DEEPSEEK_API_KEY or GEMINI_API_KEY in .env.local");
    }
    console.log(`🤖 [Model] Using DeepSeek (${deepseekModel})...`);
    
    const response = await fetch(`${deepseekBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepseekApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: deepseekModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

async function main() {
  console.log("Reading SEO Writing Guidelines...");
  const guidelinesPath = path.resolve(__dirname, "../docs/seo-blog-writing-guidelines.md");
  const guidelines = fs.readFileSync(guidelinesPath, "utf-8");

  console.log("Reading Article Plan (seo-blog-plan.md)...");
  const planPath = path.resolve(__dirname, "../docs/seo-blog-plan.md");
  const planContent = fs.readFileSync(planPath, "utf-8");

  console.log(`Parsing metadata for Article ${articleIndex}...`);
  const parsedArticle = parseArticleFromPlan(planContent, articleIndex);

  if (!parsedArticle) {
    console.error(`❌ Error: Could not find or parse Article ${articleIndex} from seo-blog-plan.md`);
    process.exit(1);
  }

  // Fetch real-time Google search statistics
  const searchContext = await fetchGoogleSearchContext(parsedArticle.primaryKeyword);

  const outputDir = path.resolve(__dirname, `../seo-blog/article/${currentDateStr}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const systemPrompt = `You are a world-class B2B sourcing and SEO content optimization expert.
Your task is to write a highly professional, engaging, and in-depth blog post in Markdown format based on the provided writing guidelines, article details, and optional real-time search context.
Your target is to produce content that ranks in the Top 3 on Google for high-competition B2B keywords.

CRITICAL RULE ON MARKDOWN TABLES:
Never pad cells in Markdown tables with extra spaces to visually align columns. Keep the raw tables extremely compact without any padding spaces. Do not pad the cells to make the pipes | align visually. Output markdown tables as tightly as possible, e.g. using at most 1 space next to the "|" pipe. Excessive spaces will cause a network failure.`;

  // Inject search data context if available
  let searchContextText = "";
  if (searchContext) {
    searchContextText = `
[REAL-TIME GOOGLE SEARCH CONTEXT (SERPER API)]
We queried Google for "${parsedArticle.primaryKeyword}" and found the following top organic snippets:
${searchContext.organic.map((o: any, i: number) => `${i+1}. Title: ${o.title}\n   Snippet: ${o.snippet}\n   Link: ${o.link}`).join("\n\n")}

Top PAA (People Also Asked) Questions from Google:
${searchContext.peopleAlsoAsk.map((q: string) => `- ${q}`).join("\n")}

*INSTRUCTIONS FOR SEARCH CONTEXT*:
- Analyze the organic snippets above. Identify gaps in what competitors cover (e.g. lack of clear visual comparison tables, outdated certifications, or missing checklists) and ensure your article covers those gaps to offer superior helpfulness.
- Use the exact PAA questions listed above to construct the H3 FAQ section headers at the end of the post, answering them with high accuracy as of 2026.
`;
  }

  const userPrompt = `
Please write the blog post following these strict specifications:

[WRITING GUIDELINES]
${guidelines}
*MARKDOWN OVERRIDE*: Although Section V of the guidelines mentions HTML tags, you MUST ignore Section V. Output 100% standard Markdown format. Use * or - for lists, and standard text without HTML wrappers. Do NOT output any HTML tags (e.g., no <p>, <ul>, <li>, <h3>, or <h2>).

[ARTICLE OUTLINE & METADATA]
- Title (H1): ${parsedArticle.title}
- Primary Keyword: ${parsedArticle.primaryKeyword}
- LSI Keywords: ${parsedArticle.lsiKeywords}
- Slug: ${parsedArticle.slug}
- Outline: 
${parsedArticle.outline}
${searchContextText}

[UPGRADED GOOGLE TOP 3 CRITERIA - NO FAKE LINKS & YMYL COMPLIANT]
1. OUTPUT MARKDOWN FORMAT ONLY.
2. The file MUST begin with a Front Matter (YAML blocks) exactly like this:
---
Title: "${parsedArticle.title}"
Slug: "${parsedArticle.slug}"
Category: "Compliance"
Primary_Keyword: "${parsedArticle.primaryKeyword}"
LSI_Keywords:
  - "${parsedArticle.lsiKeywords}"
Template_Type: "${parsedArticle.templateType}"
Precautions_And_Tone:
  - "禁止使用 AI 高频词: Tapestry, Testament, Furthermore, Delve, In conclusion."
  - "第一手经验: 必须融入采购失败/欺诈的真实故事背景并做脱敏标记。"
  - "全局年份锁定: 提到年份必须且只能是 2026 年。"
Cover_Image_Prompt:
  Placement: "${parsedArticle.title}"
  Prompt: "A clean, minimalist B2B SaaS blog cover illustration representing this theme: ${parsedArticle.title}. Modern corporate color palette with teal green and slate grey. Flat vector art design, premium technology brand feel, white background, 16:9 aspect ratio."
Body_Image_1:
  Placement: "${parsedArticle.h2Titles[0] || 'First Section Header'}"
  Prompt: "A professional concept B2B flat vector illustration representing the theme: ${parsedArticle.h2Titles[0] || 'Sourcing analysis'}. Teal green and slate grey accent tones, clean minimalist aesthetics, white background."
Body_Image_2:
  Placement: "${parsedArticle.h2Titles[1] || 'Second Section Header'}"
  Prompt: "A professional concept B2B flat vector illustration representing the theme: ${parsedArticle.h2Titles[1] || 'Sourcing safety'}. Teal green and slate grey accent tones, clean minimalist aesthetics, white background."
Body_Image_3:
  Placement: "${parsedArticle.h2Titles[2] || 'Third Section Header'}"
  Prompt: "A professional concept B2B flat vector illustration representing the theme: ${parsedArticle.h2Titles[2] || 'Sourcing workflow'}. Teal green and slate grey accent tones, clean minimalist aesthetics, white background."
Topic_Cluster:
  Role: "Cluster Page"
  Pillar_Page_Url: "/blog/how-to-verify-china-exhibitors"
  Inbound_Links_Suggested:
    - Source_Page: "/blog/how-to-spot-scams-when-sourcing-china"
      Anchor_Text: "how to verify a company in china is legit"
  Outbound_Links_Included:
    - Target_Page: "/database"
      Anchor_Text: "verify Chinese manufacturers"
---

3. Author Bio block (Plain text, NO links): Immediately below the H1 title and before the cover image, insert:
**Written by**: David Chen | Founder of GoCNScout  
*10+ years helping international buyers verify Chinese suppliers and audit global supply chains.*

4. Actionable Intro Checklist (No Corporate Pitch): The introduction MUST NOT start with a sales pitch or company description (e.g. do not say "We at GoCNScout understand..."). Instead, immediately capture search intent. In the first 2 paragraphs, you MUST output a bulleted checklist of 5 critical things to verify:
"Before paying any Chinese supplier, verify these 5 things:
- **Company Registration**: Active status and matching scope.
- **Factory Address**: Verifiable physical industrial footprint.
- **Export History**: Real shipment records and volumes.
- **Legal Disputes**: Pending court judgments or credit risks.
- **Payment Details**: Verified local corporate beneficiary bank accounts."

5. Mandatory Topic Cluster Internal Links for Article 1: If generating Article 1 ("How to Verify a Chinese Supplier: Complete Due Diligence Guide for Importers"), you MUST naturally embed these specific internal links to link the Pillar to the Cluster pages:
- Link to \`/blog/step-by-step-guide-how-to-verify-a-china-business-license-online\` using natural anchor text like "verify a China business license" or "business license verification".
- Link to \`/blog/how-to-avoid-china-sourcing-scams-10-red-flags-every-buyer-must-know\` using natural anchor text like "avoid China sourcing scams".
- Link to \`/blog/is-your-chinese-supplier-legitimate-how-to-match-corporate-names-bank-details\` using natural anchor text like "verify Chinese supplier bank details" or "bank account verification".
- Link to \`/blog/how-to-check-the-chinese-supplier-blacklist-and-exporter-licenses\` using natural anchor text like "check the Chinese supplier blacklist".

6. Soft Brand promotion (Crucial): Keep GoCNScout occurrences under 5-7 times in the entire article. Do not hard-sell. Write neutrally: "You can verify export history through customs databases or commercial trade intelligence platforms such as GoCNScout."

7. No PDF Download links: Do NOT generate links to external files or templates like PDFs or LinkedIn pages that do not exist (avoid 404 links). Instead, present any checklist directly in the text as a Markdown bullet checklist block.

8. Mandatory Tools/Criteria Comparison Table: Under the first or second H2, you MUST generate a clean Markdown comparative table comparing relevant tools, options, standards, or criteria related to the article topic. Do NOT pad Markdown table cells with extra spaces to visually align columns in raw text (this causes generation loops). Keep columns compact (maximum 1 space next to the "|" pipe). Do not skip this.

9. Mandatory Case Study section (YMYL Compliant): Include an anonymized case study illustrating a sourcing failure, delay, quality issue, or legal conflict related to the article's theme.
- Tag: *(Based on anonymized supplier cases reviewed by the auditing team. Details have been changed for privacy.)*
- Use YMYL-safe phrasing: "A sourcing case we reviewed involved a buyer who lost approximately $50,000 after failing to verify the supplier."
- Do NOT write "Case verified by GoCNScout Research Team". Keep it objective.

10. Clear Data Sources disclosure: In the Sourcing tools or data section, clearly list potential data sources:
"Data sources may include: Government registration databases, customs trade intelligence providers, and supplier-provided documentation."

11. Screenshot descriptions: Include at least 2 realistic screenshot placeholders showing exact UI search/vetting steps related to the article topic, e.g.:
*[Screenshot: Querying a supplier on the official China GSXT portal showing Registration Status as Active]*
*[Screenshot: Exporting shipment data in CSV format from a trade database]*

12. Add a video placeholder:
> **Video Guide**: *[Embed: "How to Verify a Chinese Factory in 5 Minutes" YouTube Tutorial]* (Adjust the title of the video tutorial placeholder to fit the topic naturally)

13. Markdown Image Injection Path & Class Requirements:
   - Use standard Markdown image syntax: ![alt text](/images/...)
   - Placement 1: Cover image directly below Author Bio: ![Cover image of verification](/images/${parsedArticle.slug}-cover.png)
   - Placement 2: Immediately below the first H2: ![Section 1 illustration](/images/${parsedArticle.slug}-body-1.png)
   - Placement 3: Immediately below the second H2: ![Section 2 illustration](/images/${parsedArticle.slug}-body-2.png)
   - Placement 4: Immediately below the third H2: ![Section 3 illustration](/images/${parsedArticle.slug}-body-3.png)
14. Use standard Markdown headers: "#" for H1, "##" for H2, "###" for H3. No HTML blocks.
15. Nesting Rule: Every H2 must contain exactly the specified H3 subheadings.
16. Year Lock to 2026. Avoid forbidden AI fluff words.
17. End with a Legal Disclaimer in Markdown blockquote style.
`;

  console.log(`Calling API... Generating markdown for: "${parsedArticle.title}"`);
  
  try {
    const generatedMarkdown = await callLLM(systemPrompt, userPrompt);

    // Clean markdown blocks if LLM accidentally wrapped it
    let cleanMd = generatedMarkdown.trim();
    if (cleanMd.startsWith("```markdown")) {
      cleanMd = cleanMd.substring(11);
    } else if (cleanMd.startsWith("```")) {
      cleanMd = cleanMd.substring(3);
    }
    if (cleanMd.endsWith("```")) {
      cleanMd = cleanMd.substring(0, cleanMd.length - 3);
    }
    cleanMd = cleanMd.trim();

    const outputFileName = `${fileDatePrefix}-${String(articleIndex).padStart(2, '0')}-${parsedArticle.slug}.md`;
    const outputFilePath = path.resolve(outputDir, outputFileName);
    fs.writeFileSync(outputFilePath, cleanMd, "utf-8");

    console.log("\n==================================================");
    console.log(`🎉 Success! Upgraded Article ${articleIndex} Generated Successfully!`);
    console.log(`Saved path: ${outputFilePath}`);
    console.log("==================================================");
  } catch (error) {
    console.error("Failed to generate markdown article:", error);
  }
}

// Helper to parse specific article fields from the plan file content
function parseArticleFromPlan(content: string, index: number): any {
  // Locate the article header e.g., "### 2. "
  const startRegex = new RegExp(`###\\s*${index}\\.\\s*(.*?)(?:\\s*\\((.*?)\\))?\\s*\\r?\\n`);
  const startMatch = content.match(startRegex);

  if (!startMatch || startMatch.index === undefined) return null;

  const startIndex = startMatch.index;
  const rawTitle = startMatch[1].trim();

  // Slug generation (kebab-case)
  const slug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Find next article start to bound search space
  const nextRegex = new RegExp(`###\\s*${index + 1}\\.\\s*`);
  const nextMatch = content.match(nextRegex);
  const endIndex = (nextMatch && nextMatch.index !== undefined) ? nextMatch.index : content.length;

  const articleBlock = content.substring(startIndex, endIndex);

  // Parse fields
  const templateMatch = articleBlock.match(/Template Type\s*.*?:\s*`?(.*?)`?\s*(\r?\n|$)/i);
  const primaryMatch = articleBlock.match(/Primary Keyword\s*.*?:\s*`?(.*?)`?\s*(\r?\n|$)/i);
  const lsiMatch = articleBlock.match(/LSI Keywords\s*.*?:\s*`?(.*?)`?\s*(\r?\n|$)/i);

  const templateType = templateMatch ? templateMatch[1].trim() : "A - Deep Compliance";
  const primaryKeyword = primaryMatch ? primaryMatch[1].trim() : rawTitle.toLowerCase();
  const lsiKeywords = lsiMatch ? lsiMatch[1].trim() : "";

  // Parse H2 titles for image placement
  const h2Regex = /H2_\d+:\s*(.*?)(?:\s*\(.*?\))?\r?\n/g;
  const h2Titles: string[] = [];
  let h2Match;
  while ((h2Match = h2Regex.exec(articleBlock)) !== null) {
    h2Titles.push(h2Match[1].trim());
  }

  // Outline extraction
  const outlineStart = articleBlock.indexOf("Bilingual Outline");
  const outline = outlineStart !== -1 
    ? articleBlock.substring(outlineStart).trim() 
    : articleBlock.trim();

  return {
    title: rawTitle,
    slug,
    templateType,
    primaryKeyword,
    lsiKeywords,
    outline,
    h2Titles
  };
}

main();
