-- CreateTable
CREATE TABLE "CourseVideo" (
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
    "course_id" INTEGER NOT NULL,
    CONSTRAINT "CourseVideo_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CourseVideo_course_id_idx" ON "CourseVideo"("course_id");

-- CreateIndex
CREATE INDEX "CourseVideo_order_index_idx" ON "CourseVideo"("order_index");

-- CreateIndex
CREATE INDEX "CourseVideo_video_id_idx" ON "CourseVideo"("video_id");

-- CreateIndex
CREATE INDEX "CourseVideo_deleted_at_idx" ON "CourseVideo"("deleted_at");
