import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { markdownToBlogDocument, parseMarkdownFrontMatter } from "../src/lib/blog/content";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function cleanHtmlTagsToMarkdown(rawContent: string): string {
  let text = rawContent;

  text = text.replace(/\r\n/g, "\n");

  // Remove HTML wrappers like <h2 class="...">Title</h2> -> ## Title
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n# $1\n\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n\n## $1\n\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n\n### $1\n\n");
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n\n#### $1\n\n");
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "\n\n$1\n\n");

  // Convert <img src="URL" alt="ALT" ... /> -> ![ALT](URL)
  text = text.replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![$2]($1)\n\n");
  text = text.replace(/<img[^>]*alt=["']([^"']+)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![$1]($2)\n\n");
  text = text.replace(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![]($1)\n\n");

  // Convert Pro-Tip boxes <div class="...">...</div> -> blockquote > **Pro Tip**: ...
  text = text.replace(/<div[^>]*class=["'][^"']*bg-slate-50[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, (_, inner) => {
    const cleanInner = inner.replace(/<[^>]+>/g, "").trim();
    return `\n\n> ${cleanInner}\n\n`;
  });

  // Strip generic DIVs
  text = text.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "\n\n$1\n\n");

  // Inline styling tags
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Remove leftover tags
  text = text.replace(/<\/(h[1-6]|p|div|span|strong|em)>/gi, "");

  // Clean excessive blank lines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

function extractMarkdownFromDoc(doc: any): string {
  if (!doc) return "";
  if (typeof doc === "string") return doc;

  let mdParts: string[] = [];

  function traverseNode(node: any) {
    if (!node) return;
    if (node.type === "text" && node.text) {
      mdParts.push(node.text);
    } else if (node.type === "paragraph") {
      if (node.content) {
        node.content.forEach(traverseNode);
      }
      mdParts.push("\n\n");
    } else if (node.content) {
      node.content.forEach(traverseNode);
    }
  }

  traverseNode(doc);
  return mdParts.join("");
}

async function main() {
  console.log("🛠️ 1. Sanitizing database blog posts...");

  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, title: true, content: true }
  });

  let dbFixedCount = 0;

  for (const post of posts) {
    const rawText = extractMarkdownFromDoc(post.content);
    const hasRawHtml = /<h[1-6][\s>]|<p[\s>]|<img[\s>]|<div[\s>]/.test(rawText);

    if (hasRawHtml) {
      const cleanedMd = cleanHtmlTagsToMarkdown(rawText);
      const cleanDoc = markdownToBlogDocument(cleanedMd);

      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          content: cleanDoc as any,
          updatedAt: new Date(),
        }
      });

      dbFixedCount++;
    }
  }

  console.log(`✅ Database Sanitization Complete! Fixed ${dbFixedCount} posts.`);

  console.log("\n🛠️ 2. Sanitizing local Markdown files in seo-blog/article/...");
  const articleBase = path.resolve("seo-blog/article");
  let fileFixedCount = 0;

  if (fs.existsSync(articleBase)) {
    const subdirs = fs.readdirSync(articleBase);
    for (const dir of subdirs) {
      const fullDir = path.join(articleBase, dir);
      if (!fs.statSync(fullDir).isDirectory()) continue;
      const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".md"));
      for (const f of files) {
        const filePath = path.join(fullDir, f);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        if (/<h[1-6][\s>]|<p[\s>]|<img[\s>]|<div[\s>]/.test(fileContent)) {
          const { metadata, body } = parseMarkdownFrontMatter(fileContent);
          const cleanedBody = cleanHtmlTagsToMarkdown(body);
          
          // Reconstruct file with frontmatter
          let newContent = fileContent;
          if (fileContent.startsWith("---\n")) {
            const end = fileContent.indexOf("\n---\n", 4);
            if (end > 0) {
              const frontmatter = fileContent.slice(0, end + 5);
              newContent = `${frontmatter}\n${cleanedBody}\n`;
            } else {
              newContent = cleanedBody;
            }
          } else {
            newContent = cleanedBody;
          }

          fs.writeFileSync(filePath, newContent, "utf-8");
          fileFixedCount++;
        }
      }
    }
  }

  console.log(`✅ File Sanitization Complete! Fixed ${fileFixedCount} local markdown files.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
