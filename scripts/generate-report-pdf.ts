import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { marked } from "marked";

dotenv.config({ path: ".env.local" });

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

async function run() {
  const { prisma } = await import("../src/lib/db");

  const categoryName = "Household Items";
  const categorySlug = "household-items";

  // 1. Fetch total count
  const totalCount = await prisma.supplier.count({
    where: { industryName: categoryName },
  });

  // 2. Fetch top 100 suppliers ordered by exhibition sessions count (stability indicator)
  const suppliers = await prisma.supplier.findMany({
    where: { industryName: categoryName },
    take: 100,
    orderBy: { exhibitionSessionCount: "desc" },
  });

  // 3. Build Markdown content
  let md = `# GoCNScout Sourcing Intelligence Report: ${categoryName}\n\n`;
  md += `## Exporter Directory Guide & Industry Clusters\n\n`;
  
  md += `This report outlines verified Chinese exporters registered for international exhibitions under the **${categoryName}** category. It compiles attendance density, manufacturing clusters, and lists the **top 100 stable exporters** sorted by historical exhibition session counts.\n\n`;
  
  md += `### Report Metadata & Statistics\n\n`;
  md += `- **Sector**: ${categoryName}\n`;
  md += `- **Total Exporters in Database**: ${totalCount.toLocaleString()}\n`;
  md += `- **Vetted Directory Sample**: Top 100 Exhibiting Suppliers\n`;
  md += `- **Database Source**: Sourced from official export database registry.\n\n`;

  md += `---\n\n`;
  md += `## Section 1: Top 100 Exhibitor Directory\n\n`;
  md += `| Company Name | Location | Capital | Est. Year | Exhibition Sessions | Main Products |\n`;
  md += `|---|---|---|---|---|---|\n`;

  for (const s of suppliers) {
    const name = s.exhibitorNameEn || s.exhibitorName || "Unknown Exporter";
    const cnName = s.exhibitorNameCn ? `<br><span style="font-size: 8pt; color: #718096;">${s.exhibitorNameCn}</span>` : "";
    const location = `${s.city || s.cityEn || ""}, ${s.province || s.provinceEn || ""}`;
    const capital = s.registeredCapital || "N/A";
    const year = s.foundedYear ? String(s.foundedYear) : "N/A";
    const sessionsCount = s.exhibitionSessionCount ? `${s.exhibitionSessionCount} sessions` : "N/A";
    const products = s.productsTextEn ? s.productsTextEn.slice(0, 100) + (s.productsTextEn.length > 100 ? "..." : "") : "N/A";

    md += `| **${name}**${cnName} | ${location} | ${capital} | ${year} | ${sessionsCount} | ${products} |\n`;
  }

  md += `\n\n---\n\n`;
  md += `## Section 2: Supply Chain Vetting & Risk Audit Checklist\n\n`;
  md += `Before committing deposits or signing sales contracts, perform these compliance audit checks:\n\n`;
  md += `1. **Unified Social Credit Code Verification**: Ensure the supplier provides their 18-digit Unified Social Credit Code. Verify it directly inside the National Enterprise Credit Information Publicity System (NECIPS).\n`;
  md += `2. **Company Name Consistency**: Ensure the contract seal matches the official Chinese legal name, not their English trading name.\n`;
  md += `3. **Exhibition History Matching**: Stable exhibitors (attending 5+ sessions) have a physical footprint and are highly unlikely to be temporary scams.\n`;
  md += `4. **Registered Capital Check**: Ensure the registered capital aligns with their manufacturing capacity. Low capital (e.g., <500,000 RMB) usually indicates a small trader.\n`;

  // 4. Convert Markdown to PDF
  const title = `Sourcing Intelligence Report: ${categoryName}`;
  const body = await marked.parse(md, { gfm: true });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 16mm 14mm 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #172033;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    h1, h2, h3, h4 { color: #0f3f3b; line-height: 1.25; break-after: avoid; }
    h1 { font-size: 22pt; margin: 0 0 16pt; padding-bottom: 8pt; border-bottom: 2px solid #179b8d; }
    h2 { font-size: 15pt; margin: 20pt 0 8pt; padding-bottom: 4pt; border-bottom: 1px solid #cbdedb; }
    h3 { font-size: 12pt; margin: 14pt 0 5pt; }
    p { margin: 0 0 6pt; orphans: 3; widows: 3; }
    table { width: 100%; margin: 8pt 0 12pt; border-collapse: collapse; font-size: 8pt; break-inside: auto; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    th, td { border: 1px solid #b9ceca; padding: 4pt 5pt; text-align: left; vertical-align: top; }
    th { background: #e6f3f1; color: #123f3b; font-weight: 700; }
    tr:nth-child(even) td { background: #f8fbfb; }
  </style>
</head>
<body>${body}</body>
</html>`;

  const reportDir = path.resolve("./public/reports");
  await fs.mkdir(reportDir, { recursive: true });

  const htmlPath = path.join(reportDir, `${categorySlug}-sourcing-report.pdf-source.html`);
  const pdfPath = path.join(reportDir, `${categorySlug}-sourcing-report.pdf`);

  await fs.writeFile(htmlPath, html, "utf8");

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--disable-gpu", "--no-sandbox"],
  });

  try {
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
    console.log("PDF generated successfully at:", pdfPath);
  } finally {
    await browser.close();
    await fs.unlink(htmlPath);
  }
}

run();
