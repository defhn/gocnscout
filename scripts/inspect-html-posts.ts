import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

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

async function main() {
  for (const slug of TARGET_SLUGS) {
    const post = await prisma.blogPost.findUnique({ where: { slug }, select: { slug: true, content: true } });
    if (!post) {
      console.log(`[NOT FOUND] ${slug}`);
      continue;
    }

    const rawJson = JSON.stringify(post.content, null, 2);
    // Print first 1500 chars to understand structure
    console.log(`\n========== ${slug} ==========`);
    console.log(rawJson.substring(0, 2000));
    console.log("-----");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
