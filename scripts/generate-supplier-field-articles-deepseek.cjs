#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const DEFAULT_SOURCE_DIR = "D:\\gocnscout博客文章\\企业信用报告字段解读系列Word空白稿";
const DEFAULT_BATCH_ROOT = "D:\\gocnscout博客文章\\DeepSeek完整文章生成批次";
const LAST_BATCH_FILE = path.join(DEFAULT_BATCH_ROOT, ".last-batch.txt");

const args = parseArgs(process.argv.slice(2));
loadEnvFile(path.resolve(process.cwd(), ".env.local"));

const sourceDir = args.source || DEFAULT_SOURCE_DIR;
const batchRoot = args.batchRoot || DEFAULT_BATCH_ROOT;
const concurrency = Math.max(1, Number(args.concurrency || 3));
const limit = args.limit ? Math.max(1, Number(args.limit)) : null;
const force = Boolean(args.force);
const newBatch = Boolean(args.newBatch);

const apiKey = process.env.DEEPSEEK_API_KEY;
const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const model = args.model || process.env.DEEPSEEK_MODEL || "deepseek-chat";

if (!apiKey) {
  fail("Missing DEEPSEEK_API_KEY in .env.local or environment.");
}

if (!fs.existsSync(sourceDir)) {
  fail(`Source directory not found: ${sourceDir}`);
}

fs.mkdirSync(batchRoot, { recursive: true });

const batchDir = resolveBatchDir({ batchRoot, newBatch });
const outputDir = path.join(batchDir, "docs");
const logDir = path.join(batchDir, "logs");
const progressPath = path.join(batchDir, "progress.json");
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(logDir, { recursive: true });

const topics = listTopics(sourceDir);
const selectedTopics = limit ? topics.slice(0, limit) : topics;
const progress = readProgress(progressPath);

console.log(`Source dir : ${sourceDir}`);
console.log(`Batch dir  : ${batchDir}`);
console.log(`Model      : ${model}`);
console.log(`Concurrency: ${concurrency}`);
console.log(`Total      : ${topics.length}`);
console.log(`This run   : ${selectedTopics.length}`);
console.log("");

runPool(selectedTopics, concurrency, async (topic, index) => {
  const outputPath = path.join(outputDir, topic.fileName);
  const logPath = path.join(logDir, `${topic.id}.txt`);

  if (!force && progress.completed[topic.sourceName] && fs.existsSync(outputPath)) {
    console.log(`[SKIP] ${index + 1}/${selectedTopics.length} ${topic.sourceName}`);
    return;
  }

  console.log(`[START] ${index + 1}/${selectedTopics.length} ${topic.sourceName}`);
  progress.started[topic.sourceName] = new Date().toISOString();
  writeProgress(progressPath, progress);

  try {
    const prompt = buildPrompt(topic);
    const article = await callDeepSeek({ prompt, apiKey, baseUrl, model });
    const normalized = normalizeArticle(article, topic);
    writeDocx(outputPath, normalized, topic);
    fs.writeFileSync(logPath, normalized, "utf8");

    progress.completed[topic.sourceName] = {
      at: new Date().toISOString(),
      output: outputPath,
      topic: topic.topic,
    };
    delete progress.failed[topic.sourceName];
    writeProgress(progressPath, progress);
    console.log(`[DONE]  ${index + 1}/${selectedTopics.length} ${topic.sourceName}`);
  } catch (error) {
    progress.failed[topic.sourceName] = {
      at: new Date().toISOString(),
      message: error && error.message ? error.message : String(error),
    };
    writeProgress(progressPath, progress);
    console.log(`[FAIL]  ${index + 1}/${selectedTopics.length} ${topic.sourceName}`);
    console.log(`        ${progress.failed[topic.sourceName].message}`);
  }
});

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

function resolveBatchDir({ batchRoot, newBatch }) {
  if (!newBatch && fs.existsSync(LAST_BATCH_FILE)) {
    const latest = fs.readFileSync(LAST_BATCH_FILE, "utf8").trim();
    if (latest && fs.existsSync(latest)) return latest;
  }

  const stamp = timestamp();
  const dir = path.join(batchRoot, `supplier-field-articles-${stamp}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LAST_BATCH_FILE, dir, "utf8");
  return dir;
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function listTopics(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".docx") && /^\d{2}-\d{2}\s/.test(entry.name))
    .map((entry) => {
      const sourceName = entry.name;
      const id = sourceName.slice(0, 5);
      const topic = extractTopic(sourceName);
      const categoryNo = id.slice(0, 2);
      return {
        id,
        sourceName,
        topic,
        categoryNo,
        category: categoryName(categoryNo),
        topicType: topicType(categoryNo),
        fileName: sourceName.replace(".docx", " - DeepSeek完整文章.docx"),
      };
    })
    .sort((a, b) => a.sourceName.localeCompare(b.sourceName, "zh-Hans-CN"));
}

function extractTopic(fileName) {
  return fileName.replace(/\.docx$/i, "").replace(/^\d{2}-\d{2}\s+中国供应商尽调字段解读\s+-\s+/, "").trim();
}

function categoryName(no) {
  return {
    "01": "企业基础身份字段",
    "02": "股权与控制结构字段",
    "03": "司法与法律诉讼字段",
    "04": "经营风险字段",
    "05": "经营能力与业务活动字段",
    "06": "知识产权与线上资产字段",
    "07": "历史变更字段",
    "08": "149美元 Supplier Identity Check 服务交付字段",
    "09": "249美元 Buyer Decision Review 服务交付字段",
  }[no] || "中国供应商尽调字段";
}

function topicType(no) {
  return {
    "01": "A. 企业基础身份字段",
    "02": "B. 股权与控制结构字段",
    "03": "C. 司法与法律诉讼字段",
    "04": "D. 经营风险字段",
    "05": "E. 经营能力与业务活动字段",
    "06": "F. 知识产权与线上资产字段",
    "07": "G. 历史变更字段",
    "08": "H. 服务交付/人工判断字段",
    "09": "H. 服务交付/人工判断字段",
  }[no] || "自动判断";
}

function readProgress(filePath) {
  if (!fs.existsSync(filePath)) {
    return { started: {}, completed: {}, failed: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return { started: {}, completed: {}, failed: {} };
  }
}

function writeProgress(filePath, progress) {
  fs.writeFileSync(filePath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
}

async function runPool(items, workerCount, worker) {
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(workerCount, items.length) }, next));
  const done = Object.keys(progress.completed).length;
  const failed = Object.keys(progress.failed).length;
  console.log("");
  console.log(`Progress file: ${progressPath}`);
  console.log(`Output dir   : ${outputDir}`);
  console.log(`Completed    : ${done}`);
  console.log(`Failed       : ${failed}`);
}

function buildPrompt(topic) {
  return `你是一名长期帮助海外买家核验中国供应商的尽调顾问，也懂 Google SEO 内容写作。

请根据我提供的主题，写一篇中文文章母稿。文章未来会被翻译成英文，用于 Google SEO。请注意：这不是中文营销软文，而是一篇面向海外买家的专业解释型文章。

【文章主题】
${topic.topic}

【主题所属类型】
${topic.topicType}

【所属文章系列】
${topic.category}

【目标读者】
海外买家、跨境电商卖家、进口商、采购经理、Amazon / Shopify 卖家、品牌方采购负责人。他们可能只拿到了中国供应商的 Alibaba 店铺、英文公司名、官网、报价单、营业执照截图、社媒账号或收款账户信息，但不知道如何判断这家公司是否真实、是否可靠、是否适合联系、索样、打款或长期合作。

【写作目标】
请把这个主题解释成一篇“海外买家如何理解和使用这个字段/信号”的文章。
如果主题是企业信用报告字段，请解释它在中国企业尽调中的含义。
如果主题是人工核验服务项，请解释这个服务项为什么有价值、具体核验什么、如何帮助买家做决策。
如果主题是社媒人工判断，请解释该平台能辅助判断哪些公开信号，但不要夸大社媒的可靠性。
如果主题是付款前注意事项，请重点写身份核验、合同主体、收款账户和独立回拨确认。

【主题类型自动判断】
请先在内部判断主题属于哪一类，但不要输出判断过程：

A. 企业基础身份字段：
如企业名称、法定代表人、注册资本、登记状态、统一社会信用代码、成立日期、企业类型、注册地址、经营范围等。
重点写公司是否真实存在、主体是否匹配、是否正常经营、是否覆盖目标产品。

B. 股权与控制结构字段：
如股东信息、持股比例、实缴出资额、对外投资、控制企业、分支机构、最终受益人、历史股东信息等。
重点写实际控制人、关联公司、主体混用、贸易壳公司、集团/工厂/品牌主体关系。

C. 司法与法律诉讼字段：
如裁判文书、开庭公告、法院公告、失信被执行人、被执行人、限制高消费、终本案件、股权冻结等。
重点写付款风险、合同纠纷、债务风险、执行风险、公开记录局限。

D. 经营风险字段：
如行政处罚、经营异常、严重违法、环保处罚、欠税公告、股权出质、动产抵押、产品召回等。
重点写监管风险、合规风险、财务压力、经营稳定性。

E. 经营能力与业务活动字段：
如招投标、资质证书、进出口信用、行政许可、抽查检查、供应商信息、客户信息、融资信息、荣誉等。
重点写公司是否真实活跃、是否有进出口能力、是否有经营规模和资质。

F. 知识产权与线上资产字段：
如商标、专利、著作权、备案网站、标准信息、APP、小程序、微信公众号、微博等。
重点写品牌权属、侵权风险、官网备案、线上足迹是否与企业主体一致。

G. 历史变更字段：
如历史营业执照、历史法人、历史股东、历史严重违法、历史环保处罚、历史备案网站等。
重点写主体稳定性、隐藏风险、换壳经营、历史风险是否被当前状态掩盖。

H. 服务交付/人工判断字段：
如企业基础身份核验、Alibaba与官网一致性核验、基础风险筛查、买家决策建议、付款前注意事项、小红书/抖音/知乎人工判断等。
重点写这个核验项具体做什么、为什么自动工具不够、人工判断如何帮助买家决策。

【写作视角】
请用第一人称写作，像一个有实操经验的中国供应商核验顾问在解释问题。
可以使用：
- 我通常会先看……
- 我不建议只看……
- 在实际核验中……
- 如果我是买家，我会……
- 这个字段不能单独下结论，但它能提供一个重要信号……

语气要专业、直接、克制，有经验感，不要像 AI 生成。

【SEO 要求】
1. 文章必须有一个 H1。
2. 使用 H2 和 H3 分层。
3. H1 必须自然包含主题核心词。
4. 前 150 字内说明这个主题为什么对海外买家重要。
5. 小标题要像真实用户会搜索的问题或判断点。
6. 内容要覆盖：What / Why / How / Red Flags / Buyer Action。
7. 不要堆砌关键词。
8. 不要使用“本文将探讨”“随着全球化发展”“在当今时代”这类 AI 套话。
9. 文章未来会翻译成英文，目标英文长度约 1500 words，所以中文母稿请控制在 2200-2800 个中文字左右。
10. 中文句子不要太绕，方便后续翻译成自然英文。

【必须包含的文章结构】

# H1：围绕主题写一个自然、有搜索价值的标题

开头：
用 2-3 段说明：
- 这个主题为什么重要；
- 它能帮海外买家判断什么；
- 它不能单独证明供应商可靠，需要和其他信息交叉验证。

## 这个字段/信号到底是什么意思？
解释主题的基本含义。
如果是企业字段，请说明它在中国企业信用报告或营业执照信息里通常代表什么。
如果是风险记录，请说明它反映的是哪类风险。
如果是社媒/官网/Alibaba 核验项，请说明它属于公开足迹还是人工判断信号。

## 我为什么会重点看这个信号？
从海外买家的角度解释它的价值。
根据主题选择相关角度，不要机械全写：
- 判断公司是否真实存在
- 判断公司是否仍在正常经营
- 判断工厂、贸易商、工贸一体
- 判断经营范围是否覆盖目标产品
- 判断主体是否和 Alibaba / 官网 / 合同 / 收款账户一致
- 判断是否有诉讼、处罚、失信、执行风险
- 判断是否有进出口能力
- 判断是否有品牌、商标、专利、官网备案或社媒足迹
- 判断是否值得联系、索样、付款或暂缓

## 我会怎么查？
请写具体步骤，但要根据主题选择相关渠道，不要每篇都机械重复全部渠道。

可选渠道包括：
- 要求供应商提供营业执照上的中文全称
- 国家企业信用信息公示系统
- 信用中国
- 中国裁判文书网
- 失信被执行人查询
- 中国商标网
- 国家知识产权局相关查询
- 海关/进出口相关数据
- 官网、邮箱、WHOIS
- Alibaba 店铺、TrustPass、评分页、产品列表
- 小红书、抖音、知乎公开信号
- 合同主体、收款账户、官网电话独立回拨确认

注意：根据主题选择最相关的 3-6 个渠道即可，不要每篇都把所有渠道列一遍。

## 我会如何判断正常还是异常？
请写成具体判断规则。至少包含 4-6 条。
格式可以类似：
- 如果看到……，通常说明……
- 如果供应商声称……，但字段显示……，我会提高警惕
- 如果这个字段和 Alibaba / 官网 / 合同不一致，我会先暂停付款

## 常见误区
列出 3-5 个误区，每个误区用 H3。

## 风险信号
列出 5-7 个 red flags。
每个风险信号都要写清楚：
- 看到什么现象
- 可能意味着什么
- 买家下一步应该怎么做

不要空泛写“有风险”，要具体。

## 如何和 Alibaba、官网、合同、收款账户交叉验证？
这一节必须写。
请根据主题解释它如何与以下信息交叉验证：
- Alibaba 店铺主体
- TrustPass / 公司档案
- 官网公司名、地址、邮箱、电话
- 营业执照中文全称
- 合同签约主体
- 收款账户名称
- 产品类目和经营范围
- 社媒/内容平台公开信号

必须强调：
英文名不等于法定名称。
中文公司全称才是核验核心。
如果合同主体、收款主体、官网主体、Alibaba 主体不一致，付款前必须解释清楚。
如果收款账户是个人账户或另一家公司账户，应暂停付款并独立核实。

## 什么时候需要人工深度核验？
自然引导人工服务，但不要硬广。
说明以下情况适合人工核验：
- 订单金额较大
- 准备打样或支付定金
- 公司成立时间较短
- 主体信息不一致
- 有诉讼、处罚、异常、失信、执行记录
- 自称工厂但经营范围没有生产、制造、加工
- 官网、邮箱、收款账户、社媒存在疑点
- 产品涉及认证、知识产权、品牌授权或目标市场合规

可以自然提到：
基础身份核验适合做第一层筛查。
买家决策审查适合在索样、谈判、付款前使用。

## 给海外买家的操作清单
用 checklist 输出 8-12 条。每条要短，方便翻译成英文。

## 结论
用 2-3 段总结。
必须强调：
- 单个字段不是最终结论
- 真正有价值的是交叉验证
- 付款前一定要确认公司主体、合同主体、收款主体一致
- 如果信息不一致，不要急着付款，要先核验

【风格要求】
- 不要写成百科词条。
- 不要写成律师函。
- 不要恐吓读者。
- 不要过度营销。
- 不要承诺“百分百识别骗子”。
- 不要编造具体公司名、具体案例、具体数据。
- 可以写“我见过的常见情况是……”但不要虚构可识别案例。
- 语言要像真人专家写的，有判断、有取舍、有实操感。
- 尽量少用排比废话。
- 每一节都要回答“买家看了以后能做什么”。

【输出格式】
只输出文章正文。
不要解释你的写作过程。
不要输出英文翻译。
不要输出 Markdown 代码块。`;
}

async function callDeepSeek({ prompt, apiKey, baseUrl, model }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "你是专业的中国供应商尽调顾问和SEO内容编辑。请严格按用户要求输出完整文章正文，不要解释过程。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.65,
      max_tokens: 5200,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API ${response.status}: ${text.slice(0, 500)}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("DeepSeek returned empty content.");
  return content;
}

function normalizeArticle(article, topic) {
  const cleaned = article.replace(/^```(?:markdown)?/i, "").replace(/```$/i, "").trim();
  if (/^#\s+/.test(cleaned)) return cleaned;
  return `# ${topic.topic}：海外买家如何理解这个中国供应商尽调信号\n\n${cleaned}`;
}

function writeDocx(outputPath, markdown, topic) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "supplier-article-"));
  try {
    fs.mkdirSync(path.join(tempDir, "_rels"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "word", "_rels"), { recursive: true });

    fs.writeFileSync(
      path.join(tempDir, "[Content_Types].xml"),
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`,
      "utf8",
    );
    fs.writeFileSync(
      path.join(tempDir, "_rels", ".rels"),
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
      "utf8",
    );
    fs.writeFileSync(
      path.join(tempDir, "word", "_rels", "document.xml.rels"),
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
      "utf8",
    );
    fs.writeFileSync(path.join(tempDir, "word", "styles.xml"), stylesXml(), "utf8");
    fs.writeFileSync(path.join(tempDir, "word", "document.xml"), documentXml(markdown, topic), "utf8");

    const zipPath = `${outputPath}.zip`;
    if (fs.existsSync(zipPath)) fs.rmSync(zipPath, { force: true });
    if (fs.existsSync(outputPath)) fs.rmSync(outputPath, { force: true });
    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        `Compress-Archive -Path '${escapePs(path.join(tempDir, "*"))}' -DestinationPath '${escapePs(zipPath)}' -Force`,
      ],
      { stdio: "pipe" },
    );
    fs.renameSync(zipPath, outputPath);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function documentXml(markdown, topic) {
  const lines = markdown.split(/\r?\n/);
  const body = [
    paragraph(`源文件：${topic.sourceName}`, "Meta"),
    paragraph(`主题分类：${topic.category}`, "Meta"),
    paragraph(`生成时间：${new Date().toLocaleString("zh-CN")}`, "Meta"),
  ];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      body.push(paragraph(""));
    } else if (line.startsWith("### ")) {
      body.push(paragraph(line.slice(4), "Heading3"));
    } else if (line.startsWith("## ")) {
      body.push(paragraph(line.slice(3), "Heading2"));
    } else if (line.startsWith("# ")) {
      body.push(paragraph(line.slice(2), "Title"));
    } else if (/^[-*]\s+/.test(line) || /^□\s*/.test(line)) {
      body.push(paragraph(line.replace(/^[-*]\s+/, "□ "), "List"));
    } else {
      body.push(paragraph(line, "Normal"));
    }
  }

  body.push(`<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>`);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join("")}</w:body></w:document>`;
}

function paragraph(text, style = "Normal") {
  const escaped = escapeXml(text);
  const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : "";
  return `<w:p>${styleXml}<w:r><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei"/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="160" w:after="240"/></w:pPr><w:rPr><w:b/><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei"/><w:sz w:val="34"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="260" w:after="120"/></w:pPr><w:rPr><w:b/><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei"/><w:sz w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="Heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="180" w:after="80"/></w:pPr><w:rPr><w:b/><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei"/><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="List"><w:name w:val="List"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Meta"><w:name w:val="Meta"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="666666"/><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei"/><w:sz w:val="18"/></w:rPr></w:style>
</w:styles>`;
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapePs(value) {
  return String(value).replace(/'/g, "''");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
