/*
  Warnings:

  - You are about to drop the `SavedSharedCourse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SavedSharedCourse";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SavedCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "saved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedCourse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SavedCourse_user_id_idx" ON "SavedCourse"("user_id");

-- CreateIndex
CREATE INDEX "SavedCourse_course_id_idx" ON "SavedCourse"("course_id");

-- CreateIndex
CREATE INDEX "SavedCourse_saved_at_idx" ON "SavedCourse"("saved_at");

-- CreateIndex
CREATE INDEX "SavedCourse_deleted_at_idx" ON "SavedCourse"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCourse_user_id_course_id_key" ON "SavedCourse"("user_id", "course_id");
