import { prisma } from "@/lib/prisma"
import { encodeId, decodeId } from "@/lib/utils/sqids"

// Slug generation utility
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Duration formatting utilities
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const parseDuration = (duration: string): number => {
  // Parse duration in format "MM:SS" or "HH:MM:SS"
  const parts = duration.split(':').map(Number)
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  
  return 0
}

// Course data transformation utilities
export const transformCourseForResponse = (course: any) => {
  console.log('🔍 Transform debug - input savedCourses:', course.savedCourses)
  
  const result = {
    id: encodeId(course.id),
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    isPublished: course.is_published,
    isFeatured: course.is_featured,
    isFree: course.is_free,
    price: course.price,
    totalDuration: course.total_duration,
    totalLessons: course.total_lessons,
    totalSections: course.total_sections,
    slug: course.slug,
    tags: course.tags ? JSON.parse(course.tags) : [],
    category: course.category,
    createdAt: course.created_at,
    updatedAt: course.updated_at,
    creator: course.creator ? {
      id: encodeId(course.creator.id),
      email: course.creator.email,
      profile: course.creator.profile
    } : null,
    sections: course.sections?.map(transformSectionForResponse) || [],
    lessons: course.lessons?.map(transformLessonForResponse) || [],
    savedCourses: course.savedCourses || []
  }
  
  console.log('🔍 Transform debug - output savedCourses:', result.savedCourses)
  return result
}

export const transformSectionForResponse = (section: any) => {
  return {
    id: encodeId(section.id),
    title: section.title,
    description: section.description,
    orderIndex: section.order_index,
    totalDuration: section.total_duration,
    totalLessons: section.total_lessons,
    createdAt: section.created_at,
    updatedAt: section.updated_at,
    lessons: section.lessons?.map(transformLessonForResponse) || []
  }
}

export const transformLessonForResponse = (lesson: any) => {
  return {
    id: encodeId(lesson.id),
    title: lesson.title,
    description: lesson.description,
    orderIndex: lesson.order_index,
    videoUrl: lesson.video_url,
    videoId: lesson.video_id,
    duration: lesson.duration,
    formattedDuration: formatDuration(lesson.duration),
    thumbnail: lesson.thumbnail,
    isFree: lesson.is_free,
    createdAt: lesson.created_at,
    updatedAt: lesson.updated_at
  }
}

// Progress calculation utilities
export const calculateCourseProgress = (enrollment: any): number => {
  if (!enrollment || !enrollment.course) return 0
  
  const totalLessons = enrollment.course.total_lessons || 0
  const completedLessons = enrollment.completed_lessons || 0
  
  if (totalLessons === 0) return 0
  return Math.round((completedLessons / totalLessons) * 100)
}

export const calculateSectionProgress = (section: any, userId: number): number => {
  if (!section || !section.lessons) return 0
  
  const totalLessons = section.lessons.length
  const completedLessons = section.lessons.filter((lesson: any) => 
    lesson.progress && lesson.progress.some((p: any) => p.user_id === userId && p.is_completed)
  ).length
  
  if (totalLessons === 0) return 0
  return Math.round((completedLessons / totalLessons) * 100)
}

// Course creation utility
export const createCourseWithSections = async (data: {
  title: string
  description?: string
  thumbnail?: string
  isPublished?: boolean
  isFree?: boolean
  price?: number
  creatorId: number
  sections: Array<{
    title: string
    description?: string
    orderIndex: number
    lessons: Array<{
      title: string
      description?: string
      orderIndex: number
      videoUrl?: string
      videoId?: string
      duration?: number
      thumbnail?: string
      isFree?: boolean
    }>
  }>
}) => {
  return await prisma.$transaction(async (tx) => {
    // Create course
    const course = await tx.course.create({
    data: {
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      is_published: data.isPublished || false,
      is_free: data.isFree || false,
      price: data.price,
      creator_id: data.creatorId,
        slug: generateSlug(data.title),
        total_sections: data.sections.length,
        total_lessons: data.sections.reduce((sum, section) => sum + section.lessons.length, 0),
        total_duration: data.sections.reduce((sum, section) => 
          sum + section.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.duration || 0), 0), 0
        )
      }
    })

    // Create sections and lessons
    for (const sectionData of data.sections) {
      const section = await tx.section.create({
        data: {
          title: sectionData.title,
          description: sectionData.description,
          order_index: sectionData.orderIndex,
          course_id: course.id,
          total_lessons: sectionData.lessons.length,
          total_duration: sectionData.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)
        }
      })

      // Create lessons for this section
      for (const lessonData of sectionData.lessons) {
        await tx.lesson.create({
          data: {
            title: lessonData.title,
            description: lessonData.description,
            order_index: lessonData.orderIndex,
            video_url: lessonData.videoUrl,
            video_id: lessonData.videoId,
            duration: lessonData.duration,
            thumbnail: lessonData.thumbnail,
            is_free: lessonData.isFree || false,
            section_id: section.id,
            course_id: course.id
          }
        })
      }
    }

    return course
  })
}

// Enrollment utilities
export const enrollUserInCourse = async (userId: number, courseId: number) => {
  const existingEnrollment = await prisma.courseEnrollment.findFirst({
    where: {
      user_id: userId,
      course_id: courseId
    }
  })

  if (existingEnrollment) {
    return existingEnrollment
  }

  return await prisma.courseEnrollment.create({
    data: {
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date()
    }
  })
}

// Progress tracking utilities
export const updateLessonProgress = async (
  userId: number, 
  lessonId: number, 
  data: {
    isCompleted?: boolean
    watchTime?: number
    lastPosition?: number
  }
) => {
  const existingProgress = await prisma.lessonProgress.findFirst({
    where: {
        user_id: userId,
        lesson_id: lessonId
      }
  })

  if (existingProgress) {
    return await prisma.lessonProgress.update({
      where: { id: existingProgress.id },
      data: {
      is_completed: data.isCompleted,
      watch_time: data.watchTime,
      last_position: data.lastPosition,
      updated_at: new Date()
      }
    })
  } else {
    return await prisma.lessonProgress.create({
      data: {
      user_id: userId,
      lesson_id: lessonId,
      is_completed: data.isCompleted || false,
      watch_time: data.watchTime || 0,
      last_position: data.lastPosition || 0
    }
  })
  }
} 

 