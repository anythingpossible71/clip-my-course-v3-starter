/*
  Warnings:

  - You are about to drop the `CourseVideo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "CourseVideo_deleted_at_idx";

-- DropIndex
DROP INDEX "CourseVideo_video_id_idx";

-- DropIndex
DROP INDEX "CourseVideo_order_index_idx";

-- DropIndex
DROP INDEX "CourseVideo_course_id_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CourseVideo";
PRAGMA foreign_keys=on;

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
    "section_id" INTEGER NOT NULL,
    CONSTRAINT "Lesson_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("created_at", "deleted_at", "description", "duration", "id", "is_free", "order_index", "section_id", "thumbnail", "title", "updated_at", "video_id", "video_url") SELECT "created_at", "deleted_at", "description", "duration", "id", "is_free", "order_index", "section_id", "thumbnail", "title", "updated_at", "video_id", "video_url" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE INDEX "Lesson_section_id_idx" ON "Lesson"("section_id");
CREATE INDEX "Lesson_order_index_idx" ON "Lesson"("order_index");
CREATE INDEX "Lesson_video_id_idx" ON "Lesson"("video_id");
CREATE INDEX "Lesson_deleted_at_idx" ON "Lesson"("deleted_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
