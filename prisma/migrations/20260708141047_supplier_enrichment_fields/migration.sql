-- AlterTable
ALTER TABLE "CityPage" ADD COLUMN     "cityCn" TEXT,
ADD COLUMN     "cityEn" TEXT,
ADD COLUMN     "industrialCluster" TEXT,
ADD COLUMN     "provinceCn" TEXT,
ADD COLUMN     "provinceEn" TEXT,
ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "IndustryPage" ADD COLUMN     "industryNameCn" TEXT,
ADD COLUMN     "industryNameEn" TEXT;

-- AlterTable
ALTER TABLE "ProductKeywordPage" ADD COLUMN     "clusterName" TEXT,
ADD COLUMN     "keywordCn" TEXT,
ADD COLUMN     "keywordEn" TEXT;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "capabilityScore" INTEGER,
ADD COLUMN     "cityCn" TEXT,
ADD COLUMN     "cityEn" TEXT,
ADD COLUMN     "citySlug" TEXT,
ADD COLUMN     "companyNatureCn" TEXT,
ADD COLUMN     "companyNatureCode" TEXT,
ADD COLUMN     "companyNatureEn" TEXT,
ADD COLUMN     "companySizeCn" TEXT,
ADD COLUMN     "companySizeCode" TEXT,
ADD COLUMN     "companySizeEn" TEXT,
ADD COLUMN     "companyTypeCn" TEXT,
ADD COLUMN     "companyTypeCode" TEXT,
ADD COLUMN     "companyTypeEn" TEXT,
ADD COLUMN     "dataQualityScore" INTEGER,
ADD COLUMN     "exhibitionSessionCount" INTEGER,
ADD COLUMN     "exhibitionSessions" INTEGER[],
ADD COLUMN     "exhibitorNameCn" TEXT,
ADD COLUMN     "exhibitorNameEn" TEXT,
ADD COLUMN     "firstExhibitionSession" INTEGER,
ADD COLUMN     "foundedYearRange" TEXT,
ADD COLUMN     "industrialCluster" TEXT,
ADD COLUMN     "industryNameCn" TEXT,
ADD COLUMN     "industryNameEn" TEXT,
ADD COLUMN     "industrySlug" TEXT,
ADD COLUMN     "keywordsTextCn" TEXT,
ADD COLUMN     "keywordsTextEn" TEXT,
ADD COLUMN     "lastExhibitionSession" INTEGER,
ADD COLUMN     "productKeywordsCn" TEXT[],
ADD COLUMN     "productKeywordsEn" TEXT[],
ADD COLUMN     "productsTextCn" TEXT,
ADD COLUMN     "productsTextEn" TEXT,
ADD COLUMN     "provinceCn" TEXT,
ADD COLUMN     "provinceCode" TEXT,
ADD COLUMN     "provinceEn" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "registeredCapitalRange" TEXT,
ADD COLUMN     "registeredCapitalRaw" TEXT,
ADD COLUMN     "registeredCapitalRmb" DECIMAL(18,2),
ADD COLUMN     "searchTextCn" TEXT,
ADD COLUMN     "searchTextEn" TEXT,
ADD COLUMN     "sourceFileName" TEXT,
ADD COLUMN     "sourceRowHash" TEXT,
ADD COLUMN     "sourceRowNumber" INTEGER,
ADD COLUMN     "sourceSheetName" TEXT,
ADD COLUMN     "stabilityScore" INTEGER,
ADD COLUMN     "tradeModesRaw" TEXT,
ADD COLUMN     "websiteDomain" TEXT,
ADD COLUMN     "websiteRaw" TEXT,
ADD COLUMN     "websiteStatus" TEXT,
ADD COLUMN     "websiteType" TEXT;

-- AlterTable
ALTER TABLE "SupplierPrivateData" ADD COLUMN     "contactPersonCn" TEXT,
ADD COLUMN     "contactPersonEn" TEXT,
ADD COLUMN     "fullAddressCn" TEXT,
ADD COLUMN     "fullAddressEn" TEXT;

-- CreateTable
CREATE TABLE "SupplierSourceRaw" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT,
    "sourceFileName" TEXT NOT NULL,
    "sourceSheetName" TEXT NOT NULL,
    "sourceRowNumber" INTEGER NOT NULL,
    "sourceRowHash" TEXT NOT NULL,
    "rawJson" JSONB NOT NULL,
    "cleanedJson" JSONB,
    "translatedJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "deepseekAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastProcessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierSourceRaw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierSignal" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "innovationAward" BOOLEAN NOT NULL DEFAULT false,
    "cantonFairDesignAward" BOOLEAN NOT NULL DEFAULT false,
    "multiSessionExhibitor" BOOLEAN NOT NULL DEFAULT false,
    "brandExhibitor" BOOLEAN NOT NULL DEFAULT false,
    "chinaTimeHonoredBrand" BOOLEAN NOT NULL DEFAULT false,
    "ruralRevitalizationExhibitor" BOOLEAN NOT NULL DEFAULT false,
    "newExhibitor" BOOLEAN NOT NULL DEFAULT false,
    "specializedSpecialNewEnterprise" BOOLEAN NOT NULL DEFAULT false,
    "greenAwardExhibitor" BOOLEAN NOT NULL DEFAULT false,
    "customsCertifiedExhibitor" BOOLEAN NOT NULL DEFAULT false,
    "highTechEnterprise" BOOLEAN NOT NULL DEFAULT false,
    "hasAnyAward" BOOLEAN NOT NULL DEFAULT false,
    "hasCertificationSignal" BOOLEAN NOT NULL DEFAULT false,
    "hasBrandSignal" BOOLEAN NOT NULL DEFAULT false,
    "hasInnovationSignal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierProductKeyword" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "keywordCn" TEXT,
    "keywordEn" TEXT NOT NULL,
    "keywordSlug" TEXT NOT NULL,
    "sourceField" TEXT NOT NULL,
    "clusterName" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierProductKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierSourceRaw_supplierId_key" ON "SupplierSourceRaw"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierSourceRaw_sourceRowHash_key" ON "SupplierSourceRaw"("sourceRowHash");

-- CreateIndex
CREATE INDEX "SupplierSourceRaw_status_idx" ON "SupplierSourceRaw"("status");

-- CreateIndex
CREATE INDEX "SupplierSourceRaw_sourceRowNumber_idx" ON "SupplierSourceRaw"("sourceRowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierSignal_supplierId_key" ON "SupplierSignal"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierSignal_multiSessionExhibitor_idx" ON "SupplierSignal"("multiSessionExhibitor");

-- CreateIndex
CREATE INDEX "SupplierSignal_brandExhibitor_idx" ON "SupplierSignal"("brandExhibitor");

-- CreateIndex
CREATE INDEX "SupplierSignal_newExhibitor_idx" ON "SupplierSignal"("newExhibitor");

-- CreateIndex
CREATE INDEX "SupplierSignal_specializedSpecialNewEnterprise_idx" ON "SupplierSignal"("specializedSpecialNewEnterprise");

-- CreateIndex
CREATE INDEX "SupplierSignal_customsCertifiedExhibitor_idx" ON "SupplierSignal"("customsCertifiedExhibitor");

-- CreateIndex
CREATE INDEX "SupplierSignal_highTechEnterprise_idx" ON "SupplierSignal"("highTechEnterprise");

-- CreateIndex
CREATE INDEX "SupplierProductKeyword_keywordEn_idx" ON "SupplierProductKeyword"("keywordEn");

-- CreateIndex
CREATE INDEX "SupplierProductKeyword_keywordSlug_idx" ON "SupplierProductKeyword"("keywordSlug");

-- CreateIndex
CREATE INDEX "SupplierProductKeyword_sourceField_idx" ON "SupplierProductKeyword"("sourceField");

-- CreateIndex
CREATE INDEX "SupplierProductKeyword_clusterName_idx" ON "SupplierProductKeyword"("clusterName");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProductKeyword_supplierId_keywordSlug_sourceField_key" ON "SupplierProductKeyword"("supplierId", "keywordSlug", "sourceField");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_sourceRowHash_key" ON "Supplier"("sourceRowHash");

-- CreateIndex
CREATE INDEX "Supplier_industryNameEn_idx" ON "Supplier"("industryNameEn");

-- CreateIndex
CREATE INDEX "Supplier_industrySlug_idx" ON "Supplier"("industrySlug");

-- CreateIndex
CREATE INDEX "Supplier_provinceEn_cityEn_idx" ON "Supplier"("provinceEn", "cityEn");

-- CreateIndex
CREATE INDEX "Supplier_region_idx" ON "Supplier"("region");

-- CreateIndex
CREATE INDEX "Supplier_companySizeCode_idx" ON "Supplier"("companySizeCode");

-- CreateIndex
CREATE INDEX "Supplier_companyTypeCode_idx" ON "Supplier"("companyTypeCode");

-- CreateIndex
CREATE INDEX "Supplier_companyNatureCode_idx" ON "Supplier"("companyNatureCode");

-- CreateIndex
CREATE INDEX "Supplier_websiteStatus_idx" ON "Supplier"("websiteStatus");

-- CreateIndex
CREATE INDEX "Supplier_websiteType_idx" ON "Supplier"("websiteType");

-- CreateIndex
CREATE INDEX "Supplier_foundedYearRange_idx" ON "Supplier"("foundedYearRange");

-- CreateIndex
CREATE INDEX "Supplier_registeredCapitalRange_idx" ON "Supplier"("registeredCapitalRange");

-- CreateIndex
CREATE INDEX "Supplier_lastExhibitionSession_idx" ON "Supplier"("lastExhibitionSession");

-- CreateIndex
CREATE INDEX "Supplier_exhibitionSessionCount_idx" ON "Supplier"("exhibitionSessionCount");

-- AddForeignKey
ALTER TABLE "SupplierSourceRaw" ADD CONSTRAINT "SupplierSourceRaw_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierSignal" ADD CONSTRAINT "SupplierSignal_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProductKeyword" ADD CONSTRAINT "SupplierProductKeyword_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

