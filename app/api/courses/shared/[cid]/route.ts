import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformCourseForResponse } from '@/lib/utils/api-transforms'
import { getSession } from '@/lib/auth/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    const { cid } = await params

    if (!cid) {
      return NextResponse.json({ error: 'Missing course identifier' }, { status: 400 })
    }

    console.log(`🔍 Fetching shared course with identifier: ${cid}`)

    // Get current user session (optional - for progress tracking)
    let session = null
    let includeProgress = false
    let includeSavedCourses = false
    try {
      session = await getSession()
      // Always include saved courses if we have a session
      if (session && session.userId) {
        includeSavedCourses = true
        // Only include progress if we have a valid numeric user ID
        // ULID user IDs are not compatible with the current progress table schema
        if (!isNaN(Number(session.userId))) {
          includeProgress = true
        } else {
          console.log('⚠️ Session contains non-numeric userId, skipping progress:', session.userId)
        }
      }
      
      console.log('🔍 Session debug:', {
        hasSession: !!session,
        userId: session?.userId,
        userIdType: typeof session?.userId,
        includeProgress,
        includeSavedCourses
      })
    } catch (error) {
      console.log('No authenticated user - showing course without progress')
    }

    // Find course by sharedCourseId
    console.log('🔍 Prisma query debug:', {
      includeSavedCourses,
      sessionUserId: session?.userId,
      numericUserId: session?.userId ? Number(session.userId) : null
    })
    
    const course = await prisma.course.findFirst({
      where: {
        sharedCourseId: cid,
        isShared: true,
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
              include: includeProgress ? {
                progress: {
                  where: {
                    user_id: Number(session.userId)
                  }
                }
              } : undefined
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
          },
          include: includeProgress ? {
            progress: {
              where: {
                user_id: Number(session.userId)
              }
            }
          } : undefined
        },
        // Include saved course information if user is authenticated
        savedCourses: session && session.userId ? {
          where: {
            user_id: session.userId,
            deleted_at: null
          }
        } : undefined
      }
    })

    if (!course) {
      console.log(`❌ Course not found with sharedCourseId: ${cid}`)
      return NextResponse.json({ error: 'Course not found or not shared' }, { status: 404 })
    }

    console.log(`✅ Found shared course: ${course.title}`)
    console.log(`📊 Session user ID: ${session?.userId} (type: ${typeof session?.userId})`)
    console.log(`📊 Course savedCourses:`, JSON.stringify(course.savedCourses, null, 2))

    // Transform course data for response
    const transformedCourse = transformCourseForResponse(course)
    
    console.log('🔍 After transformation:', {
      hasSavedCourses: !!transformedCourse.savedCourses,
      savedCoursesLength: transformedCourse.savedCourses?.length || 0
    })

    return NextResponse.json(transformedCourse)
  } catch (error) {
    console.error('Error fetching shared course:', error)
    return NextResponse.json({ error: 'Failed to fetch shared course' }, { status: 500 })
  }
} 