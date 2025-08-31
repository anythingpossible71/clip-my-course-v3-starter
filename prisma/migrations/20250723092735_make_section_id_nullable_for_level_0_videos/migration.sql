-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "video_url" TEXT,
    "video_id" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 0,
    "section_id" INTEGER,
    CONSTRAINT "Lesson_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("created_at", "deleted_at", "description", "duration", "id", "is_free", "level", "order_index", "section_id", "thumbnail", "title", "updated_at", "video_id", "video_url") SELECT "created_at", "deleted_at", "description", "duration", "id", "is_free", "level", "order_index", "section_id", "thumbnail", "title", "updated_at", "video_id", "video_url" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE INDEX "Lesson_section_id_idx" ON "Lesson"("section_id");
CREATE INDEX "Lesson_order_index_idx" ON "Lesson"("order_index");
CREATE INDEX "Lesson_video_id_idx" ON "Lesson"("video_id");
CREATE INDEX "Lesson_deleted_at_idx" ON "Lesson"("deleted_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
