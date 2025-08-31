import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decodeId } from '@/lib/utils/sqids'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`🔍 Fetching course with ID: ${id}`)
    
    // Decode the ID from the URL parameter
    const courseId = decodeId(id)
    if (!courseId) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    // Fetch course without authentication for testing
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
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
          orderBy: {
            order_index: 'asc'
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    console.log(`✅ Found course: ${course.title}`)

    // Transform course for response
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      sections: course.sections?.map(section => ({
        id: section.id,
        title: section.title,
        lessons: section.lessons?.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.video_url,
          duration: lesson.duration,
          global_order_index: lesson.global_order_index,
          level: lesson.level
        })) || []
      })) || [],
      lessons: course.lessons?.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.video_url,
        duration: lesson.duration,
        global_order_index: lesson.global_order_index,
        level: lesson.level
      })) || []
    }

    return NextResponse.json(transformedCourse)

  } catch (error) {
    console.error('❌ Error fetching course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 