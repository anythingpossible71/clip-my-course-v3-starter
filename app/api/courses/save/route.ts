import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/auth'
import { decodeId } from '@/lib/utils/sqids'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Decode the course ID from the encoded string
    const decodedCourseId = decodeId(courseId)
    if (!decodedCourseId) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    console.log(`💾 User ${session.userId} is saving course ${decodedCourseId}`)

    // Check if the course exists and is shared
    const course = await prisma.course.findFirst({
      where: {
        id: decodedCourseId,
        isShared: true,
        deleted_at: null
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found or not shared' }, { status: 404 })
    }

    // Check if user is trying to save their own course
    if (course.creator_id === session.userId) {
      return NextResponse.json({ error: 'Cannot save your own course' }, { status: 400 })
    }

    // Check if course is already saved
    const existingSave = await prisma.savedCourse.findFirst({
      where: {
        user_id: session.userId,
        course_id: decodedCourseId
      }
    })

    if (existingSave) {
      return NextResponse.json({ 
        success: true, 
        message: 'Course already saved',
        alreadySaved: true
      })
    }

    // Save the course
    await prisma.savedCourse.create({
      data: {
        user_id: session.userId,
        course_id: decodedCourseId,
        saved_at: new Date()
      }
    })

    console.log(`✅ Course ${decodedCourseId} saved successfully for user ${session.userId}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Course saved successfully',
      alreadySaved: false
    })

  } catch (error) {
    console.error('❌ Error saving course:', error)
    return NextResponse.json({ 
      error: 'Failed to save course',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Decode the course ID from the encoded string
    const decodedCourseId = decodeId(courseId)
    if (!decodedCourseId) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    console.log(`🗑️ User ${session.userId} is removing saved course ${decodedCourseId}`)

    // Remove the saved course
    await prisma.savedCourse.deleteMany({
      where: {
        user_id: session.userId,
        course_id: decodedCourseId
      }
    })

    console.log(`✅ Course ${decodedCourseId} removed from saved courses for user ${session.userId}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Course removed from saved courses'
    })

  } catch (error) {
    console.error('❌ Error removing saved course:', error)
    return NextResponse.json({ 
      error: 'Failed to remove saved course',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
