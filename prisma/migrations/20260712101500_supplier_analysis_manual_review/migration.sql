CREATE TYPE "AnalysisStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "AnalysisSourceType" AS ENUM ('ALIBABA_STORE', 'WEBSITE');
CREATE TYPE "ManualReviewPackageCode" AS ENUM ('IDENTITY_SINGLE', 'IDENTITY_BUNDLE', 'DECISION_SINGLE', 'DECISION_BUNDLE');
CREATE TYPE "ManualReviewStatus" AS ENUM ('CHECKOUT_CREATED', 'PAID', 'SUBMITTED', 'IN_REVIEW', 'DELIVERED', 'CANCELED', 'REFUNDED');

CREATE TABLE "SupplierAnalysis" (
  "id" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "normalizedUrl" TEXT NOT NULL,
  "sourceType" "AnalysisSourceType" NOT NULL,
  "status" "AnalysisStatus" NOT NULL DEFAULT 'PROCESSING',
  "companyName" TEXT,
  "resultJson" JSONB,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SupplierAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManualReviewRequest" (
  "id" TEXT NOT NULL,
  "analysisId" TEXT,
  "packageCode" "ManualReviewPackageCode" NOT NULL,
  "status" "ManualReviewStatus" NOT NULL DEFAULT 'CHECKOUT_CREATED',
  "supplierUrl" TEXT NOT NULL,
  "additionalSupplierUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "targetProduct" TEXT,
  "destinationMarket" TEXT,
  "procurementStage" TEXT,
  "estimatedOrderValue" TEXT,
  "notes" TEXT,
  "buyerName" TEXT,
  "buyerEmail" TEXT,
  "companyName" TEXT,
  "stripeCheckoutSession" TEXT,
  "stripePaymentIntent" TEXT,
  "amountUsdCents" INTEGER NOT NULL,
  "paidAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ManualReviewRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupplierAnalysis_sourceType_idx" ON "SupplierAnalysis"("sourceType");
CREATE INDEX "SupplierAnalysis_status_idx" ON "SupplierAnalysis"("status");
CREATE INDEX "SupplierAnalysis_createdAt_idx" ON "SupplierAnalysis"("createdAt");
CREATE UNIQUE INDEX "ManualReviewRequest_stripeCheckoutSession_key" ON "ManualReviewRequest"("stripeCheckoutSession");
CREATE INDEX "ManualReviewRequest_packageCode_idx" ON "ManualReviewRequest"("packageCode");
CREATE INDEX "ManualReviewRequest_status_idx" ON "ManualReviewRequest"("status");
CREATE INDEX "ManualReviewRequest_createdAt_idx" ON "ManualReviewRequest"("createdAt");

ALTER TABLE "ManualReviewRequest" ADD CONSTRAINT "ManualReviewRequest_analysisId_fkey"
  FOREIGN KEY ("analysisId") REFERENCES "SupplierAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
