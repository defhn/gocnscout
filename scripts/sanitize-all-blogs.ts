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

// Clean HTML tags and replace them with standard markdown syntax
function cleanHtmlBody(body: string): string {
  let cleaned = body.replace(/\r\n/g, "\n");

  // Remove code block wraps if the whole body is wrapped by Gemini/DeepSeek
  if (cleaned.startsWith("```markdown\n")) {
    cleaned = cleaned.substring(12);
    if (cleaned.endsWith("\n```")) {
      cleaned = cleaned.substring(0, cleaned.length - 4);
    }
  } else if (cleaned.startsWith("```html\n")) {
    cleaned = cleaned.substring(8);
    if (cleaned.endsWith("\n```")) {
      cleaned = cleaned.substring(0, cleaned.length - 4);
    }
  } else if (cleaned.startsWith("```\n")) {
    cleaned = cleaned.substring(4);
    if (cleaned.endsWith("\n```")) {
      cleaned = cleaned.substring(0, cleaned.length - 4);
    }
  }

  // Convert list items: <li class="...">content</li> to - content
  cleaned = cleaned.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => {
    // Strip inner HTML tags
    const cleanContent = content.replace(/<[^>]+>/g, "").trim();
    return `- ${cleanContent}\n`;
  });

  // Strip ul/ol wraps
  cleaned = cleaned.replace(/<ul[^>]*>/gi, "");
  cleaned = cleaned.replace(/<\/ul>/gi, "\n\n");
  cleaned = cleaned.replace(/<ol[^>]*>/gi, "");
  cleaned = cleaned.replace(/<\/ol>/gi, "\n\n");

  // Convert headings: <h2 class="...">title</h2> to ## title
  cleaned = cleaned.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n# $1\n\n");
  cleaned = cleaned.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n\n## $1\n\n");
  cleaned = cleaned.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n\n### $1\n\n");
  cleaned = cleaned.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n\n#### $1\n\n");

  // Convert paragraph wrappers: <p class="...">text</p> to paragraph block
  cleaned = cleaned.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");

  // Convert images: <img src="url" alt="alt" ... /> to ![alt](url)
  cleaned = cleaned.replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![$2]($1)\n\n");
  cleaned = cleaned.replace(/<img[^>]*alt=["']([^"']+)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![$1]($2)\n\n");
  cleaned = cleaned.replace(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "\n\n![]($1)\n\n");

  // Convert callout div containers to markdown blockquotes
  cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*bg-slate-50[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, (_, inner) => {
    const cleanInner = inner.replace(/<[^>]+>/g, "").trim();
    return `\n\n> ${cleanInner}\n\n`;
  });
  cleaned = cleaned.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "\n\n$1\n\n");

  // Convert inline styling
  cleaned = cleaned.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  cleaned = cleaned.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  cleaned = cleaned.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  cleaned = cleaned.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  cleaned = cleaned.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  cleaned = cleaned.replace(/<br\s*\/?>/gi, "\n");

  // Remove any remaining HTML tags (to ensure absolutely zero raw tags render on client side)
  cleaned = cleaned.replace(/<[^>]+>/g, "");

  // Clean excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return cleaned;
}

// Fix top level headers/frontmatter starts
function normalizeFrontMatter(content: string): string {
  let trimmed = content.trim();

  // Strip markdown wraps if the entire file was wrapped by the generator output
  if (trimmed.startsWith("```markdown\n")) {
    trimmed = trimmed.substring(12);
    if (trimmed.endsWith("\n```")) {
      trimmed = trimmed.substring(0, trimmed.length - 4);
    }
  } else if (trimmed.startsWith("```html\n")) {
    trimmed = trimmed.substring(8);
    if (trimmed.endsWith("\n```")) {
      trimmed = trimmed.substring(0, trimmed.length - 4);
    }
  } else if (trimmed.startsWith("```yaml\n")) {
    trimmed = trimmed.substring(8);
    if (trimmed.endsWith("\n```")) {
      trimmed = trimmed.substring(0, trimmed.length - 4);
    }
  }

  // Handle leading "yaml\n---\n"
  if (trimmed.startsWith("yaml\n---\n")) {
    trimmed = trimmed.substring(5);
  }
  // Handle leading "yaml\n"
  else if (trimmed.startsWith("yaml\n")) {
    trimmed = "---\n" + trimmed.substring(5);
  }
  // Handle leading "html\n---\n"
  else if (trimmed.startsWith("html\n---\n")) {
    trimmed = trimmed.substring(5);
  }
  // Handle leading "html\n"
  else if (trimmed.startsWith("html\n")) {
    trimmed = "---\n" + trimmed.substring(5);
  }
  // Handle missing leading "---" when Title is first line
  else if (trimmed.startsWith("Title:") || trimmed.startsWith("\"Title\":")) {
    trimmed = "---\n" + trimmed;
  }

  return trimmed;
}

async function main() {
  console.log("🧹 Starting complete sanitization of all blog posts...");

  const articleBase = path.resolve("seo-blog/article");
  if (!fs.existsSync(articleBase)) {
    console.log("No article directory found.");
    return;
  }

  const subdirs = fs.readdirSync(articleBase);
  let processedCount = 0;
  let dbUpdatedCount = 0;

  for (const dir of subdirs) {
    const fullDir = path.join(articleBase, dir);
    if (!fs.statSync(fullDir).isDirectory()) continue;
    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith(".md"));

    for (const f of files) {
      const filePath = path.join(fullDir, f);
      const rawContent = fs.readFileSync(filePath, "utf-8");

      // 1. Normalize frontmatter
      const normalizedContent = normalizeFrontMatter(rawContent);

      // 2. Parse frontmatter
      const { metadata, body } = parseMarkdownFrontMatter(normalizedContent);

      const slug = (metadata.Slug || metadata.slug) as string;
      if (!slug) {
        console.log(`⚠️  Skipping ${f}: slug not found in frontmatter.`);
        continue;
      }

      // 3. Clean HTML tags in the body content
      const cleanedBody = cleanHtmlBody(body);

      // 4. Save cleaned content back to local file
      let newFileContent = normalizedContent;
      if (normalizedContent.startsWith("---\n")) {
        const end = normalizedContent.indexOf("\n---\n", 4);
        if (end > 0) {
          const frontmatter = normalizedContent.slice(0, end + 5);
          newFileContent = `${frontmatter}\n${cleanedBody}\n`;
        } else {
          newFileContent = cleanedBody;
        }
      } else {
        newFileContent = cleanedBody;
      }

      fs.writeFileSync(filePath, newFileContent, "utf-8");
      processedCount++;

      // 5. Convert clean markdown to TipTap JSON structure
      const cleanDoc = markdownToBlogDocument(cleanedBody);

      // 6. Push to DB (Update the record if it exists)
      const post = await prisma.blogPost.findUnique({
        where: { slug }
      });

      if (post) {
        await prisma.blogPost.update({
          where: { slug },
          data: {
            content: cleanDoc as any,
            title: (metadata.Title || metadata.title || post.title) as string,
            updatedAt: new Date(),
          }
        });
        dbUpdatedCount++;
      } else {
        console.log(`ℹ️  Slug [${slug}] not found in database, skipped DB update.`);
      }
    }
  }

  console.log(`\n🎉 Sanitization Complete!`);
  console.log(`- Processed & saved local markdown files: ${processedCount}`);
  console.log(`- Updated database blog post records: ${dbUpdatedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
