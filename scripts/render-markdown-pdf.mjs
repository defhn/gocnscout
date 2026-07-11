import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { marked } from "marked";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const inputs = process.argv.slice(2);

if (inputs.length === 0) {
  throw new Error("Pass at least one Markdown file path.");
}

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  args: ["--disable-gpu", "--no-sandbox"],
});

try {
  for (const input of inputs) {
    const absoluteInput = path.resolve(input);
    const markdown = await fs.readFile(absoluteInput, "utf8");
    const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(input, ".md");
    const body = await marked.parse(markdown, { gfm: true });
    const htmlPath = absoluteInput.replace(/\.md$/i, ".pdf-source.html");
    const pdfPath = absoluteInput.replace(/\.md$/i, ".pdf");

    const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 16mm 14mm 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #172033;
      font-family: "Segoe UI", "Microsoft YaHei", "Noto Sans CJK SC", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.62;
      overflow-wrap: anywhere;
    }
    h1, h2, h3, h4 { color: #0f3f3b; line-height: 1.28; break-after: avoid; }
    h1 { font-size: 24pt; margin: 0 0 18pt; padding-bottom: 10pt; border-bottom: 2px solid #179b8d; }
    h2 { font-size: 17pt; margin: 22pt 0 9pt; padding-bottom: 4pt; border-bottom: 1px solid #cbdedb; }
    h3 { font-size: 13pt; margin: 16pt 0 6pt; }
    h4 { font-size: 11pt; margin: 12pt 0 5pt; }
    p { margin: 0 0 8pt; orphans: 3; widows: 3; }
    ul, ol { margin: 4pt 0 10pt 20pt; padding: 0; }
    li { margin: 2pt 0; }
    blockquote { margin: 10pt 0; padding: 7pt 11pt; border-left: 4px solid #179b8d; background: #f1f8f7; color: #304b49; }
    blockquote p:last-child { margin-bottom: 0; }
    table { width: 100%; margin: 10pt 0 14pt; border-collapse: collapse; font-size: 8.6pt; break-inside: auto; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    th, td { border: 1px solid #b9ceca; padding: 5pt 6pt; text-align: left; vertical-align: top; }
    th { background: #e6f3f1; color: #123f3b; font-weight: 700; }
    tr:nth-child(even) td { background: #f8fbfb; }
    code { font-family: Consolas, "Courier New", monospace; font-size: 9pt; background: #eef3f5; padding: 1pt 3pt; border-radius: 3px; }
    pre { margin: 9pt 0 12pt; padding: 9pt; background: #13212d; color: #edf7f6; border-radius: 5px; white-space: pre-wrap; break-inside: avoid; }
    pre code { color: inherit; background: transparent; padding: 0; }
    a { color: #087f74; text-decoration: none; }
    hr { border: 0; border-top: 1px solid #c9d8d6; margin: 18pt 0; }
    strong { color: #102f3a; }
  </style>
</head>
<body>${body}</body>
</html>`;

    await fs.writeFile(htmlPath, html, "utf8");
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: '<div style="width:100%;font-size:8px;color:#718096;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { top: "16mm", right: "14mm", bottom: "18mm", left: "14mm" },
    });
    await page.close();
    await fs.unlink(htmlPath);
    process.stdout.write(`${pdfPath}\n`);
  }
} finally {
  await browser.close();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}
