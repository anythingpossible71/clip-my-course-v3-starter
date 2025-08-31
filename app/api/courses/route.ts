import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformCourseForResponse } from '@/lib/utils/api-transforms'
import { getSession } from '@/lib/auth/auth'
import { generateThumbnailFromUrl } from '@/lib/utils/youtube-helpers'
import { generateSlug } from '@/lib/utils/course-helpers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching courses from database...')
    
    // Get current user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`👤 Fetching courses for user ID: ${session.userId}`)
    
    const courses = await prisma.course.findMany({
      where: {
        creator_id: session.userId,
        // Remove the is_published filter so users can see all their courses
        // is_published: true
      },
      include: {
        creator: {
          include: {
            profile: true
          }
        },
        sections: {
          include: {
            lessons: {
              include: {
                progress: true
              },
              orderBy: {
                order_index: 'asc'
              }
            }
          },
          orderBy: {
            order_index: 'asc'
          }
        },
        // Include level 0 videos (lessons without sections)
        lessons: {
          where: {
            section_id: null
          },
          include: {
            progress: true
          },
          orderBy: {
            order_index: 'asc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    console.log(`✅ Found ${courses.length} courses for user ${session.userId}`)

    // Transform courses for response using proper encoding
    const transformedCourses = courses.map(course => transformCourseForResponse(course))

    console.log('✅ Successfully transformed courses')

    return NextResponse.json({ 
      courses: transformedCourses,
      total: transformedCourses.length
    })

  } catch (error) {
    console.error('❌ Error fetching courses:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch courses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new course...')
    
    // Get current user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`👤 Creating course for user ID: ${session.userId}`)
    
    const body = await request.json()
    console.log('📦 Received course data:', body)
    
    const { title, description, sections, videos, items } = body

    console.log('🔍 Validation check:', {
      title: title,
      description: description,
      titleType: typeof title,
      descriptionType: typeof description,
      titleLength: title?.length,
      descriptionLength: description?.length,
      titleTruthy: !!title,
      descriptionTruthy: !!description
    })

    if (!title || !description) {
      console.log('❌ Missing required fields:', { title: !!title, description: !!description })
      return NextResponse.json({ 
        error: 'Title and description are required',
        received: { 
          title: !!title, 
          description: !!description,
          titleValue: title,
          descriptionValue: description,
          titleType: typeof title,
          descriptionType: typeof description
        }
      }, { status: 400 })
    }

    // Process sections - handle both sections array and items array
    let processedSections = sections || []
    let level0Videos: any[] = []
    
    // If we have items, process them to extract sections and level 0 videos
    if (items && items.length > 0) {
      console.log('📋 Processing items array:', items.length, 'items')
      
      // Extract sections (items with lessons property)
      processedSections = items.filter((item: any) => item.lessons).map((item: any) => ({
        title: item.title,
        description: item.description || '',
        lessons: item.lessons || []
      }))
      
      // Extract level 0 videos (items without lessons property)
      level0Videos = items.filter((item: any) => !item.lessons && item.videoUrl)
      
      console.log('📚 Processed sections:', processedSections.length, 'sections')
      console.log('🎬 Level 0 videos:', level0Videos.length, 'videos')
    }

    console.log('📚 Processed sections:', processedSections.length, 'sections')

    // Create course in a transaction
    const newCourse = await prisma.$transaction(async (tx) => {
      // Create the course
      const course = await tx.course.create({
        data: {
          title,
          description,
          slug: generateSlug(title), // Generate slug from title
          creator_id: session.userId,
          is_published: false, // Default to unpublished
          is_free: true, // Default to free
          total_duration: 0,
          total_lessons: 0,
          total_sections: processedSections.length
        }
      })

      // Create sections and lessons if provided
      if (processedSections && processedSections.length > 0) {
        for (let sectionIndex = 0; sectionIndex < processedSections.length; sectionIndex++) {
          const sectionData = processedSections[sectionIndex]
          
          const section = await tx.section.create({
            data: {
              title: sectionData.title,
              description: sectionData.description || '',
              order_index: sectionIndex + 1,
              course_id: course.id,
              total_duration: 0,
              total_lessons: sectionData.lessons?.length || 0
            }
          })

          // Create lessons for this section
          if (sectionData.lessons && sectionData.lessons.length > 0) {
            for (let lessonIndex = 0; lessonIndex < sectionData.lessons.length; lessonIndex++) {
              const lessonData = sectionData.lessons[lessonIndex]
              
              // Generate thumbnail safely
              const thumbnail = lessonData.videoUrl ? generateThumbnailFromUrl(lessonData.videoUrl, 'hq') : null
              
              await tx.lesson.create({
                data: {
                  title: lessonData.title,
                  description: lessonData.description || '',
                  order_index: lessonIndex + 1,
                  video_url: lessonData.videoUrl || '',
                  video_id: extractVideoId(lessonData.videoUrl || ''),
                  duration: parseDuration(lessonData.duration || ''),
                  thumbnail: thumbnail,
                  is_free: true,
              course_id: course.id,
                  section_id: section.id,
                  level: lessonData.level || 0 // Add level field with default to 0
                }
              })
            }
          }
        }
      }

      // Create level 0 videos (videos without sections)
      if (level0Videos && level0Videos.length > 0) {
        console.log('🎬 Creating level 0 videos:', level0Videos.length, 'videos')
        
        for (let videoIndex = 0; videoIndex < level0Videos.length; videoIndex++) {
          const videoData = level0Videos[videoIndex]
          
          // Generate thumbnail safely
          const thumbnail = videoData.videoUrl ? generateThumbnailFromUrl(videoData.videoUrl, 'hq') : null
          
          await tx.lesson.create({
            data: {
              title: videoData.title,
              description: videoData.description || '',
              order_index: videoIndex + 1,
              video_url: videoData.videoUrl || '',
              video_id: extractVideoId(videoData.videoUrl || ''),
              duration: parseDuration(videoData.duration || ''),
              thumbnail: thumbnail,
              is_free: true,
              course_id: course.id,
              section_id: null, // Level 0 videos don't belong to any section
              level: 0 // Explicitly set level to 0
            }
          })
        }
      }

      // Update course metadata (include level 0 videos)
      const totalLessons = (processedSections?.reduce((total: number, section: any) => total + (section.lessons?.length || 0), 0) || 0) + level0Videos.length
      const totalDuration = (processedSections?.reduce((total: number, section: any) => {
        return total + (section.lessons?.reduce((sectionTotal: number, lesson: any) => {
          return sectionTotal + (parseDuration(lesson.duration || '') || 0)
        }, 0) || 0)
      }, 0) || 0) + (level0Videos?.reduce((total: number, video: any) => {
        return total + (parseDuration(video.duration || '') || 0)
      }, 0) || 0)

      return await tx.course.update({
        where: { id: course.id },
        data: {
          total_lessons: totalLessons,
          total_duration: totalDuration,
          total_sections: processedSections.length
        },
        include: {
          creator: {
            include: {
              profile: true
            }
          },
          sections: {
            include: {
              lessons: true
            },
            orderBy: {
              order_index: 'asc'
            }
          },
          // Include level 0 videos (lessons without sections)
          lessons: {
            where: {
              section_id: null
            },
            orderBy: {
              order_index: 'asc'
            }
          }
        }
      })
    })

    console.log(`✅ Successfully created course: ${newCourse.title}`)

    // Transform course for response
    const transformedCourse = transformCourseForResponse(newCourse)

    return NextResponse.json({ 
      message: 'Course created successfully',
      course: transformedCourse
    })

  } catch (error) {
    console.error('❌ Error creating course:', error)
    return NextResponse.json({ 
      error: 'Failed to create course',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to extract video ID from URL
function extractVideoId(url: string): string | null {
  if (!url) return null
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Helper function to parse duration string to seconds
function parseDuration(duration: string): number {
  if (!duration) return 0
  
  const parts = duration.split(':')
  if (parts.length === 2) {
    // Format: "MM:SS"
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  } else if (parts.length === 3) {
    // Format: "HH:MM:SS"
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  }
  
  return 0
} 