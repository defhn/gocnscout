#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const DEFAULT_SOURCE_DIR =
  "D:\\gocnscout博客文章\\DeepSeek完整文章生成批次\\supplier-field-articles-20260712-190257\\docs";
const DEFAULT_OUTPUT_DIR = "D:\\gocnscout博客文章\\Gemini英文SEO博客页面";

const args = parseArgs(process.argv.slice(2));
loadEnvFile(path.resolve(process.cwd(), ".env.local"));

const sourceDir = args.sourceDir || DEFAULT_SOURCE_DIR;
const inputPath = args.input || "";
const outputDir = args.outputDir || DEFAULT_OUTPUT_DIR;
const model = args.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const force = Boolean(args.force);
const limit = toPositiveInt(args.limit, inputPath ? 1 : 20);
const offset = toNonNegativeInt(args.offset, 0);
const concurrency = Math.max(1, Math.min(6, toPositiveInt(args.concurrency, 2)));
const rerunFailures = args.rerunFailures !== false && args["no-rerun-failures"] !== true;
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) fail("Missing GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY.");
if (!inputPath && !fs.existsSync(sourceDir)) fail(`Source dir not found: ${sourceDir}`);
if (inputPath && !fs.existsSync(inputPath)) fail(`Input docx not found: ${inputPath}`);

fs.mkdirSync(outputDir, { recursive: true });

const runStamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const progressPath = path.join(outputDir, "gemini-english-seo-progress.json");
const runLogPath = path.join(outputDir, `gemini-run-${runStamp}.jsonl`);
const failureLogPath = path.join(outputDir, `gemini-failures-${runStamp}.jsonl`);
const latestFailureLogPath = path.join(outputDir, "gemini-failures-latest.jsonl");

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});

async function main() {
  const files = getInputFiles();
  const progress = loadProgress(progressPath);

  console.log(`Model       : ${model}`);
  console.log(`Output dir  : ${outputDir}`);
  console.log(`Concurrency : ${concurrency}`);
  console.log(`Files       : ${files.length}`);
  console.log(`Run log     : ${runLogPath}`);
  console.log(`Failure log : ${failureLogPath}`);

  fs.writeFileSync(latestFailureLogPath, "", "utf8");

  const firstPass = await runBatch(files, progress, "pass-1");
  let finalResults = firstPass.results;

  if (rerunFailures && firstPass.failed.length > 0) {
    console.log(`\nRetrying failed files once: ${firstPass.failed.length}`);
    const retryPass = await runBatch(firstPass.failed.map((item) => item.file), progress, "retry-1");
    finalResults = finalResults.concat(retryPass.results);
  }

  const summary = summarize(finalResults);
  console.log("\nDone.");
  console.log(`Generated: ${summary.generated}`);
  console.log(`Skipped  : ${summary.skipped}`);
  console.log(`Failed   : ${summary.failed}`);
  console.log(`Progress : ${progressPath}`);

  if (summary.failed > 0) {
    console.log(`Failures : ${failureLogPath}`);
    process.exitCode = 1;
  }
}

function getInputFiles() {
  if (inputPath) return [inputPath];

  return fs
    .readdirSync(sourceDir)
    .filter((name) => /\.docx$/i.test(name) && !name.startsWith("~$"))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN", { numeric: true }))
    .slice(offset, offset + limit)
    .map((name) => path.join(sourceDir, name));
}

async function runBatch(files, progress, passName) {
  const queue = files.slice();
  const results = [];
  const failed = [];
  let completed = 0;

  async function worker(workerId) {
    while (queue.length > 0) {
      const file = queue.shift();
      const index = completed + 1;
      const label = path.basename(file);
      try {
        const result = await generateOne({ file, progress, passName, workerId, index });
        results.push(result);
        completed += 1;
        console.log(`[${passName}] ${completed}/${files.length} ${result.status.toUpperCase()} ${label}`);
      } catch (error) {
        completed += 1;
        const message = error && error.stack ? error.stack : String(error);
        const failure = { file, passName, error: message, at: new Date().toISOString() };
        failed.push(failure);
        results.push({ file, status: "failed", error: message });
        appendJsonl(failureLogPath, failure);
        appendJsonl(latestFailureLogPath, failure);
        appendJsonl(runLogPath, failure);
        progress[file] = { status: "failed", error: message, updatedAt: new Date().toISOString() };
        saveProgress(progressPath, progress);
        console.error(`[${passName}] ${completed}/${files.length} FAILED ${label}`);
        console.error(String(error.message || error).slice(0, 700));
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, (_, i) => worker(i + 1)));
  return { results, failed };
}

async function generateOne({ file, progress, passName, workerId }) {
  const outputPath = getOutputPath(outputDir, file);

  if (!force && fs.existsSync(outputPath)) {
    const result = {
      file,
      outputPath,
      status: "skipped",
      reason: "output_exists",
      passName,
      workerId,
      at: new Date().toISOString(),
    };
    progress[file] = result;
    saveProgress(progressPath, progress);
    appendJsonl(runLogPath, result);
    return result;
  }

  const sourceText = extractDocxText(file);
  if (sourceText.length < 500) throw new Error(`Extracted text is too short (${sourceText.length} chars).`);

  const topic = extractTopicFromFileName(path.basename(file));
  const prompt = buildPrompt({ topic, sourceText });
  const first = await callGemini({ prompt, apiKey, model });
  let markdown = normalizeMarkdown(first.text);

  if (needsRevision(markdown)) {
    console.log(`Revision needed: ${path.basename(file)}`);
    const revised = await callGemini({ prompt: buildRevisionPrompt(markdown, topic), apiKey, model });
    markdown = normalizeMarkdown(revised.text);
  }

  markdown = enforceTop3Modules(markdown, topic);
  fs.writeFileSync(outputPath, markdown, "utf8");

  const result = {
    file,
    outputPath,
    status: "generated",
    topic,
    chars: markdown.length,
    words: countWords(markdown),
    passName,
    workerId,
    usage: first.usage || null,
    estimatedCostUsd: estimateGeminiFlashCost(first.usage),
    at: new Date().toISOString(),
  };

  progress[file] = result;
  saveProgress(progressPath, progress);
  appendJsonl(runLogPath, result);
  return result;
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function extractDocxText(docxPath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "docx-read-"));
  const tempZip = path.join(os.tmpdir(), `docx-read-${Date.now()}-${Math.random().toString(16).slice(2)}.zip`);
  try {
    fs.copyFileSync(docxPath, tempZip);
    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        `Expand-Archive -LiteralPath '${escapePs(tempZip)}' -DestinationPath '${escapePs(tempDir)}' -Force`,
      ],
      { stdio: "pipe" },
    );
    const xmlPath = path.join(tempDir, "word", "document.xml");
    const xml = fs.readFileSync(xmlPath, "utf8");
    return xml
      .replace(/<w:tab\/>/g, "\t")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } finally {
    fs.rmSync(tempZip, { force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function extractTopicFromFileName(fileName) {
  const base = fileName
    .replace(/\.docx$/i, "")
    .replace(/\s+-\s+DeepSeek完整文章$/i, "")
    .replace(/^\d{2}-\d{2}\s+中国供应商尽调字段解读\s+-\s+/i, "")
    .trim();
  return base || fileName.replace(/\.docx$/i, "");
}

async function callGemini({ prompt, apiKey, model }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.48,
        topP: 0.9,
        maxOutputTokens: 9000,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API ${response.status}: ${text.slice(0, 1000)}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned empty content.");
  return { text, usage: json.usageMetadata || null };
}

function needsRevision(markdown) {
  return (
    countWords(markdown) > 2400 ||
    /[\p{Script=Han}]/u.test(markdown) ||
    /https?:\/\/(?:www\.)?example\.com/i.test(markdown) ||
    !hasRequiredModules(markdown)
  );
}

function countWords(markdown) {
  return markdown.split(/\s+/).filter(Boolean).length;
}

function hasRequiredModules(markdown) {
  return [
    "```mermaid",
    "Risk scoring",
    "Red flags",
    "Composite case example",
    "What makes this checklist citable",
    "People Also Ask",
    "/supplier-check",
    "/pricing",
  ].every((item) => markdown.toLowerCase().includes(item.toLowerCase()));
}

function buildRevisionPrompt(markdown, topic) {
  return `Rewrite the Markdown page below into a final Google-ready English SEO blog page about this supplier due diligence field: ${topic}.

Hard requirements:
- Preserve YAML frontmatter.
- Preserve the same search intent and main field.
- Preserve these required modules: Mermaid flowchart, risk scoring table, red flags, composite case example, citable checklist, People Also Ask, CTA with /supplier-check and /pricing, related guides.
- Final length: 1,700-2,200 English words.
- English only. Remove all Chinese characters.
- Do not include fake image URLs, example.com URLs, fake official data, fake legal citations, or unverified statistics.
- Use Markdown image suggestions only as HTML comments.
- Return only the final Markdown.

Markdown to rewrite:
${markdown.slice(0, 26000)}
`;
}

function buildPrompt({ topic, sourceText }) {
  const insights = buildEnglishReferenceInsights(topic, sourceText);
  const keyword = getPrimaryKeyword(topic);
  return `You are a senior SEO strategist and English-language B2B content editor for gocnscout, a service that helps overseas buyers screen and verify Chinese suppliers.

Create one Google-ready English SEO blog page in Markdown.

SOURCE FIELD:
${topic}

PRIMARY KEYWORD ANGLE:
${keyword}

REFERENCE INSIGHTS:
${insights}

BUSINESS CONTEXT:
- Audience: overseas buyers, Amazon sellers, Shopify sellers, importers, procurement managers, sourcing consultants, and brand owners evaluating Chinese suppliers.
- Product context: gocnscout offers a free supplier screening tool plus paid manual review services: Supplier Identity Check ($149) and Buyer Decision Review ($249).
- The page should educate first and sell softly. It should naturally lead readers to verify a supplier before samples, deposits, or payment.

SEO GOAL:
Write a Top 3 candidate, not a direct translation. Match the real buyer intent behind this field: "What does this field mean, how do I verify it, and how should it affect payment or supplier decisions?"

CONTENT REQUIREMENTS:
- English only. No Chinese characters.
- Natural expert voice. Use first-person expert perspective where useful: "I usually...", "When I review...", "I would pause..."
- Target 1,700-2,200 English words.
- Use Markdown with YAML frontmatter.
- First 120 words must directly answer the searcher's problem.
- Include at least two compact tables.
- Include one Mermaid flowchart.
- Include one clearly labeled "Composite case example" that is realistic but not presented as a real client or real company.
- Include one citable checklist/framework.
- Include 6-8 People Also Ask style FAQs.
- Include a natural CTA to /supplier-check and /pricing.
- Include "Last updated: July 12, 2026" near the top.
- Do not invent case studies, statistics, court records, registry records, or fake legal citations.
- Do not guarantee safety or legality.
- Do not provide legal advice.
- Do not include fake image URLs or example.com links.
- Use image suggestions only as Markdown comments, such as: <!-- Image suggestion: screenshot of an Alibaba company profile with company-name field highlighted -->
- Avoid filler like "delve", "landscape", "unlock", "robust", "game-changer".
- Make the content useful even if the reader never buys.

MANDATORY PAGE OUTLINE:
Return the page in this order and complete every section.

1. YAML frontmatter
2. H1
3. Short direct answer / intro
4. "Last updated: July 12, 2026"
5. ## Quick answer: what this field tells you
6. ## Why this field matters in China supplier verification
7. ## Where to find this field
8. ## The verification flow I use
   - include a Mermaid flowchart
9. ## How to cross-check this field step by step
10. ## Risk scoring for this field
    - include a complete table
11. ## Red flags that should stop payment
12. ## Composite case example: how this field changes the buyer decision
13. ## What makes this checklist citable
14. ## People Also Ask
15. ## Use the free checker before you pay
    - include /supplier-check and /pricing
16. ## Related guides
    - include /blog/china-supplier-due-diligence-report-fields-explained and /blog/chinese-business-license-verification

PAGE FORMAT:
Return only the Markdown page.

YAML frontmatter must include:
---
title:
description:
slug:
primary_keyword:
secondary_keywords:
search_intent:
last_updated: 2026-07-12
---
`;
}

function buildEnglishReferenceInsights(topic, sourceText) {
  const lower = `${topic}\n${sourceText}`.toLowerCase();
  const generic = [
    `Field to explain: ${topic}.`,
    "The field should be interpreted as one signal in supplier verification, not as a standalone guarantee.",
    "Buyers should compare the field against business license data, official registry records, Alibaba profile information, website clues, contract seller identity, and payment account details.",
    "Explain what a normal result looks like, what a suspicious result looks like, and what a buyer should ask before paying.",
    "Emphasize practical sourcing decisions: whether to contact, request samples, ask for documents, pause payment, or order a manual review.",
  ];

  if (lower.includes("企业名称")) {
    generic.push(
      "Focus on the official legal company name as the baseline identity for all supplier checks.",
      "Explain why English names, store names, and domain names are not enough.",
    );
  } else if (lower.includes("法定代表人")) {
    generic.push(
      "Explain that the legal representative is the person legally registered as responsible for the company, but this person may not be the salesperson or owner the buyer talks to.",
      "Focus on consistency across business license, registry records, contract signatory, and unusual name changes.",
    );
  } else if (lower.includes("注册资本")) {
    generic.push(
      "Explain that registered capital is not the same as cash in the bank, paid-in capital, production capacity, or supplier reliability.",
      "Show how registered capital can still help compare tiny trading companies, factories, and larger operating entities.",
    );
  } else if (lower.includes("登记状态")) {
    generic.push(
      "Focus on active, cancelled, revoked, suspended, moved-out, abnormal, or liquidation-related status signals.",
      "Make payment decisions very cautious when the company is not active or the status cannot be confirmed.",
    );
  } else if (lower.includes("统一社会信用代码")) {
    generic.push(
      "Explain that the Unified Social Credit Code is the most stable unique identifier for a Chinese company.",
      "Use it to avoid confusion caused by similar English names or translated company names.",
    );
  } else if (lower.includes("成立日期")) {
    generic.push(
      "Explain how establishment date helps judge operating history, but older does not automatically mean safer.",
      "Discuss risks of very new companies taking large deposits or claiming long factory history.",
    );
  } else if (lower.includes("工商注册号")) {
    generic.push(
      "Explain that the registration number is an older or alternate registration identifier and should be cross-checked with the Unified Social Credit Code.",
      "Warn buyers not to rely on a registration number alone if the legal name or status does not match.",
    );
  } else if (lower.includes("企业类型")) {
    generic.push(
      "Explain how company type helps identify limited liability companies, individual businesses, branches, foreign-invested entities, trading companies, and possible operating structures.",
      "Connect company type to buyer questions about factory claims, liability, and contracting risk.",
    );
  } else if (lower.includes("组织机构代码")) {
    generic.push(
      "Explain that organization code is a legacy identity signal now often embedded in the broader unified code system.",
      "Use it as a supporting identifier rather than the main decision field.",
    );
  } else if (lower.includes("核准日期")) {
    generic.push(
      "Explain that approval date shows when the latest registry approval or change was processed, not necessarily when the company was founded.",
      "Use it to spot recent changes that deserve follow-up, such as address, legal representative, scope, or capital changes.",
    );
  }

  return generic.map((item) => `- ${item}`).join("\n");
}

function getPrimaryKeyword(topic) {
  const map = [
    ["企业名称", "how to verify a Chinese company name"],
    ["法定代表人", "Chinese company legal representative verification"],
    ["注册资本", "Chinese company registered capital meaning"],
    ["登记状态", "Chinese company registration status check"],
    ["统一社会信用代码", "China Unified Social Credit Code verification"],
    ["成立日期", "Chinese company establishment date verification"],
    ["工商注册号", "Chinese business registration number check"],
    ["企业类型", "Chinese company type meaning"],
    ["组织机构代码", "China organization code verification"],
    ["核准日期", "Chinese company approval date meaning"],
  ];
  const match = map.find(([key]) => topic.includes(key));
  return match ? match[1] : `China supplier due diligence ${topic}`;
}

function normalizeMarkdown(markdown) {
  return markdown
    .replace(/^```(?:markdown|md)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/[ \t]{4,}/g, " ")
    .replace(/\n{4,}/g, "\n\n")
    .trim()
    .concat("\n");
}

function enforceTop3Modules(markdown, topic) {
  let output = markdown
    .replace(/!\[[^\]]*]\(https?:\/\/(?:www\.)?example\.com[^)]*\)\s*/gi, "")
    .replace(/https?:\/\/(?:www\.)?example\.com[^\s)]*/gi, "")
    .replace(/Chinese Legal Name \(e\.g\.,\s*\):/gi, "Chinese legal name:")
    .replace(/""\s*\(in operation\),\s*""\s*\(open for business\),\s*or\s*""\s*\(existing\)/gi, '"active", "in business", or "open"')
    .replace(/""\s*\(cancelled\),\s*""\s*\(revoked\),\s*""\s*\(in liquidation\),\s*""\s*\(moved out\),\s*or\s*""\s*\(suspended\)/gi, '"cancelled", "revoked", "in liquidation", "moved out", or "suspended"')
    .replace(/[\u4e00-\u9fff]+ICP[^\s]*/g, "ICP filing number")
    .replace(/[\u4e00-\u9fff]+/g, "")
    .replace(/\n{4,}/g, "\n\n")
    .trim();

  output = replaceOrAppendSection(
    output,
    /## Risk scoring for(?: company-name inconsistencies| this field)[\s\S]*?(?=\n## |$)/i,
    riskScoringSection(topic),
  );

  if (!/## Red flags that should stop payment/i.test(output)) {
    output += `\n\n${redFlagsSection(topic)}`;
  }

  if (!output.includes("```mermaid")) {
    output += `\n\n${flowSection(topic)}`;
  }

  if (!/## Composite case example/i.test(output)) {
    output += `\n\n${compositeCaseSection(topic)}`;
  }

  if (!/## What makes this checklist citable/i.test(output)) {
    output += `\n\n${citableSection(topic)}`;
  }

  if (!/## People Also Ask/i.test(output)) {
    output += `\n\n${faqSection(topic)}`;
  }

  if (!output.includes("/supplier-check") || !output.includes("/pricing")) {
    output += `\n\n${ctaSection()}`;
  }

  if (!output.includes("/blog/china-supplier-due-diligence-report-fields-explained")) {
    output += `\n\n${relatedGuidesSection()}`;
  }

  output = output.replace(/\n{4,}/g, "\n\n").trim();
  return output.concat("\n");
}

function replaceOrAppendSection(output, regex, section) {
  if (regex.test(output)) return output.replace(regex, section);
  return `${output}\n\n${section}`;
}

function flowSection(topic) {
  return `## The verification flow I use

\`\`\`mermaid
flowchart TD
  A[Supplier provides public profile or documents] --> B[Extract the ${escapeMermaid(topic)} field]
  B --> C[Check official registry or business license]
  C --> D[Compare Alibaba profile and company website]
  D --> E[Compare contract seller and payment account]
  E --> F{Does the field align?}
  F -->|Yes| G[Continue with product, capacity, and risk checks]
  F -->|No| H[Pause payment and request written explanation]
\`\`\``;
}

function riskScoringSection(topic) {
  return `## Risk scoring for this field

I score ${topic} as a practical buyer signal, not as a legal conclusion. A single inconsistency may have an innocent explanation, but several inconsistencies together should slow the deal down.

| Signal | Risk level | What I would do before payment |
|---|---:|---|
| The field matches the business license, registry record, Alibaba profile, website, contract, and payment account context | Low | Continue with normal supplier checks |
| The field is missing from one public source but consistent elsewhere | Medium | Ask for a document copy and written explanation |
| The field conflicts between the registry and Alibaba or the supplier website | High | Pause sample or deposit payment until the identity chain is clear |
| The contract seller or payment account does not match the verified company identity | Critical | Do not pay until the relationship is independently verified |
| The supplier refuses to provide documents needed to verify the field | Critical | Treat the supplier as unsuitable for prepaid orders |`;
}

function redFlagsSection(topic) {
  return `## Red flags that should stop payment

Stop before paying if the supplier cannot explain a serious ${topic} mismatch. The most dangerous pattern is not one small formatting difference; it is a chain of identities that do not connect.

- The supplier refuses to provide a current business license or registry-identifying information.
- Alibaba, the website, the contract, and the payment account point to different companies.
- The supplier says the mismatch is "normal" but will not provide written proof of the relationship.
- The payment beneficiary is a personal account or an unrelated company.
- The company appears inactive, revoked, cancelled, or under liquidation in public records.
- The field changed recently and the supplier cannot explain why it matters to your transaction.`;
}

function compositeCaseSection(topic) {
  return `## Composite case example: how this field changes the buyer decision

This is a composite example, not a real named case. A buyer finds a supplier through a product page and receives a quote quickly. The public profile looks professional, but the ${topic} detail shown in the supplier's documents does not line up with the company named on the contract and the payment account.

That does not automatically prove fraud. It may be a trading company, export agent, factory group, or sister company. But for a prepaid order, I would pause the transaction, request business licenses for every involved entity, ask for a written relationship explanation, and independently verify the public website or official contact channel before sending any money.`;
}

function citableSection(topic) {
  return `## What makes this checklist citable

The useful rule is simple: treat ${topic} as a cross-source alignment test. The field is valuable when it connects the supplier's public identity, legal identity, marketplace identity, and payment identity.

| Verification point | What to compare | Why it matters |
|---|---|---|
| Business license | The field as shown on the legal document | Establishes the baseline identity |
| Official registry | Current public record | Confirms whether the supplier's claim is still current |
| Alibaba profile | Storefront and company profile details | Checks marketplace consistency |
| Website and contact page | Public-facing company identity | Detects borrowed websites or unrelated brands |
| Contract and payment account | Seller and beneficiary names | Prevents payment diversion |`;
}

function faqSection(topic) {
  return `## People Also Ask

### What does ${topic} mean in Chinese supplier verification?

It is one field used to identify and evaluate a Chinese supplier. The field is useful only when you compare it across the business license, public registry, Alibaba profile, website, contract, and payment account.

### Can I trust a supplier if this field looks normal?

Not by itself. A normal-looking field is a good sign, but it does not prove product quality, factory capacity, export experience, or payment safety. Use it as the starting point for broader due diligence.

### What if Alibaba and the business license show different information?

Ask the supplier to explain the difference in writing and provide supporting documents. If the mismatch affects the legal seller or payment account, pause payment until you can verify the relationship independently.

### Should I accept an English translation of this field?

Use English translations for communication, but verify the legal identity against official records and business-license information. English names and translated fields can be informal or inconsistent.

### Is a trading company automatically risky?

No. A trading company can be legitimate and useful. The risk appears when a supplier hides its role, claims to be a factory without evidence, or asks you to pay an unrelated entity.

### When should I order a manual supplier review?

Use manual review when the order value is meaningful, the supplier asks for a deposit, the documents do not match, or you need a buyer decision such as contact, request sample, continue negotiation, or pause.`;
}

function ctaSection() {
  return `## Use the free checker before you pay

If you already have an Alibaba product page, supplier store, or company website, run it through the [free supplier checker](/supplier-check) before you send a deposit. The free scan can help you collect public-source signals and identify what still needs manual verification.

For larger orders, samples, or payment decisions, compare the manual review options on the [pricing page](/pricing). A Supplier Identity Check is useful for basic entity verification, while a Buyer Decision Review is better when you need a contact, sample, negotiation, or payment recommendation.`;
}

function relatedGuidesSection() {
  return `## Related guides

- [China supplier due diligence report fields explained](/blog/china-supplier-due-diligence-report-fields-explained)
- [Chinese business license verification](/blog/chinese-business-license-verification)`;
}

function getOutputPath(dir, file) {
  const base = path
    .basename(file)
    .replace(/\.docx$/i, "")
    .replace(/\s+-\s+DeepSeek完整文章$/i, "")
    .concat(" - Gemini English SEO Blog.md");
  return path.join(dir, base);
}

function loadProgress(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function saveProgress(filePath, progress) {
  fs.writeFileSync(filePath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
}

function appendJsonl(filePath, value) {
  fs.appendFileSync(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

function summarize(results) {
  return results.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { generated: 0, skipped: 0, failed: 0 },
  );
}

function estimateGeminiFlashCost(usage) {
  if (!usage) return null;
  const input = usage.promptTokenCount || 0;
  const output = usage.candidatesTokenCount || 0;
  return Number(((input / 1_000_000) * 0.3 + (output / 1_000_000) * 2.5).toFixed(6));
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNonNegativeInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function escapePs(value) {
  return String(value).replace(/'/g, "''");
}

function escapeMermaid(value) {
  return String(value).replace(/[^\w\s-]/g, "").trim() || "supplier field";
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
