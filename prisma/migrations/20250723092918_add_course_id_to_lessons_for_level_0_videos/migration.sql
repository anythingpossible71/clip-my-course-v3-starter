/*
  Warnings:

  - Added the required column `course_id` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
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
    "course_id" INTEGER NOT NULL,
    "section_id" INTEGER,
    CONSTRAINT "Lesson_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lesson_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("created_at", "deleted_at", "description", "duration", "id", "is_free", "level", "order_index", "section_id", "thumbnail", "title", "updated_at", "video_id", "video_url", "course_id") 
SELECT l."created_at", l."deleted_at", l."description", l."duration", l."id", l."is_free", l."level", l."order_index", l."section_id", l."thumbnail", l."title", l."updated_at", l."video_id", l."video_url", s."course_id"
FROM "Lesson" l
JOIN "Section" s ON l."section_id" = s."id";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE INDEX "Lesson_section_id_idx" ON "Lesson"("section_id");
CREATE INDEX "Lesson_order_index_idx" ON "Lesson"("order_index");
CREATE INDEX "Lesson_video_id_idx" ON "Lesson"("video_id");
CREATE INDEX "Lesson_deleted_at_idx" ON "Lesson"("deleted_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
