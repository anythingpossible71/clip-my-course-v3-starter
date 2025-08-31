import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encodeId, decodeId } from '@/lib/utils/sqids'

export async function POST(request: NextRequest) {
  try {
    const { courseId, courseData } = await request.json()

    if (!courseId || !courseData) {
      return NextResponse.json({ error: 'Missing course data' }, { status: 400 })
    }

    // Decode the course ID from the encoded string
    const decodedCourseId = decodeId(courseId)
    if (!decodedCourseId) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    // Generate a longer unique identifier (3x longer than before)
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).substring(2, 15)
    const additionalRandom = Math.random().toString(36).substring(2, 15)
    const longIdentifier = `${timestamp}_${randomPart}_${additionalRandom}`

    // Update course in database to mark as shared
    await prisma.course.update({
      where: { id: decodedCourseId },
      data: {
        isShared: true,
        sharedCourseId: longIdentifier,
      },
    })

    // Return the new dynamic URL format
    const dynamicShareUrl = `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}/shared?cid=${longIdentifier}`
    console.log(`🎉 Dynamic shared course created with URL: ${dynamicShareUrl}`)

    return NextResponse.json({ 
      success: true, 
      sharedCourseId: longIdentifier, 
      shareUrl: dynamicShareUrl 
    })
  } catch (error) {
    console.error('Error creating dynamic shared course:', error)
    return NextResponse.json({ error: 'Failed to create dynamic shared course' }, { status: 500 })
  }
} 