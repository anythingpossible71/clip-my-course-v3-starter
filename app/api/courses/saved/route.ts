import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/auth'
import { transformCourseForResponse } from '@/lib/utils/api-transforms'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`📚 Fetching saved courses for user ${session.userId}`)

    // Fetch saved courses with full course data
    const savedCourses = await prisma.savedCourse.findMany({
      where: {
        user_id: session.userId,
        deleted_at: null,
        course: {
          deleted_at: null,
          isShared: true
        }
      },
      include: {
        course: {
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
                  }
                }
              },
              orderBy: {
                order_index: 'asc'
              }
            },
            lessons: {
              where: {
                section_id: null
              },
              orderBy: {
                global_order_index: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        saved_at: 'desc'
      }
    })

    console.log(`✅ Found ${savedCourses.length} saved courses for user ${session.userId}`)

    // Transform the courses for response
    const transformedCourses = savedCourses.map(savedCourse => ({
      ...transformCourseForResponse(savedCourse.course),
      savedAt: savedCourse.saved_at,
      sharedCourseId: savedCourse.course.sharedCourseId
    }))

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
      count: transformedCourses.length
    })

  } catch (error) {
    console.error('❌ Error fetching saved courses:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch saved courses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
