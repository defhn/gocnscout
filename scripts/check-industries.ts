import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
async function run() {
  const { prisma } = await import("../src/lib/db");
  const industries = await prisma.industryPage.findMany({
    select: { slug: true, industryName: true, supplierCount: true },
    orderBy: { supplierCount: "desc" }
  });
  console.log("INDUSTRIES_DATA:", JSON.stringify(industries, null, 2));
}
run();
