import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformCourseForResponse } from '@/lib/utils/api-transforms'
import { decodeId } from '@/lib/utils/sqids'
import { generateThumbnailFromUrl } from '@/lib/utils/youtube-helpers'
import { getSession } from '@/lib/auth/auth'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`🔍 Fetching course with ID: ${id}`)
    
    // Get current user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Decode the ID from the URL parameter
    const courseId = decodeId(id)
    if (!courseId) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    console.log('🔍 Fetching course with sections and lessons...')
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        creator_id: session.userId // Only allow access to own courses
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
              orderBy: {
                global_order_index: 'asc'
              },
              include: {
                progress: {
                  where: {
                    user_id: session.userId
                  }
                }
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
          orderBy: {
            global_order_index: 'asc'
          },
          include: {
            progress: {
              where: {
                user_id: session.userId
              }
            }
          }
        }
      }
    })
    
    if (course) {
      console.log(`📊 Course "${course.title}" has ${course.sections.length} sections and ${course.lessons.length} level 0 videos`)
      course.sections.forEach((section, index) => {
        console.log(`📚 Section ${index + 1}: "${section.title}" with ${section.lessons.length} lessons`)
        section.lessons.forEach((lesson, lessonIndex) => {
          console.log(`  📹 Lesson ${lessonIndex + 1}: "${lesson.title}" (global_order_index: ${lesson.global_order_index})`)
        })
      })
      course.lessons.forEach((lesson, index) => {
        console.log(`🎬 Level 0 Video ${index + 1}: "${lesson.title}" (global_order_index: ${lesson.global_order_index})`)
      })
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    console.log(`✅ Found course: ${course.title}`)

    // Transform course for response
    const transformedCourse = transformCourseForResponse(course)

    return NextResponse.json({ course: transformedCourse })

  } catch (error) {
    console.error('❌ Error fetching course:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch course',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`📝 Updating course with ID: ${id}`)
    
    // Get current user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Decode the ID from the URL parameter
    const courseId = decodeId(id)
    if (!courseId) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    // Verify the course belongs to the current user
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
        creator_id: session.userId
      }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, sections, items } = body
    


    // Update course in a transaction
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // Log the items array before processing
      console.log('📋 Items array before processing:', JSON.stringify(items, null, 2))
      console.log('📋 Sections array before processing:', JSON.stringify(sections, null, 2))
      
      // Update the course
      const course = await tx.course.update({
        where: {
          id: courseId
        },
        data: {
          title,
          description,
          updated_at: new Date()
        }
      })

      // Delete all existing sections and lessons for this course
      // First delete lesson progress records to avoid foreign key constraint violations
      await tx.lessonProgress.deleteMany({
        where: {
          lesson: {
            course_id: courseId
          }
        }
      })

      // Then delete all lessons for this course
      await tx.lesson.deleteMany({
        where: {
            course_id: courseId
        }
      })

      // Finally delete all sections for this course
      await tx.section.deleteMany({
        where: {
          course_id: courseId
        }
      })

      // Process items in the order they appear in the unified items array
      if (items && items.length > 0) {
        console.log('🔄 Processing unified items array:', items.length, 'items')
        let sectionIndex = 0
        let globalOrderIndex = 0 // Global counter for all items (sections + level 0 videos)
        
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
          const item = items[itemIndex]
          console.log(`📋 Processing item ${itemIndex + 1}/${items.length}:`, item.lessons ? 'Section' : 'Level 0 Video')
          
          if (item.lessons) {
            // This is a section
            const sectionData = item
            console.log(`📚 Creating section "${sectionData.title}" at global position ${globalOrderIndex + 1}`)
            
            const section = await tx.section.create({
              data: {
                title: sectionData.title,
                description: sectionData.description || '',
                order_index: sectionIndex + 1,
                course_id: courseId,
                total_duration: 0,
                total_lessons: sectionData.lessons.length
              }
            })
            console.log(`✅ Created section with ID: ${section.id}`)

            // Create lessons for this section
            for (let lessonIndex = 0; lessonIndex < sectionData.lessons.length; lessonIndex++) {
              const lessonData = sectionData.lessons[lessonIndex]
              
              // Generate thumbnail safely
              const thumbnail = generateThumbnailFromUrl(lessonData.videoUrl, 'hq')
              
              const lesson = await tx.lesson.create({
                data: {
                  title: lessonData.title,
                  description: lessonData.description || '',
                  order_index: lessonIndex + 1, // Local order within section
                  global_order_index: globalOrderIndex + 1, // Global order across all items
                  video_url: lessonData.videoUrl,
                  video_id: extractVideoId(lessonData.videoUrl),
                  duration: parseDuration(lessonData.duration),
                  thumbnail: thumbnail, // Can be null, which is fine
                  is_free: true,
                  course_id: courseId, // Add course_id for all lessons
                  section_id: section.id,
                  level: lessonData.level || 1 // Level 1 for section videos
                }
              })
              console.log(`📹 Created lesson "${lessonData.title}" with global_order_index: ${globalOrderIndex + 1}`)
              
              globalOrderIndex++
            }
            
            sectionIndex++
          } else {
            // This is a level 0 video
            const videoData = item
            console.log(`🎬 Creating level 0 video "${videoData.title}" at global position ${globalOrderIndex + 1}`)
            
            // Generate thumbnail safely
            const thumbnail = generateThumbnailFromUrl(videoData.videoUrl, 'hq')
            
            const lesson = await tx.lesson.create({
              data: {
                title: videoData.title,
                description: videoData.description || '',
                order_index: globalOrderIndex + 1, // Local order for level 0 videos (same as global)
                global_order_index: globalOrderIndex + 1, // Global order across all items
                video_url: videoData.videoUrl,
                video_id: extractVideoId(videoData.videoUrl),
                duration: parseDuration(videoData.duration),
                thumbnail: thumbnail, // Can be null, which is fine
                is_free: true,
                course_id: courseId, // Add course_id for all lessons
                section_id: null, // Level 0 videos have no section
                level: videoData.level || 0 // Level 0 for root videos
              }
            })
            console.log(`✅ Created level 0 video "${videoData.title}" with global_order_index: ${globalOrderIndex + 1}`)
            console.log(`🔍 Database record created:`, JSON.stringify(lesson, null, 2))
            
            globalOrderIndex++
          }
        }
        console.log(`🎯 Finished processing. Total global order index: ${globalOrderIndex}`)
      } else if (!items || items.length === 0) {
        // Fallback to old method if items array is not provided
        console.log('⚠️ Using fallback method - items array not provided')
      // Create new sections and lessons
        let globalOrderIndex = 0
      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const sectionData = sections[sectionIndex]
          console.log(`📚 Creating section "${sectionData.title}" at position ${sectionIndex + 1}`)
        
        const section = await tx.section.create({
          data: {
            title: sectionData.title,
            description: sectionData.description || '',
            order_index: sectionIndex + 1,
            course_id: courseId,
            total_duration: 0,
            total_lessons: sectionData.lessons.length
          }
        })
          console.log(`✅ Created section with ID: ${section.id}`)

        // Create lessons for this section
        for (let lessonIndex = 0; lessonIndex < sectionData.lessons.length; lessonIndex++) {
          const lessonData = sectionData.lessons[lessonIndex]
          
          // Generate thumbnail safely
          const thumbnail = generateThumbnailFromUrl(lessonData.videoUrl, 'hq')
          
            const lesson = await tx.lesson.create({
            data: {
              title: lessonData.title,
              description: lessonData.description || '',
              order_index: lessonIndex + 1,
                global_order_index: globalOrderIndex + 1, // Global order across all items
              video_url: lessonData.videoUrl,
              video_id: extractVideoId(lessonData.videoUrl),
              duration: parseDuration(lessonData.duration),
              thumbnail: thumbnail, // Can be null, which is fine
              is_free: true,
                course_id: courseId, // Add course_id for all lessons
              section_id: section.id,
                level: lessonData.level || 1 // Level 1 for section videos
              }
            })
            console.log(`📹 Created lesson "${lessonData.title}" with global_order_index: ${globalOrderIndex + 1}`)
            console.log(`🔍 Database record created:`, JSON.stringify(lesson, null, 2))
            
            globalOrderIndex++
            }
        }
        console.log(`🎯 Finished fallback processing. Total global order index: ${globalOrderIndex}`)
      }

      // Calculate total lessons and duration from the items array
      let totalLessons = 0
      let totalDuration = 0
      
      if (items && items.length > 0) {
        for (const item of items) {
          if (item.lessons) {
            // This is a section
            totalLessons += item.lessons.length
            totalDuration += item.lessons.reduce((sectionTotal: number, lesson: any) => {
              return sectionTotal + (parseDuration(lesson.duration) || 0)
            }, 0)
          } else {
            // This is a level 0 video
            totalLessons += 1
            totalDuration += parseDuration(item.duration) || 0
          }
        }
      } else {
        // Fallback calculation from sections
        totalLessons = sections.reduce((total: number, section: any) => total + section.lessons.length, 0)
        totalDuration = sections.reduce((total: number, section: any) => {
        return total + section.lessons.reduce((sectionTotal: number, lesson: any) => {
          return sectionTotal + (parseDuration(lesson.duration) || 0)
        }, 0)
      }, 0)
      }

      return await tx.course.update({
        where: { id: courseId },
        data: {
          total_lessons: totalLessons,
          total_duration: totalDuration,
          total_sections: sections.length
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

    console.log(`✅ Successfully updated course: ${updatedCourse.title}`)

    // Transform course for response
    const transformedCourse = transformCourseForResponse(updatedCourse)



    return NextResponse.json({ 
      message: 'Course updated successfully',
      course: transformedCourse
    })

  } catch (error) {
    console.error('❌ Error updating course:', error)
    return NextResponse.json({ 
      error: 'Failed to update course',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to extract video ID from URL
function extractVideoId(url: string): string | null {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`🗑️ Permanently deleting course with ID: ${id}`)
    
    // Get current user session
    const session = await getSession()
    if (!session) {
      console.log('❌ No session found - user not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log(`👤 Current user ID: ${session.userId}`)
    
    // Decode the ID from the URL parameter
    const courseId = decodeId(id)
    if (!courseId) {
      console.log('❌ Failed to decode course ID:', id)
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    console.log(`🔍 Decoded course ID: ${courseId}`)

    // Verify the course belongs to the current user
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
        creator_id: session.userId
      }
    })

    if (!existingCourse) {
      console.log(`❌ Course not found or access denied - Course ID: ${courseId}, User ID: ${session.userId}`)
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
    }

    console.log(`✅ Found course: "${existingCourse.title}" - proceeding with deletion`)

    // Permanently delete the course and all related data
    await prisma.$transaction(async (tx) => {
      // Delete all lesson progress records first (they reference lessons)
      await tx.lessonProgress.deleteMany({
        where: {
          lesson: {
            course_id: courseId
          }
        }
      })

      // Delete all enrollments for this course
      await tx.enrollment.deleteMany({
        where: {
          course_id: courseId
        }
      })

      // Delete all lessons (both section-based and level 0 videos)
      await tx.lesson.deleteMany({
        where: {
          course_id: courseId
        }
      })

      // Delete all sections
      await tx.section.deleteMany({
        where: {
          course_id: courseId
        }
      })

      // Finally delete the course itself
      await tx.course.delete({
        where: {
          id: courseId
        }
      })
    })

    console.log(`✅ Successfully permanently deleted course ID: ${courseId}`)

    return NextResponse.json({ 
      message: 'Course permanently deleted',
      courseId: id
    })

  } catch (error) {
    console.error('❌ Error deleting course:', error)
    return NextResponse.json({ 
      error: 'Failed to delete course',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 