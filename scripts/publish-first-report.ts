import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { prisma } = await import("../src/lib/db");

  const slug = "household-items";
  const title = "Household Items Sourcing Intelligence Report";
  const type = "FULL"; // Standard report format
  const priceUsdCents = 9900; // $99.00 USD
  const industryName = "Household Items";
  const description = "A comprehensive market intelligence guide analyzing 1,519 Chinese household items exporters. Includes a pre-vetted list of the top 100 stable manufacturers sorted by historical exhibition session counts, key regional hubs, and buyer risk checklists.";
  const fileKey = "/reports/household-items-sourcing-report.pdf";

  const report = await prisma.report.upsert({
    where: { slug },
    update: {
      title,
      type,
      priceUsdCents,
      industryName,
      description,
      fileKey,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    create: {
      slug,
      title,
      type,
      priceUsdCents,
      industryName,
      description,
      fileKey,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  console.log("SUCCESS: Published first PDF report in database:", JSON.stringify(report, null, 2));
}

run();
