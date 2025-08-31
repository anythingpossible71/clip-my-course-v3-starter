import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play, BookOpen, Users, Star, Zap, Shield, Globe, Video, Share2, BarChart3, MessageCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">ClipMyCourse</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Transform Your Learning Experience
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create, Share, and
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Master</span>
              <br />
              Your Courses
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Build interactive courses with video lessons, track progress, and share knowledge with the world. 
              Join thousands of educators and learners creating amazing content with ClipMyCourse.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/auth/signup">
                  Start Creating Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>10,000+ creators</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>50,000+ courses</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create Amazing Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed for educators, creators, and anyone who wants to share knowledge effectively.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Video Lessons</CardTitle>
                <CardDescription>
                  Upload and organize video content with automatic progress tracking and engagement analytics.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Share & Collaborate</CardTitle>
                <CardDescription>
                  Share courses publicly or privately, collaborate with other creators, and build your audience.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor learner progress, completion rates, and engagement with detailed analytics and insights.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Community Features</CardTitle>
                <CardDescription>
                  Build a community around your courses with discussions, comments, and peer-to-peer learning.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security, reliable hosting, and 99.9% uptime guarantee for your content.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Optimized for speed with global CDN, adaptive streaming, and mobile-first responsive design.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of creators who have transformed their teaching with ClipMyCourse.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "ClipMyCourse revolutionized how I teach. The video organization and progress tracking features are incredible. My students love the interactive experience!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Computer Science Professor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The sharing features are amazing! I can easily share my courses with colleagues and students. The analytics help me understand what content resonates most."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">MC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Michael Chen</p>
                    <p className="text-sm text-gray-500">Online Course Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "As a corporate trainer, I needed a platform that could handle our scale. ClipMyCourse delivers with enterprise features and excellent support."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">AL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Amanda Lee</p>
                    <p className="text-sm text-gray-500">Corporate Training Director</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators and start building your first course today. 
            It's free to get started, and you can upgrade anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/auth/signup">
                Create Your First Course
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/auth/signin">
                Sign In to Continue
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">ClipMyCourse</span>
              </div>
              <p className="text-gray-400">
                Empowering educators and creators to share knowledge through interactive video courses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">API</Link></li>
                <li><Link href="#" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white">Tutorials</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ClipMyCourse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
