-- Add Chinese translation fields to news table
ALTER TABLE "news" ADD COLUMN "title_cn" VARCHAR(255);
ALTER TABLE "news" ADD COLUMN "summary_cn" TEXT;
ALTER TABLE "news" ADD COLUMN "why_it_matters_cn" TEXT;
