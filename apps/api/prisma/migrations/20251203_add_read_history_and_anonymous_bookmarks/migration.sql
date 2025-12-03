-- AlterEnum
ALTER TYPE "activity_event_type" ADD VALUE 'read';

-- AlterTable
ALTER TABLE "bookmarks" ADD COLUMN     "session_id" VARCHAR(100),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_session_id_news_id_key" ON "bookmarks"("session_id", "news_id");

-- CreateIndex
CREATE INDEX "bookmarks_session_id_idx" ON "bookmarks"("session_id");

-- CreateTable
CREATE TABLE "read_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "session_id" VARCHAR(100),
    "news_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_duration" INTEGER,
    "scroll_depth" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "read_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "read_history_user_id_idx" ON "read_history"("user_id");

-- CreateIndex
CREATE INDEX "read_history_session_id_idx" ON "read_history"("session_id");

-- CreateIndex
CREATE INDEX "read_history_news_id_idx" ON "read_history"("news_id");

-- CreateIndex
CREATE INDEX "read_history_read_at_idx" ON "read_history"("read_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "read_history_user_id_news_id_key" ON "read_history"("user_id", "news_id");

-- CreateIndex
CREATE UNIQUE INDEX "read_history_session_id_news_id_key" ON "read_history"("session_id", "news_id");

-- AddForeignKey
ALTER TABLE "read_history" ADD CONSTRAINT "read_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_history" ADD CONSTRAINT "read_history_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
