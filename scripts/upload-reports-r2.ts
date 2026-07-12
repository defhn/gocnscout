import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";

dotenv.config({ path: ".env.local" });

function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = "Timeout"): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

async function run() {
  const { uploadPrivateFile } = await import("../src/server/storage");
  const { prisma } = await import("../src/lib/db");

  const reportsDir = path.resolve("./public/reports");
  const files = await fs.readdir(reportsDir);
  const pdfFiles = files.filter(f => f.endsWith(".pdf"));

  console.log(`Found ${pdfFiles.length} PDF files in public/reports/`);

  let count = 0;
  for (const file of pdfFiles) {
    count++;
    const filePath = path.join(reportsDir, file);
    const slug = file.replace("-sourcing-report.pdf", "");
    
    console.log(`[${count}/${pdfFiles.length}] Processing file: ${file} (slug: ${slug})...`);
    
    // Read file buffer
    const buffer = await fs.readFile(filePath);
    const r2Key = `reports/${slug}-sourcing-report.pdf`;
    
    // Try to upload with retries & 15-second timeout per attempt
    let uploaded = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`  - Uploading to R2 (Attempt ${attempt}/3)...`);
        await withTimeout(
          uploadPrivateFile(r2Key, buffer, "application/pdf"),
          15000,
          "Cloudflare R2 Upload Timeout"
        );
        uploaded = true;
        break;
      } catch (err: any) {
        console.error(`  - Attempt ${attempt} failed: ${err.message}`);
        if (attempt < 3) {
          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!uploaded) {
      console.error(`[ERROR] All upload attempts failed for: ${file}. Skipping database update.`);
      continue;
    }

    console.log(`  - Uploaded successfully to R2!`);

    // Update database Report record
    try {
      const updated = await prisma.report.updateMany({
        where: { slug },
        data: {
          fileKey: r2Key,
          fileName: file,
          fileSizeBytes: buffer.byteLength,
          status: "PUBLISHED",
          publishedAt: new Date(),
        }
      });
      console.log(`  - Database records updated: ${updated.count}`);
    } catch (dbErr: any) {
      console.error(`  - DB Sync failed:`, dbErr.message);
    }
  }

  console.log("\nAll PDF uploads completed successfully!");
}

run().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
