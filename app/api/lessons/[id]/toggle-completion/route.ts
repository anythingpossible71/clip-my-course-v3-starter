import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decodeId } from '@/lib/utils/sqids'
import { getSession } from '@/lib/auth/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`🔄 Toggling completion for lesson ID: ${id}`)
    
    // Get current user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Decode the lesson ID from the URL parameter
    const lessonId = decodeId(id)
    if (!lessonId) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 })
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Check if user has access to this lesson's course
    const course = await prisma.course.findUnique({
      where: { id: lesson.course_id }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Find existing progress record
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        user_id_lesson_id: {
          user_id: session.userId,
          lesson_id: lessonId
        }
      }
    })

    let progress
    if (existingProgress) {
      // Toggle existing progress
      progress = await prisma.lessonProgress.update({
        where: {
          user_id_lesson_id: {
            user_id: session.userId,
            lesson_id: lessonId
          }
        },
        data: {
          is_completed: !existingProgress.is_completed,
          completed_at: !existingProgress.is_completed ? new Date() : null
        }
      })
      console.log(`✅ Updated lesson completion: ${progress.is_completed}`)
    } else {
      // Create new progress record
      progress = await prisma.lessonProgress.create({
        data: {
          user_id: session.userId,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date()
        }
      })
      console.log(`✅ Created lesson completion: ${progress.is_completed}`)
    }

    return NextResponse.json({ 
      success: true, 
      isCompleted: progress.is_completed,
      completedAt: progress.completed_at
    })

  } catch (error) {
    console.error('❌ Error toggling lesson completion:', error)
    return NextResponse.json({ 
      error: 'Failed to toggle lesson completion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 