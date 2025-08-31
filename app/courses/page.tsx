"use client"

import { useState, useEffect } from "react"
import { Plus, Play, Clock, User, LogOut, MoreVertical, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Navbar } from "@/components/ui/navbar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { formatDuration } from "@/lib/utils/course-helpers"

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  totalLessons: number
  totalDuration: number
  isPublished: boolean
  isFree: boolean
  price: number | null
  slug: string
  category: string
  createdAt: string
  sharedCourseId?: string | null
  savedAt?: string
  creator: {
    id: string
    email: string
    profile?: {
      first_name?: string
      last_name?: string
    }
  }
  sections?: Array<{
    id: string
    title: string
    description: string
    orderIndex: number
    totalDuration: number
    totalLessons: number
    lessons: Array<{
      id: string
      title: string
      description: string
      orderIndex: number
      videoUrl: string
      videoId: string
      duration: number
      thumbnail: string | null
      isFree: boolean
      level: number
      globalOrderIndex: number
      completed: boolean
    }>
  }>
  lessons?: Array<{
    id: string
    title: string
    description: string
    orderIndex: number
    videoUrl: string
    videoId: string
    duration: number
    thumbnail: string | null
    isFree: boolean
    level: number
    globalOrderIndex: number
    completed: boolean
  }>
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [savedCourses, setSavedCourses] = useState<Course[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const router = useRouter()

  useEffect(() => {
      const initializePage = async () => {
    const isAuthenticated = await fetchCurrentUser()
    if (isAuthenticated) {
      fetchCourses()
      fetchSavedCourses()
    }
  }
    
    initializePage()
  }, [])

  // Refresh courses when the page becomes visible (user returns from course page)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && currentUser) {
        fetchCourses()
        fetchSavedCourses()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentUser])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
        return true // User is authenticated
      } else {
        console.log('Not authenticated, redirecting to sign in...')
        setCurrentUser(null)
        router.push('/auth/signin')
        return false // User is not authenticated
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setCurrentUser(null)
      router.push('/auth/signin')
      return false // User is not authenticated
    }
  }

  const fetchCourses = async () => {
    try {
      console.log('🔍 Fetching courses...')
      const response = await fetch('/api/courses')
      console.log('📡 Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Courses data:', data)
        
        // Debug completion data
        data.courses.forEach((course: Course) => {
          const completion = calculateCourseCompletion(course)
          console.log(`📊 Course "${course.title}": ${completion.completed}/${completion.total} lessons (${completion.percentage}%)`)
        })
        
        setCourses(data.courses)
      } else if (response.status === 401) {
        console.log('Unauthorized, redirecting to sign in...')
        router.push('/auth/signin')
      } else {
        console.error('Failed to fetch courses')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      // If there's a network error or other issue, redirect to sign in
      router.push('/auth/signin')
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  const fetchSavedCourses = async () => {
    try {
      console.log('🔍 Fetching saved courses...')
      const response = await fetch('/api/courses/saved')
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Saved courses data:', data)
        
        // Debug each saved course
        if (data.courses) {
          data.courses.forEach((course: any, index: number) => {
            console.log(`📚 Saved course ${index + 1}:`, {
              id: course.id,
              title: course.title,
              sharedCourseId: course.sharedCourseId,
              savedAt: course.savedAt
            })
          })
        }
        
        setSavedCourses(data.courses || [])
      } else if (response.status === 401) {
        console.log('Unauthorized, redirecting to sign in...')
        router.push('/auth/signin')
      } else {
        console.error('Failed to fetch saved courses')
        setSavedCourses([])
      }
    } catch (error) {
      console.error('Error fetching saved courses:', error)
      setSavedCourses([])
    }
  }

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
  }

  const calculateCourseCompletion = (course: Course) => {
    let completedLessons = 0
    let totalLessons = 0

    // Count lessons in sections
    if (course.sections) {
      course.sections.forEach(section => {
        section.lessons.forEach(lesson => {
          totalLessons++
          if (lesson.completed) {
            completedLessons++
          }
        })
      })
    }

    // Count level 0 lessons (lessons without sections)
    if (course.lessons) {
      course.lessons.forEach(lesson => {
        totalLessons++
        if (lesson.completed) {
          completedLessons++
        }
      })
    }

    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return

    try {
      const response = await fetch(`/api/courses/${courseToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Remove the course from the local state
        setCourses(courses.filter(course => course.id !== courseToDelete.id))
        setDeleteDialogOpen(false)
        setCourseToDelete(null)
      } else {
        console.error('Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const handleRemoveSavedCourse = async (course: Course) => {
    try {
      const response = await fetch('/api/courses/save', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id
        }),
      })

      if (response.ok) {
        // Remove the course from the saved courses list
        setSavedCourses(savedCourses.filter(savedCourse => savedCourse.id !== course.id))
      } else {
        console.error('Failed to remove saved course')
      }
    } catch (error) {
      console.error('Error removing saved course:', error)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/applogo.png" alt="ClipMyCourse" className="h-8 w-auto" />
              </div>
              <div className="flex items-center gap-4">
                <Link href="/create-course">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Course
                  </Button>
                </Link>
                
                {/* User Avatar Dropdown */}
                {currentUser && (
                  <UserAvatar user={currentUser} size="sm" />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar 
        actionButton={
          <Link href="/create-course">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Courses</h2>
          <p className="text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Play className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first course to get started with teaching and sharing your knowledge.
              </p>
              <Link href="/create-course">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Course
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const completion = calculateCourseCompletion(course)
              const progressPercentage = completion.percentage
              const isCompleted = progressPercentage === 100
              const formattedDuration = formatDuration(course.totalDuration)

              return (
                <Card key={course.id} className="group hover:shadow-lg transition-all duration-200 h-full relative">
                  <div className="absolute top-4 right-4 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-white/40 hover:bg-white/90 backdrop-blur-sm transition-all"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault()
                            router.push(`/create-course?edit=${course.id}`)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault()
                            handleDeleteCourse(course)
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Link href={`/course/${course.id}`}>
                    <div className="cursor-pointer">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Play className="h-4 w-4" />
                          <span>{course.totalLessons} lessons</span>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>
                            {completion.completed}/{completion.total} lessons
                          </span>
                          <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? "bg-green-500" : "bg-primary"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formattedDuration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{course.creator.profile?.first_name || course.creator.email.split('@')[0]}</span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      {course.category && (
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                    </div>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}

        {/* Shared With Me Section */}
        {savedCourses.length > 0 && (
          <div className="mt-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Shared With Me</h2>
              <p className="text-muted-foreground">
                {savedCourses.length} course{savedCourses.length !== 1 ? "s" : ""} saved from other creators
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCourses.map((course) => {
                const formattedDuration = formatDuration(course.totalDuration)

                return (
                  <Card key={course.id} className="group hover:shadow-lg transition-all duration-200 h-full relative">
                    <div className="absolute top-4 right-4 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-white/40 hover:bg-white/90 backdrop-blur-sm transition-all"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault()
                              router.push(`/shared?cid=${course.sharedCourseId}`)
                            }}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            View Course
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault()
                              handleRemoveSavedCourse(course)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove from Saved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <Link href={`/shared?cid=${course.sharedCourseId}`}>
                      <div className="cursor-pointer">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center gap-2 text-white text-sm">
                            <Play className="h-4 w-4" />
                            <span>{course.totalLessons} lessons</span>
                          </div>
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-green-600 text-white text-xs">
                            Saved
                          </Badge>
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Course Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formattedDuration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{course.creator.profile?.first_name || course.creator.email.split('@')[0]}</span>
                          </div>
                        </div>

                        {/* Category Badge */}
                        {course.category && (
                          <div className="mt-3">
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                      </div>
                    </Link>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 