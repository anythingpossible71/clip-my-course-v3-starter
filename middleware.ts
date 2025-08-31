import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/token'

export async function middleware(request: NextRequest) {
  // TEMPORARILY DISABLE MIDDLEWARE FOR BROWSER TESTING
  console.log('🔍 Middleware - DISABLED for browser testing')
  return NextResponse.next()

  const { pathname } = request.nextUrl

  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value

  console.log('🔍 Middleware - Pathname:', pathname)
  console.log('🔍 Middleware - Token exists:', !!token)

  // Verify the token
  let session = null
  if (token) {
    try {
      const decoded = verifyToken(token)
      console.log('🔍 Middleware - Token decoded:', decoded)
      if (decoded && decoded.type === 'access') {
        session = { userId: decoded.userId }
        console.log('🔍 Middleware - Session created:', session)
      } else {
        console.log('🔍 Middleware - Token invalid or wrong type:', decoded)
      }
    } catch (error) {
      console.log('🔍 Middleware - Token verification error:', error)
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/courses', '/create-course', '/course']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Auth routes that should redirect to courses if already logged in
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  console.log('🔍 Middleware - Is protected route:', isProtectedRoute)
  console.log('🔍 Middleware - Is auth route:', isAuthRoute)
  console.log('🔍 Middleware - Has session:', !!session)

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    console.log('🔍 Middleware - Redirecting to login (no session)')
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth route with session, redirect to courses
  if (isAuthRoute && session) {
    console.log('🔍 Middleware - Redirecting to courses (has session)')
    return NextResponse.redirect(new URL('/courses', request.url))
  }

  console.log('🔍 Middleware - Continuing to next')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/courses/:path*',
    '/create-course/:path*',
    '/course/:path*',
    '/auth/:path*',
  ],
} 