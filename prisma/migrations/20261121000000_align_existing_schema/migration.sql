-- Align fresh installations with the current Prisma schema and existing database.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billingInterval" "BillingInterval" DEFAULT 'MONTH';
ALTER TABLE "SupplierAnalysis" ADD COLUMN IF NOT EXISTS "userId" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SupplierAnalysis_userId_fkey' AND conrelid = '"SupplierAnalysis"'::regclass) THEN
    ALTER TABLE "SupplierAnalysis" ADD CONSTRAINT "SupplierAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
-- Keep any legacy counter data before removing the obsolete column.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'BlogPostDailyView' AND column_name = 'socialViews') THEN
    UPDATE "BlogPostDailyView" SET "linkedinViews" = "socialViews" WHERE "linkedinViews" = 0 AND "socialViews" > 0;
    ALTER TABLE "BlogPostDailyView" DROP COLUMN "socialViews";
  END IF;
END $$;
