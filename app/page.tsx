import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Video, Share2, BarChart3, Play, Focus } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                src="/applogo.png" 
                alt="ClipMyCourse" 
                width={32} 
                height={32} 
                className="mr-3"
              />
              <span className="text-xl font-bold text-gray-900">ClipMyCourse</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Turn YouTube Playlists
              <br />
              <span className="text-red-600">Into Focused Courses</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform any YouTube video playlist into a distraction-free learning experience. 
              Stay focused without YouTube's distractions and track your progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/auth/signup">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to create your focused learning experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>1. Paste YouTube Link</CardTitle>
                <CardDescription>
                  Simply paste any YouTube video or playlist URL you want to learn from.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Video className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>2. Auto-Create & Share</CardTitle>
                <CardDescription>
                  We automatically extract videos, organize them, and create a shareable course.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>3. Track Progress</CardTitle>
                <CardDescription>
                  Mark lessons complete and see your learning progress without distractions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Focused, Learn Better
            </h2>
            <p className="text-lg text-gray-600">
              Distraction-free learning from your favorite YouTube content
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Focus className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>No Distractions</CardTitle>
                <CardDescription>
                  Learn without YouTube's recommended videos, comments, and other distractions.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Share Your Learning</CardTitle>
                <CardDescription>
                  Generate a clean, shareable link to your course that anyone can access.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-red-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Learn Without Distractions?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Turn any YouTube playlist into a focused learning experience.
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-gray-100">
            <Link href="/auth/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/applogo.png" 
              alt="ClipMyCourse" 
              width={32} 
              height={32} 
              className="mr-3"
            />
            <span className="text-lg font-semibold">ClipMyCourse</span>
          </div>
          <p className="text-gray-400">
            Distraction-free learning from YouTube content
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>&copy; 2024 ClipMyCourse</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
