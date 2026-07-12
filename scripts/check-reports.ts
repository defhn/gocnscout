import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
async function run() {
  const { prisma } = await import("../src/lib/db");
  const reports = await prisma.report.findMany();
  console.log("REPORTS_COUNT:", reports.length);
  console.log("REPORTS_DATA:", JSON.stringify(reports, null, 2));
}
run();
