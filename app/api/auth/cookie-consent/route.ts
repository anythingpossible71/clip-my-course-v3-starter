import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { consented } = await request.json()
    
    if (typeof consented !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid consent value' },
        { status: 400 }
      )
    }

    // Get current session
    const session = await getSession()
    
    if (session) {
      // User is signed in - update their consent in database
      await prisma.user.update({
        where: { 
          id: session.userId,
          deleted_at: null
        },
        data: { 
          cookie_consent: consented 
        }
      })
    }

    // Set cookie consent cookie regardless of authentication status
    const response = NextResponse.json({ 
      success: true, 
      message: 'Cookie consent updated' 
    })

    if (consented) {
      response.cookies.set('cookieConsent', 'true', {
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
    } else {
      response.cookies.set('cookieConsent', 'false', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
    }

    return response

  } catch (error) {
    console.error('Error updating cookie consent:', error)
    return NextResponse.json(
      { error: 'Failed to update cookie consent' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (session) {
      // User is signed in - check their consent from database
      const user = await prisma.user.findUnique({
        where: { 
          id: session.userId,
          deleted_at: null
        },
        select: { cookie_consent: true }
      })
      
      return NextResponse.json({ 
        consented: user?.cookie_consent || false,
        authenticated: true
      })
    } else {
      // User is not signed in - check cookie only
      const cookieConsent = request.cookies.get('cookieConsent')?.value
      return NextResponse.json({ 
        consented: cookieConsent === 'true',
        authenticated: false
      })
    }

  } catch (error) {
    console.error('Error checking cookie consent:', error)
    return NextResponse.json(
      { error: 'Failed to check cookie consent' },
      { status: 500 }
    )
  }
}
