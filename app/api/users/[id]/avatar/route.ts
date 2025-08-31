import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decodeId } from '@/lib/utils/sqids'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Decode the ID from the URL parameter
    const userId = decodeId(id)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        deleted_at: null
      },
      include: {
        profile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For now, return a placeholder avatar
    // In a real app, you might store actual avatar images
    const avatarUrl = `/placeholder.svg?height=40&width=40&text=${user.profile?.first_name?.[0] || user.email[0]}`

    return NextResponse.json({ 
      avatarUrl,
      user: {
        id: id,
        email: user.email,
        profile: user.profile
      }
    })

  } catch (error) {
    console.error('Error fetching user avatar:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user avatar',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 