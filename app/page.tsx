import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Video, Share2, BarChart3, Play, Focus, Copy, Edit, CheckCircle } from 'lucide-react'
import { getSession } from '@/lib/auth/auth'

export default async function HomePage() {
  // Check if user is authenticated
  const session = await getSession()
  
  // If user is signed in, redirect to courses page
  if (session) {
    redirect('/courses')
  }

    return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                src="/applogo.png" 
                alt="ClipMyCourse" 
                width={219} 
                height={48}
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-red-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/create-course">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Clip a course
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span style={{ color: 'rgb(220, 38, 38)' }}>Turn YouTube videos</span>
              <br />
              <span style={{ color: '#000000' }}>into online courses</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Turn random YouTube scrolling into effective focused learning sessions. Create courses and track your progress takes just a few clicks.
            </p>
            <div className="flex justify-center">
              <Link href="/create-course">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
                  Clip a course
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Create your course in seconds
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to transform any YouTube content into a structured learning experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Copy className="h-6 w-6 text-red-600" />
              </div>
                <CardTitle className="text-xl text-gray-900">1. Paste YouTube links and playlists</CardTitle>
            </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simply copy and paste any YouTube video or playlist URL
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit className="h-6 w-6 text-red-600" />
              </div>
                <CardTitle className="text-xl text-gray-900">2. Edit & publish your course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Organize videos into sections and customize your course structure
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">3. Track your progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor your learning journey with built-in progress tracking
                </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-red-600" />
        </div>
                <CardTitle className="text-xl text-gray-900">Progress Tracking</CardTitle>
            </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Keep track of your learning progress with visual indicators and completion tracking for each lesson.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Share2 className="h-6 w-6 text-red-600" />
              </div>
                <CardTitle className="text-xl text-gray-900">Easy Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Share your courses with friends, students, or the world. Generate shareable links instantly.
                </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start learning?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Transform any YouTube content into a structured course in minutes
          </p>
          <Link href="/create-course">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Clip your first course
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image 
                src="/applogo.png" 
                alt="ClipMyCourse" 
                width={219} 
                height={48}
                className="h-6 w-auto"
              />
            </div>
            <div className="text-gray-500 text-sm">
              © 2024 ClipMyCourse. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
