ALTER TABLE "BlogPost"
ADD COLUMN "metadata" JSONB,
ADD COLUMN "trafficSource" TEXT NOT NULL DEFAULT 'SEARCH',
ADD COLUMN "searchViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "linkedinViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "xViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "youtubeViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "otherViews" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "BlogPostDailyView"
ADD COLUMN "linkedinViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "xViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "youtubeViews" INTEGER NOT NULL DEFAULT 0;

UPDATE "BlogPostDailyView"
SET "linkedinViews" = "socialViews"
WHERE "linkedinViews" = 0 AND "socialViews" > 0;

CREATE TABLE "BlogSeoLog" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "postTitle" TEXT NOT NULL,
    "postSlug" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogSeoLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogGscKeywordStat" (
    "id" TEXT NOT NULL,
    "postSlug" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "keyword" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlogGscKeywordStat_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BlogSeoLog_postId_idx" ON "BlogSeoLog"("postId");
CREATE INDEX "BlogSeoLog_createdAt_idx" ON "BlogSeoLog"("createdAt");
CREATE UNIQUE INDEX "BlogGscKeywordStat_postSlug_date_keyword_key" ON "BlogGscKeywordStat"("postSlug", "date", "keyword");
CREATE INDEX "BlogGscKeywordStat_postSlug_idx" ON "BlogGscKeywordStat"("postSlug");
CREATE INDEX "BlogGscKeywordStat_date_idx" ON "BlogGscKeywordStat"("date");

ALTER TABLE "BlogSeoLog" ADD CONSTRAINT "BlogSeoLog_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogGscKeywordStat" ADD CONSTRAINT "BlogGscKeywordStat_postSlug_fkey" FOREIGN KEY ("postSlug") REFERENCES "BlogPost"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
