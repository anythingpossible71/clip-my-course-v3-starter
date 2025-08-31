import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/permissions'
import { transformUserForResponse } from '@/lib/utils/api-transforms'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Transform user for response with encoded IDs
    const transformedUser = transformUserForResponse(user)

    return NextResponse.json(transformedUser)

  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 