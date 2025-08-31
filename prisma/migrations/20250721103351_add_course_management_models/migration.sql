-- CreateTable
CREATE TABLE "Course" (
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
    CONSTRAINT "Course_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "total_duration" INTEGER NOT NULL DEFAULT 0,
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "course_id" INTEGER NOT NULL,
    CONSTRAINT "Section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
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
    "section_id" INTEGER NOT NULL,
    CONSTRAINT "Lesson_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "completed_at" DATETIME,
    "progress_percentage" REAL NOT NULL DEFAULT 0,
    "last_accessed_at" DATETIME,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    CONSTRAINT "Enrollment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" DATETIME,
    "watch_time" INTEGER NOT NULL DEFAULT 0,
    "last_position" REAL NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    CONSTRAINT "LessonProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LessonProgress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_creator_id_idx" ON "Course"("creator_id");

-- CreateIndex
CREATE INDEX "Course_is_published_idx" ON "Course"("is_published");

-- CreateIndex
CREATE INDEX "Course_is_featured_idx" ON "Course"("is_featured");

-- CreateIndex
CREATE INDEX "Course_slug_idx" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_deleted_at_idx" ON "Course"("deleted_at");

-- CreateIndex
CREATE INDEX "Section_course_id_idx" ON "Section"("course_id");

-- CreateIndex
CREATE INDEX "Section_order_index_idx" ON "Section"("order_index");

-- CreateIndex
CREATE INDEX "Section_deleted_at_idx" ON "Section"("deleted_at");

-- CreateIndex
CREATE INDEX "Lesson_section_id_idx" ON "Lesson"("section_id");

-- CreateIndex
CREATE INDEX "Lesson_order_index_idx" ON "Lesson"("order_index");

-- CreateIndex
CREATE INDEX "Lesson_video_id_idx" ON "Lesson"("video_id");

-- CreateIndex
CREATE INDEX "Lesson_deleted_at_idx" ON "Lesson"("deleted_at");

-- CreateIndex
CREATE INDEX "Enrollment_user_id_idx" ON "Enrollment"("user_id");

-- CreateIndex
CREATE INDEX "Enrollment_course_id_idx" ON "Enrollment"("course_id");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE INDEX "Enrollment_deleted_at_idx" ON "Enrollment"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_user_id_course_id_key" ON "Enrollment"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "LessonProgress_user_id_idx" ON "LessonProgress"("user_id");

-- CreateIndex
CREATE INDEX "LessonProgress_lesson_id_idx" ON "LessonProgress"("lesson_id");

-- CreateIndex
CREATE INDEX "LessonProgress_is_completed_idx" ON "LessonProgress"("is_completed");

-- CreateIndex
CREATE INDEX "LessonProgress_deleted_at_idx" ON "LessonProgress"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_user_id_lesson_id_key" ON "LessonProgress"("user_id", "lesson_id");
