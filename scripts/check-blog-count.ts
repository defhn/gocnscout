import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dbCount = await prisma.blogPost.count();
  const dbPublishedCount = await prisma.blogPost.count({ where: { status: "PUBLISHED" } });
  console.log(`FINAL_BLOG_COUNT=${dbPublishedCount}`);
  console.log(`TOTAL_BLOG_ROWS=${dbCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
