-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "price" REAL,
    "total_duration" INTEGER NOT NULL DEFAULT 0,
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "total_sections" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT,
    "tags" TEXT,
    "category" TEXT,
    "creator_id" INTEGER NOT NULL,
    "sharedCourseId" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Course_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("category", "created_at", "creator_id", "deleted_at", "description", "id", "is_featured", "is_free", "is_published", "price", "slug", "tags", "thumbnail", "title", "total_duration", "total_lessons", "total_sections", "updated_at") SELECT "category", "created_at", "creator_id", "deleted_at", "description", "id", "is_featured", "is_free", "is_published", "price", "slug", "tags", "thumbnail", "title", "total_duration", "total_lessons", "total_sections", "updated_at" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE UNIQUE INDEX "Course_sharedCourseId_key" ON "Course"("sharedCourseId");
CREATE INDEX "Course_creator_id_idx" ON "Course"("creator_id");
CREATE INDEX "Course_is_published_idx" ON "Course"("is_published");
CREATE INDEX "Course_is_featured_idx" ON "Course"("is_featured");
CREATE INDEX "Course_slug_idx" ON "Course"("slug");
CREATE INDEX "Course_deleted_at_idx" ON "Course"("deleted_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
