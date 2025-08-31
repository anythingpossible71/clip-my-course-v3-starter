-- CreateTable
CREATE TABLE "SavedSharedCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "user_id" INTEGER NOT NULL,
    "original_course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "shared_course_url" TEXT NOT NULL,
    "saved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedSharedCourse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedSharedCourse_original_course_id_fkey" FOREIGN KEY ("original_course_id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SavedSharedCourse_user_id_idx" ON "SavedSharedCourse"("user_id");

-- CreateIndex
CREATE INDEX "SavedSharedCourse_original_course_id_idx" ON "SavedSharedCourse"("original_course_id");

-- CreateIndex
CREATE INDEX "SavedSharedCourse_saved_at_idx" ON "SavedSharedCourse"("saved_at");

-- CreateIndex
CREATE INDEX "SavedSharedCourse_deleted_at_idx" ON "SavedSharedCourse"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "SavedSharedCourse_user_id_original_course_id_key" ON "SavedSharedCourse"("user_id", "original_course_id");
