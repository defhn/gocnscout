import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";

dotenv.config({ path: ".env.local" });

async function main() {
  const { prisma } = await import("../src/lib/db");

  const reports = await prisma.report.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  let mdContent = `# 📚 gocnscout - Scribd Upload SEO Directory Catalog

This catalog outlines the perfect SEO titles, descriptions, and file details for uploading the 49 generated sample PDFs to Scribd, SlideShare, and other document-sharing networks.

---

`;

  let count = 0;
  for (const report of reports) {
    count++;
    const name = report.industryName || "Unknown Industry";
    const slug = report.slug;
    const reportId = report.id;

    const totalCount = await prisma.supplier.count({
      where: { industryName: name },
    });

    const isLess = totalCount < 100;

    const localFileName = `${slug}-sample-report.pdf`;
    const recommendedTitle = `China ${name} Manufacturers Directory & Sourcing Report 2026 (Free Preview)`;
    
    const recommendedDesc = `Download the free preview PDF directory of verified ${name.toLowerCase()} manufacturers and factories in China. This sourcing intelligence report analyzes regional manufacturing clusters, Unified Social Credit Codes (USCC), and corporate registration info. Access the full vetted directory of the ${isLess ? `all ${totalCount}` : `top 100`} stable exporters at: https://gocnscout.com/reports/${slug}`;

    const tags = `china sourcing, ${name.toLowerCase()} suppliers, factory directory, supplier verification, verified manufacturers`;

    mdContent += `### [${count}/49] ${name}

* **Local File Path**: \`public/reports/samples/${localFileName}\`
* **Recommended Scribd Title**: \`${recommendedTitle}\`
* **Direct Landing URL**: [https://gocnscout.com/reports/${slug}](https://gocnscout.com/reports/${slug})
* **Stripe Checkout URL**: [https://gocnscout.com/api/reports/${reportId}/checkout](https://gocnscout.com/api/reports/${reportId}/checkout)
* **Scribd Document Tags (Keywords)**: \`${tags}\`
* **Recommended Scribd Description**:
  \`\`\`text
  ${recommendedDesc}
  \`\`\`

---

`;
  }

  const outputPath = path.resolve("./public/reports/samples/scribd_upload_catalog.md");
  await fs.writeFile(outputPath, mdContent, "utf8");
  console.log(`[SUCCESS] Generated Scribd Catalog Markdown at: ${outputPath}`);
}

main().catch(console.error);
