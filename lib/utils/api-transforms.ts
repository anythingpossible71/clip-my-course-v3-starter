import { encodeId } from "./sqids";

/**
 * Transform a database entity to include encoded IDs for client consumption
 * @param entity - The database entity with numeric ID
 * @returns The entity with encoded string ID
 */
export function encodeEntityId<T extends { id: number }>(
  entity: T
): Omit<T, "id"> & { id: string } {
  const { id, ...rest } = entity;
  return {
    ...rest,
    id: encodeId(id),
  };
}

/**
 * Transform an array of database entities to include encoded IDs
 * @param entities - Array of database entities with numeric IDs
 * @returns Array of entities with encoded string IDs
 */
export function encodeEntityIds<T extends { id: number }>(
  entities: T[]
): (Omit<T, "id"> & { id: string })[] {
  return entities.map(encodeEntityId);
}

/**
 * Transform nested entity IDs (e.g., user_id, role_id) to encoded versions
 * @param entity - The entity with foreign key IDs
 * @param idFields - Array of field names that contain IDs to encode
 * @returns The entity with encoded IDs
 */
export function encodeNestedIds<T extends Record<string, unknown>>(
  entity: T,
  idFields: string[]
): T {
  const result = { ...entity } as Record<string, unknown>;

  for (const field of idFields) {
    if (field in result && typeof result[field] === "number") {
      result[field] = encodeId(result[field] as number);
    }
  }

  return result as T;
}

/**
 * Transform a user object for API response with encoded IDs
 */
export function transformUserForResponse(user: {
  id: number;
  email: string;
  last_signed_in: Date | null;
  created_at: Date;
  updated_at: Date;
  profile?: {
    id: number;
    user_id: number;
    first_name: string | null;
    last_name: string | null;
  } | null;
  roles?: Array<{
    id: number;
    user_id: number;
    role_id: number;
    role: {
      id: number;
      name: string;
    };
  }>;
}): {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_signed_in: string | null;
  profile: {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  roles: Array<{
    id: string;
    user_id: string;
    role_id: string;
    role: {
      id: string;
      name: string;
    };
  }>;
} {
  const transformedUser: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
    last_signed_in: string | null;
    profile: {
      id: string;
      user_id: string;
      first_name: string | null;
      last_name: string | null;
    } | null;
    roles: Array<{
      id: string;
      user_id: string;
      role_id: string;
      role: {
        id: string;
        name: string;
      };
    }>;
  } = {
    ...user,
    id: encodeId(user.id),
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
    last_signed_in: user.last_signed_in?.toISOString() || null,
    profile: user.profile
      ? {
          ...user.profile,
          id: encodeId(user.profile.id),
          user_id: encodeId(user.profile.user_id),
        }
      : null,
    roles: user.roles
      ? user.roles.map((userRole) => ({
          id: encodeId(userRole.id),
          user_id: encodeId(userRole.user_id),
          role_id: encodeId(userRole.role_id),
          role: {
            id: encodeId(userRole.role.id),
            name: userRole.role.name,
          },
        }))
      : [],
  };

  return transformedUser;
}

/**
 * Transform a course object for API response with encoded IDs
 */
export function transformCourseForResponse(course: {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  is_published: boolean;
  is_free: boolean;
  price: number | null;
  total_duration: number;
  total_lessons: number;
  total_sections: number;
  slug: string;
  category: string | null;
  tags: string | null;
  created_at: Date;
  updated_at: Date;
  creator_id: number;
  sharedCourseId?: string | null;
  isShared?: boolean;
  creator: {
    id: number;
    email: string;
    profile?: {
      id: number;
      user_id: number;
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
  sections?: Array<{
    id: number;
    title: string;
    description: string;
    order_index: number;
    total_duration: number;
    total_lessons: number;
          lessons: Array<{
        id: number;
        title: string;
        description: string;
        order_index: number;
        video_url: string;
        video_id: string;
        duration: number;
        thumbnail: string | null;
        is_free: boolean;
        level: number;
            global_order_index?: number;
            progress?: Array<{
              id: number;
              is_completed: boolean;
              completed_at: Date | null;
            }>;
          }>;
  }>;
  lessons?: Array<{
    id: number;
    title: string;
    description: string;
    order_index: number;
    video_url: string;
    video_id: string;
    duration: number;
    thumbnail: string | null;
    is_free: boolean;
    level: number;
    global_order_index?: number;
    progress?: Array<{
      id: number;
      is_completed: boolean;
      completed_at: Date | null;
      }>;
  }>;
  savedCourses?: Array<{
    id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    user_id: number;
    course_id: number;
    saved_at: Date;
  }>;
}): {
  id: string;
  title: string;
  description?: string;
  thumbnail: string | null;
  isPublished: boolean;
  isFree: boolean;
  price: number | null;
  totalDuration: number;
  totalLessons: number;
  totalSections: number;
  slug: string;
  category: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  sharedCourseId?: string | null;
  isShared?: boolean;
  creator: {
    id: string;
    email: string;
    profile?: {
      id: string;
      user_id: string;
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
  sections?: Array<{
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
    totalDuration: number;
    totalLessons: number;
              lessons: Array<{
            id: string;
            title: string;
            description?: string;
            orderIndex: number;
            videoUrl: string;
            videoId: string;
            duration: number;
            thumbnail: string | null;
            isFree: boolean;
            level: number;
            globalOrderIndex: number;
            completed: boolean;
          }>;
  }>;
  lessons?: Array<{
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
    videoUrl: string;
    videoId: string;
    duration: number;
    thumbnail: string | null;
    isFree: boolean;
    level: number;
    globalOrderIndex: number;
    completed: boolean;
  }>;
  savedCourses?: Array<{
    id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    user_id: number;
    course_id: number;
    saved_at: Date;
  }>;
} {
  // Get the first lesson's thumbnail as the course thumbnail
  // Check sections first, then level 0 videos, then fallback to course thumbnail
  const firstLessonThumbnail = course.sections?.[0]?.lessons?.[0]?.thumbnail || 
                               course.lessons?.[0]?.thumbnail || 
                               course.thumbnail;

  return {
    id: encodeId(course.id),
    title: course.title,
    description: course.description || undefined,
    thumbnail: firstLessonThumbnail,
    isPublished: course.is_published,
    isFree: course.is_free,
    price: course.price,
    sharedCourseId: course.sharedCourseId,
    isShared: course.isShared,
    totalDuration: course.sections?.reduce((total, section) => total + section.lessons.reduce((sectionTotal, lesson) => sectionTotal + lesson.duration, 0), 0) || course.total_duration,
    totalLessons: course.sections?.reduce((total, section) => total + section.lessons.length, 0) || course.total_lessons,
    totalSections: course.sections?.length || course.total_sections,
    slug: course.slug,
    category: course.category,
    tags: course.tags,
    createdAt: course.created_at.toISOString(),
    updatedAt: course.updated_at.toISOString(),
    creator: {
      id: encodeId(course.creator.id),
      email: course.creator.email,
      profile: course.creator.profile
        ? {
            id: encodeId(course.creator.profile.id),
            user_id: encodeId(course.creator.profile.user_id),
            first_name: course.creator.profile.first_name,
            last_name: course.creator.profile.last_name,
          }
        : null,
    },
    sections: course.sections
      ? course.sections.map((section) => ({
          id: encodeId(section.id),
          title: section.title,
          description: section.description || undefined,
          orderIndex: section.order_index,
          totalDuration: section.lessons.reduce((total, lesson) => total + lesson.duration, 0),
          totalLessons: section.lessons.length,
                      lessons: section.lessons.map((lesson) => ({
              id: encodeId(lesson.id),
              title: lesson.title,
              description: lesson.description || undefined,
              orderIndex: lesson.order_index,
              videoUrl: lesson.video_url,
              videoId: lesson.video_id,
              duration: lesson.duration,
              thumbnail: lesson.thumbnail,
              isFree: lesson.is_free,
              level: lesson.level || 0,
              globalOrderIndex: lesson.global_order_index || 0,
              completed: lesson.progress?.[0]?.is_completed || false,
            })),
        }))
      : undefined,
    lessons: course.lessons
      ? course.lessons.map((lesson) => ({
          id: encodeId(lesson.id),
          title: lesson.title,
          description: lesson.description || undefined,
          orderIndex: lesson.order_index,
          videoUrl: lesson.video_url,
          videoId: lesson.video_id,
          duration: lesson.duration,
          thumbnail: lesson.thumbnail,
          isFree: lesson.is_free,
          level: lesson.level || 0,
          globalOrderIndex: lesson.global_order_index || 0,
          completed: lesson.progress?.[0]?.is_completed || false,
        }))
      : undefined,
    savedCourses: course.savedCourses || [],
  };
}
