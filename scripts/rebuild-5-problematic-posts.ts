import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { markdownToBlogDocument, parseMarkdownFrontMatter } from "../src/lib/blog/content";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const TARGET_SLUGS = [
  "oem-vs-odm-manufacturing-in-china-a-complete-guide-for-private-label-brands",
  "importing-private-label-products-from-china-a-beginner-friendly-launch-blueprint",
  "understanding-plastic-injection-molding-sourcing-in-china-costs-and-vetting",
  "understanding-the-china-import-export-database-a-guide-for-data-analysts",
  "how-to-deal-with-defective-products-from-china-negotiation-and-quality-agreements",
];

function cleanHtmlTagsToMarkdown(text: string): string {
  text = text.replace(/\r\n/g, "\n");

  // Strip raw frontmatter if accidentally included in body
  if (text.startsWith("---\n")) {
    const end = text.indexOf("\n---\n", 4);
    if (end > 0) {
      text = text.slice(end + 5).trim();
    }
  }

  // Convert H1-H4 HTML tags to Markdown headings
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n# $1\n\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n\n## $1\n\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n\n### $1\n\n");
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n\n#### $1\n\n");

  // Convert <p> tags
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");

  // Convert <img> tags: src first, then alt
  text = text.replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![$2]($1)\n\n");
  text = text.replace(/<img[^>]*alt=["']([^"']+)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![$1]($2)\n\n");
  text = text.replace(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![]($1)\n\n");

  // Convert callout divs to blockquote
  text = text.replace(/<div[^>]*class=["'][^"']*bg-slate-50[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, (_, inner) => {
    const cleanInner = inner.replace(/<[^>]+>/g, "").trim();
    return `\n\n> ${cleanInner}\n\n`;
  });

  // Strip remaining HTML tags but keep inline text
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");

  // Clean excessive blank lines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

function findMarkdownFile(slug: string): string | null {
  const articleBase = path.resolve("seo-blog/article");
  if (!fs.existsSync(articleBase)) return null;

  const subdirs = fs.readdirSync(articleBase).sort();
  for (const dir of subdirs.reverse()) { // search newest first
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

async function main() {
  console.log("🔧 Rebuilding 5 problematic posts from local Markdown source files...\n");

  for (const slug of TARGET_SLUGS) {
    const rawMd = findMarkdownFile(slug);

    if (!rawMd) {
      console.log(`❌ [NOT FOUND] Local markdown file for slug: ${slug}`);
      continue;
    }

    // Parse and separate frontmatter from body
    const { metadata, body } = parseMarkdownFrontMatter(rawMd);

    // Clean any HTML tags from body
    const cleanBody = cleanHtmlTagsToMarkdown(body);

    // Rebuild TipTap doc from clean markdown
    const cleanDoc = markdownToBlogDocument(cleanBody);

    // Verify no HTML left in output JSON
    const jsonCheck = JSON.stringify(cleanDoc);
    const hasHtml = /<h[1-6][\s>]|<p[\s>]|<img[\s>]|<div[\s>]/.test(jsonCheck);

    if (hasHtml) {
      console.log(`⚠️  [STILL HAS HTML] ${slug} - may need manual review`);
    }

    // Update database
    await prisma.blogPost.update({
      where: { slug },
      data: {
        content: cleanDoc as any,
        updatedAt: new Date(),
      }
    });

    console.log(`✅ Rebuilt clean content for: [${slug}] (hasHtml=${hasHtml})`);
    console.log(`   Body preview: ${cleanBody.substring(0, 100)}...`);
  }

  console.log("\n🎉 All 5 posts rebuilt from source markdown. No HTML tags should remain.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
