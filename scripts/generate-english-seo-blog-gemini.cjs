#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const DEFAULT_INPUT =
  "D:\\gocnscout博客文章\\DeepSeek完整文章生成批次\\supplier-field-articles-20260712-190257\\docs\\01-01 中国供应商尽调字段解读 - 企业名称 - DeepSeek完整文章.docx";
const DEFAULT_OUTPUT_DIR = "D:\\gocnscout博客文章\\Gemini英文SEO博客页面";

const args = parseArgs(process.argv.slice(2));
loadEnvFile(path.resolve(process.cwd(), ".env.local"));

const inputPath = args.input || DEFAULT_INPUT;
const outputDir = args.outputDir || DEFAULT_OUTPUT_DIR;
const model = args.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const force = Boolean(args.force);
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) fail("Missing GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY.");
if (!fs.existsSync(inputPath)) fail(`Input docx not found: ${inputPath}`);

fs.mkdirSync(outputDir, { recursive: true });

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});

async function main() {
  console.log(`Input : ${inputPath}`);
  console.log(`Model : ${model}`);

  const sourceText = extractDocxText(inputPath);
  if (sourceText.length < 500) fail(`Extracted text is too short (${sourceText.length} chars).`);

  const topic = extractTopicFromFileName(path.basename(inputPath));
  const prompt = buildPrompt({ topic, sourceText });
  const markdown = normalizeMarkdown(await callGemini({ prompt, apiKey, model }));

  const outputPath = getOutputPath(outputDir, inputPath, force);
  fs.writeFileSync(outputPath, markdown, "utf8");

  console.log(`Output: ${outputPath}`);
  console.log(`Chars : ${markdown.length}`);
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
  return fileName
    .replace(/\.docx$/i, "")
    .replace(/\s+-\s+DeepSeek完整文章$/i, "")
    .replace(/^\d{2}-\d{2}\s+中国供应商尽调字段解读\s+-\s+/, "")
    .trim();
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
        temperature: 0.52,
        topP: 0.9,
        maxOutputTokens: 6500,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API ${response.status}: ${text.slice(0, 800)}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned empty content.");
  return text;
}

function buildPrompt({ topic, sourceText }) {
  return `You are a senior SEO strategist and English-language B2B content editor for gocnscout, a service that helps overseas buyers screen and verify Chinese suppliers.

Your task: create a Google-ready English SEO blog page in Markdown.

Important: The Chinese source article below is only reference material. Do NOT translate it line by line. Decide the actual search intent, keyword angle, title, structure, and page format yourself. The final page should be more useful, more search-focused, and more credible than a translation.

SOURCE TOPIC:
${topic}

BUSINESS CONTEXT:
- Audience: overseas buyers, Amazon sellers, Shopify sellers, importers, procurement managers, sourcing consultants, and brand owners evaluating Chinese suppliers.
- Product context: gocnscout offers a free supplier screening tool plus paid manual review services: Supplier Identity Check ($149) and Buyer Decision Review ($249).
- The page should educate first and sell softly. It should naturally lead readers to verify a supplier before samples, deposits, or payment.

SEO GOAL:
Create a page that has a realistic chance to compete for high-intent Google searches. Do not chase a literal translation of the Chinese title. Choose the best English search angle.

You must decide:
- Primary keyword
- Secondary keywords
- Search intent
- SEO title
- Meta description
- URL slug
- H1

Likely query families include, but are not limited to:
- how to verify a Chinese company name
- Chinese company name verification
- China supplier verification
- verify Chinese supplier before payment
- Chinese business license company name
- Alibaba supplier company name check
- Chinese legal company name vs English name

CONTENT REQUIREMENTS:
- Write in natural expert English, not generic AI prose.
- Use first-person expert perspective where helpful: "I usually...", "When I review...", "I would not..."
- Target around 1,500 English words. A hard range of 1,350-1,700 words is required.
- Use Markdown.
- Include YAML frontmatter at the top.
- Include H1/H2/H3 headings.
- The first 120 words must directly answer the searcher's problem.
- Include practical checklists and warning signs.
- Include at least one compact table if it improves clarity.
- Include a FAQ section with 5-7 questions.
- Include a soft CTA section for manual review.
- Include "Last updated: July 12, 2026" near the top.
- Do not invent case studies, statistics, court records, or fake legal citations.
- Do not guarantee safety or legality.
- Do not provide legal advice. Use practical supplier-screening language.
- Do not say "In today's globalized world".
- Avoid filler like "delve", "landscape", "unlock", "robust", "game-changer".
- Avoid keyword stuffing.
- Make the page useful even if the reader never buys.
- Write in English only. Do not include Chinese characters in the final article, except if the exact phrase "Chinese legal name" is being explained in English. Translate operational Chinese terms into English, for example use "payment account" instead of Chinese words.
- Do not repeat the same idea across multiple sections. Each section must add something new.
- Keep paragraphs short: 2-4 sentences each.

PAGE FORMAT:
Return only the Markdown page.

The Markdown must include:
1. YAML frontmatter:
---
title:
description:
slug:
primary_keyword:
secondary_keywords:
search_intent:
last_updated: 2026-07-12
---

2. H1
3. A short answer/introduction
4. Main body
5. Practical checklist
6. Red flags
7. FAQ
8. Soft CTA

SOURCE MATERIAL TO USE AS REFERENCE:
${sourceText.slice(0, 20000)}
`;
}

function normalizeMarkdown(markdown) {
  return markdown
    .replace(/^```(?:markdown|md)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()
    .concat("\n");
}

function getOutputPath(outputDir, inputPath, force) {
  const base = path
    .basename(inputPath)
    .replace(/\.docx$/i, "")
    .replace(/\s+-\s+DeepSeek完整文章$/i, "")
    .concat(" - Gemini English SEO Blog.md");
  const outputPath = path.join(outputDir, base);
  if (force || !fs.existsSync(outputPath)) return outputPath;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return path.join(outputDir, base.replace(/\.md$/i, ` - ${stamp}.md`));
}

function escapePs(value) {
  return String(value).replace(/'/g, "''");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
