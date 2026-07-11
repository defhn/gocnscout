CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "coverImage" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "category" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "authorId" TEXT,
    "authorName" TEXT,
    "sourceFileName" TEXT,
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPostDailyView" (
    "id" TEXT NOT NULL,
    "postSlug" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "searchViews" INTEGER NOT NULL DEFAULT 0,
    "socialViews" INTEGER NOT NULL DEFAULT 0,
    "otherViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlogPostDailyView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogMedia" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");
CREATE INDEX "BlogPost_updatedAt_idx" ON "BlogPost"("updatedAt");
CREATE UNIQUE INDEX "BlogPostDailyView_postSlug_date_key" ON "BlogPostDailyView"("postSlug", "date");
CREATE INDEX "BlogPostDailyView_postSlug_idx" ON "BlogPostDailyView"("postSlug");
CREATE INDEX "BlogPostDailyView_date_idx" ON "BlogPostDailyView"("date");
CREATE UNIQUE INDEX "BlogMedia_key_key" ON "BlogMedia"("key");
CREATE INDEX "BlogMedia_createdAt_idx" ON "BlogMedia"("createdAt");

ALTER TABLE "BlogPostDailyView" ADD CONSTRAINT "BlogPostDailyView_postSlug_fkey" FOREIGN KEY ("postSlug") REFERENCES "BlogPost"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
