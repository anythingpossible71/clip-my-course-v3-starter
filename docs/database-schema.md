# Course Management Database Schema

This document describes the database schema for the course management system in ClipMyCourse.

## Overview

The schema is designed to support a complete course management platform with:

- Course creation and management
- Section and lesson organization
- User enrollment and progress tracking
- Video integration with YouTube
- Soft delete pattern for data integrity

## Core Models

### User Model

```prisma
model User {
  id             Int       @id @default(autoincrement())
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt
  deleted_at     DateTime?

  email          String    @unique
  password       String?
  last_signed_in DateTime?

  profile        UserProfile?
  roles          UserRole[]

  // Course relationships
  courses        Course[]      // Courses created by this user
  enrollments    Enrollment[]  // Courses this user is enrolled in
  lessonProgress LessonProgress[] // Progress tracking for lessons
}
```

**Key Features:**

- Soft delete support (`deleted_at`)
- Role-based access control
- Course creation and enrollment tracking
- Progress tracking for individual lessons

### Course Model

```prisma
model Course {
  id          Int       @id @default(autoincrement())
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  deleted_at  DateTime?

  // Basic course information
  title       String
  description String?
  thumbnail   String?   // URL to course thumbnail image

  // Course settings
  is_published Boolean  @default(false)
  is_featured  Boolean  @default(false)
  is_free      Boolean  @default(false)
  price        Float?   // For paid courses (stored as cents)

  // Course metadata
  total_duration Int    @default(0) // Total duration in seconds
  total_lessons  Int    @default(0)
  total_sections Int    @default(0)

  // SEO and sharing
  slug        String?   @unique // URL-friendly course identifier
  tags        String?   // JSON array of tags
  category    String?

  // Relationships
  creator_id  Int
  creator     User       @relation(fields: [creator_id], references: [id])

  sections    Section[]
  enrollments Enrollment[]
}
```

**Key Features:**

- Publishing workflow (`is_published`)
- Featured course support
- Free/paid course distinction
- SEO-friendly slugs
- Tag and category organization
- Automatic metadata tracking

### Section Model

```prisma
model Section {
  id          Int       @id @default(autoincrement())
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  deleted_at  DateTime?

  // Section information
  title       String
  description String?
  order_index Int       // For ordering sections within a course

  // Section metadata
  total_duration Int    @default(0) // Total duration in seconds
  total_lessons  Int    @default(0)

  // Relationships
  course_id   Int
  course      Course    @relation(fields: [course_id], references: [id])

  lessons     Lesson[]
}
```

**Key Features:**

- Ordered sections within courses
- Automatic duration and lesson counting
- Hierarchical organization (Course → Section → Lesson)

### Lesson Model

```prisma
model Lesson {
  id          Int       @id @default(autoincrement())
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  deleted_at  DateTime?

  // Lesson information
  title       String
  description String?
  order_index Int       // For ordering lessons within a section

  // Video information
  video_url   String?   // YouTube URL or other video URL
  video_id    String?   // YouTube video ID
  duration    Int       @default(0) // Duration in seconds

  // Lesson metadata
  thumbnail   String?   // Lesson thumbnail URL
  is_free     Boolean   @default(false) // Free preview lesson

  // Relationships
  section_id  Int
  section     Section   @relation(fields: [section_id], references: [id])

  progress    LessonProgress[]
}
```

**Key Features:**

- YouTube video integration
- Duration tracking in seconds
- Free preview lesson support
- Individual progress tracking

### Enrollment Model

```prisma
model Enrollment {
  id          Int       @id @default(autoincrement())
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  deleted_at  DateTime?

  // Enrollment status
  status      EnrollmentStatus @default(ACTIVE)
  completed_at DateTime?

  // Progress tracking
  progress_percentage Float @default(0) // 0-100 percentage
  last_accessed_at   DateTime?

  // Relationships
  user_id     Int
  course_id   Int
  user        User      @relation(fields: [user_id], references: [id])
  course      Course    @relation(fields: [course_id], references: [id])

  @@unique([user_id, course_id])
}
```

**Key Features:**

- One enrollment per user per course
- Multiple enrollment statuses
- Progress percentage tracking
- Last accessed timestamp

### LessonProgress Model

```prisma
model LessonProgress {
  id          Int       @id @default(autoincrement())
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  deleted_at  DateTime?

  // Progress tracking
  is_completed Boolean  @default(false)
  completed_at DateTime?
  watch_time   Int      @default(0) // Time watched in seconds
  last_position Float   @default(0) // Last watched position (0-1)

  // Relationships
  user_id     Int
  lesson_id   Int
  user        User      @relation(fields: [user_id], references: [id])
  lesson      Lesson    @relation(fields: [lesson_id], references: [id])

  @@unique([user_id, lesson_id])
}
```

**Key Features:**

- One progress record per user per lesson
- Completion status tracking
- Watch time tracking
- Video position tracking (0-1 range)

## Enums

### EnrollmentStatus

```prisma
enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  CANCELLED
  EXPIRED
}
```

## Relationships

### One-to-Many Relationships

- **User → Course**: A user can create multiple courses
- **User → Enrollment**: A user can enroll in multiple courses
- **User → LessonProgress**: A user can have progress for multiple lessons
- **Course → Section**: A course can have multiple sections
- **Section → Lesson**: A section can have multiple lessons

### Many-to-Many Relationships

- **User ↔ Course** (via Enrollment): Users can enroll in multiple courses, courses can have multiple enrolled users
- **User ↔ Lesson** (via LessonProgress): Users can have progress for multiple lessons, lessons can have progress from multiple users

## Indexes

The schema includes comprehensive indexing for optimal query performance:

### User Indexes

- `email`: For user lookup and authentication
- `deleted_at`: For soft delete queries

### Course Indexes

- `creator_id`: For finding user's created courses
- `is_published`: For public course listings
- `is_featured`: For featured course displays
- `slug`: For SEO-friendly URLs
- `deleted_at`: For soft delete queries

### Section Indexes

- `course_id`: For course section queries
- `order_index`: For ordered section display
- `deleted_at`: For soft delete queries

### Lesson Indexes

- `section_id`: For section lesson queries
- `order_index`: For ordered lesson display
- `video_id`: For YouTube video lookups
- `deleted_at`: For soft delete queries

### Enrollment Indexes

- `user_id`: For user enrollment queries
- `course_id`: For course enrollment queries
- `status`: For enrollment status filtering
- `deleted_at`: For soft delete queries

### LessonProgress Indexes

- `user_id`: For user progress queries
- `lesson_id`: For lesson progress queries
- `is_completed`: For completion status filtering
- `deleted_at`: For soft delete queries

## Data Flow

### Course Creation Flow

1. User creates a course (Course record)
2. User adds sections to the course (Section records)
3. User adds lessons to sections (Lesson records)
4. Course metadata is automatically calculated

### Enrollment Flow

1. User enrolls in a course (Enrollment record)
2. User accesses lessons (LessonProgress records created as needed)
3. Progress is tracked per lesson
4. Course progress is calculated from lesson progress

### Progress Tracking Flow

1. User watches a lesson
2. LessonProgress record is updated with watch time and position
3. Lesson completion status is updated
4. Course progress percentage is recalculated

## Utility Functions

The schema is supported by utility functions in `lib/utils/course-helpers.ts`:

### Duration Formatting

- `formatDuration(seconds)`: Converts seconds to "MM:SS" or "HH:MM:SS"
- `parseDuration(duration)`: Converts "MM:SS" or "HH:MM:SS" to seconds

### Data Transformation

- `transformCourseForResponse(course)`: Encodes IDs and formats course data
- `transformSectionForResponse(section)`: Encodes IDs and formats section data
- `transformLessonForResponse(lesson)`: Encodes IDs and formats lesson data

### Progress Calculation

- `calculateCourseProgress(enrollment)`: Calculates overall course progress
- `calculateSectionProgress(section, userId)`: Calculates section progress

### Database Operations

- `createCourseWithSections(data)`: Creates course with sections and lessons
- `enrollUserInCourse(userId, courseId)`: Enrolls user in a course
- `updateLessonProgress(userId, lessonId, data)`: Updates lesson progress

## Migration Notes

### SQLite Compatibility

- Uses `Float` instead of `Decimal` for price storage
- All text fields use `String` type
- Boolean fields use `Boolean` type

### Soft Delete Pattern

- All models include `deleted_at` field
- Queries should filter by `deleted_at IS NULL`
- Indexes include `deleted_at` for efficient filtering

### ID Encoding

- Database uses integer IDs internally
- Public APIs use Sqids-encoded string IDs
- Transformation functions handle ID encoding/decoding

## Example Queries

### Get User's Courses

```typescript
const userCourses = await prisma.course.findMany({
  where: {
    creator_id: userId,
    deleted_at: null,
  },
  include: {
    sections: {
      include: {
        lessons: true,
      },
      orderBy: {
        order_index: "asc",
      },
    },
  },
});
```

### Get User's Enrollments

```typescript
const enrollments = await prisma.enrollment.findMany({
  where: {
    user_id: userId,
    deleted_at: null,
  },
  include: {
    course: {
      include: {
        sections: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: {
                    user_id: userId,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
```

### Get Lesson Progress

```typescript
const progress = await prisma.lessonProgress.findUnique({
  where: {
    user_id_lesson_id: {
      user_id: userId,
      lesson_id: lessonId,
    },
  },
});
```

This schema provides a robust foundation for a complete course management system with comprehensive progress tracking and user management capabilities.
