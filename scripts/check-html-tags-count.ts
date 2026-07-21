import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, title: true, content: true, sourceFileName: true }
  });

  console.log(`数据库总文章数: ${posts.length} 篇`);

  let affectedCount = 0;
  const affectedList: Array<{ index: number; slug: string; title: string }> = [];
  const cleanList: Array<{ index: number; slug: string; title: string }> = [];

  posts.forEach((post, i) => {
    const contentStr = JSON.stringify(post.content || {});
    // Check if JSON contains raw HTML tags like <h1, <h2, <h3, <p, <img, <div
    const hasRawHtml = /<h[1-6][\s>]|<p[\s>]|<img[\s>]|<div[\s>]/.test(contentStr);

    if (hasRawHtml) {
      affectedCount++;
      affectedList.push({ index: i + 1, slug: post.slug, title: post.title });
    } else {
      cleanList.push({ index: i + 1, slug: post.slug, title: post.title });
    }
  });

  console.log(`\n=== 检查结果 ===`);
  console.log(`受 HTML 标签直接暴露影响的文章数: ${affectedCount} 篇`);
  console.log(`正常 Markdown 格式文章数: ${cleanList.length} 篇`);

  console.log(`\n受影响的文章清单 (${affectedCount} 篇):`);
  affectedList.forEach((item, idx) => {
    console.log(`${idx + 1}. [${item.slug}] ${item.title}`);
  });

  console.log(`\n正常文章清单 (${cleanList.length} 篇):`);
  cleanList.forEach((item, idx) => {
    console.log(`${idx + 1}. [${item.slug}] ${item.title}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
