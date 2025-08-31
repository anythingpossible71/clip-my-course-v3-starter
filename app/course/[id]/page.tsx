"use client"

import { useState, useEffect, use } from "react"
import { ChevronDown, ChevronRight, ChevronLeft, Play, Check, ArrowLeft, ArrowRight, MoreVertical, Edit, Share, Copy, Loader2, Trash2, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { formatDuration } from "@/lib/utils/course-helpers"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Navbar } from "@/components/ui/navbar"

interface Lesson {
  id: string
  title: string
  description: string
  orderIndex: number
  videoUrl: string
  videoId: string
  duration: number
  thumbnail: string | null
  isFree: boolean
  completed?: boolean
}

interface Section {
  id: string
  title: string
  description: string
  orderIndex: number
  totalDuration: number
  totalLessons: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string | null
  isPublished: boolean
  isFree: boolean
  price: number | null
  totalDuration: number
  totalLessons: number
  totalSections: number
  slug: string
  category: string | null
  tags: string | null
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    email: string
    profile?: {
      id: string
      user_id: string
      first_name: string | null
      last_name: string | null
    } | null
  }
  sections: Section[]
  lessons?: Lesson[] // Level 0 videos (videos without sections)
  items?: (Section | Lesson)[] // Unified structure for rendering
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [openSections, setOpenSections] = useState<string[]>([])
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMyCourse, setIsMyCourse] = useState(false)
  
  // Share functionality states
  const [shareLoading, setShareLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [shareGenerated, setShareGenerated] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Fetch current user and course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch current user
        let currentUser = null
        try {
          const userResponse = await fetch('/api/auth/me')
          if (userResponse.ok) {
            currentUser = await userResponse.json()
            setCurrentUser(currentUser)
          }
        } catch (error) {
          console.log('User not authenticated, continuing without user data')
        }
        
        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${id}`)
        
        if (!courseResponse.ok) {
          if (courseResponse.status === 404) {
            throw new Error('Course not found')
          } else {
            throw new Error(`Failed to fetch course: ${courseResponse.status}`)
          }
        }
        
        const data = await courseResponse.json()
        const fetchedCourse = data.course
        
        if (!fetchedCourse) {
          throw new Error('Course data is invalid')
        }
        
        // Create a unified structure for the course view using the exact same logic as test page
        const unifiedItems: Array<{ item: any; globalOrderIndex: number }> = []
        
        // Add sections with their minimum globalOrderIndex (same as test page)
        fetchedCourse.sections.forEach((section: any) => {
          const sectionMinOrder = Math.min(...section.lessons.map((l: any) => l.globalOrderIndex || 0))
          unifiedItems.push({
            item: section,
            globalOrderIndex: sectionMinOrder
          })
        })
        
        // Add level 0 videos (same as test page)
        ;(fetchedCourse.lessons || []).forEach((lesson: any) => {
          unifiedItems.push({
            item: lesson,
            globalOrderIndex: lesson.globalOrderIndex || 0
          })
        })
        
        // Sort by globalOrderIndex to get the correct unified order (same as test page)
        unifiedItems.sort((a, b) => a.globalOrderIndex - b.globalOrderIndex)
        
        const unifiedCourse = {
          ...fetchedCourse,
          items: unifiedItems.map(({ item }) => item)
        }
        
        setCourse(unifiedCourse)
        
        // Check if this is the user's course
        if (currentUser) {
          setIsMyCourse(fetchedCourse.creator.id === currentUser.id)
        }
        
        // Set the first lesson as current lesson from the unified structure
        if (unifiedCourse.items && unifiedCourse.items.length > 0) {
          const firstItem = unifiedCourse.items[0]
          if ('lessons' in firstItem) {
            // First item is a section
            const section = firstItem as Section
            if (section.lessons.length > 0) {
              setCurrentLesson(section.lessons[0])
            }
          } else {
            // First item is a level 0 video
            setCurrentLesson(firstItem as Lesson)
          }
        }
        
        // Set all sections as open by default
        setOpenSections(fetchedCourse.sections.map((section: Section) => section.id))
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch course')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]))
  }

  const toggleLessonCompletion = async (lessonId: string) => {
    try {
      // Store the original state before optimistic update
      const originalCourse = course
      const originalCurrentLesson = currentLesson
      
      // Call the API first to get the new completion state
      const response = await fetch(`/api/lessons/${lessonId}/toggle-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to toggle lesson completion')
      }

      const result = await response.json()
      
      // Update the course state with the server response
      if (course) {
        const updatedCourse = {
          ...course,
          sections: course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, completed: result.isCompleted } : lesson,
      ),
          })),
          lessons: (course.lessons || []).map((lesson) =>
            lesson.id === lessonId ? { ...lesson, completed: result.isCompleted } : lesson,
          ),
          // Update the items array as well to ensure completion rate updates
          items: course.items?.map((item) => {
            if ('lessons' in item) {
              // This is a section
              return {
                ...item,
                lessons: item.lessons.map((lesson) =>
                  lesson.id === lessonId ? { ...lesson, completed: result.isCompleted } : lesson,
                ),
              }
            } else {
              // This is a level 0 video
              return item.id === lessonId ? { ...item, completed: result.isCompleted } : item
            }
          }),
        }

        // Update the course state
        setCourse(updatedCourse)
        
        // Also update currentLesson if it's the one being toggled
        if (currentLesson && currentLesson.id === lessonId) {
          setCurrentLesson({ ...currentLesson, completed: result.isCompleted })
        }
      }
      
      console.log(`✅ Toggled completion for lesson: ${lessonId} - ${result.isCompleted ? 'completed' : 'incomplete'}`)
    } catch (error) {
      console.error('❌ Error toggling lesson completion:', error)
      // You could add a toast notification here
    }
  }

  const getTotalLessons = () => {
    if (!course?.items) return 0
    
    return course.items.reduce((total, item) => {
      if ('lessons' in item) {
        // This is a section
        const section = item as Section
        return total + section.lessons.length
      } else {
        // This is a level 0 video
        return total + 1
      }
    }, 0)
  }

  const getCompletedLessons = () => {
    if (!course?.items) return 0
    
    return course.items.reduce((total, item) => {
      if ('lessons' in item) {
        // This is a section
        const section = item as Section
        return total + section.lessons.filter((lesson) => lesson.completed).length
      } else {
        // This is a level 0 video
        const lesson = item as Lesson
        return total + (lesson.completed ? 1 : 0)
      }
    }, 0)
  }

  const getCompletionRate = () => {
    const total = getTotalLessons()
    const completed = getCompletedLessons()
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  const getCurrentSectionTitle = () => {
    if (!course?.items || !currentLesson) return ""
    
    // Find the current lesson in the unified items array
    for (const item of course.items) {
      if ('lessons' in item) {
        // This is a section, check if current lesson belongs to it
        const section = item as Section
        if (section.lessons.some(lesson => lesson.id === currentLesson.id)) {
          return section.title
        }
      } else {
        // This is a level 0 video
        const lesson = item as Lesson
        if (lesson.id === currentLesson.id) {
          return "" // No section title for level 0 videos
        }
      }
    }
    
    return ""
  }

  const getCurrentLessonIndex = () => {
    if (!course?.items) return null
    
    // Find the current lesson in the unified items array
    for (let itemIndex = 0; itemIndex < course.items.length; itemIndex++) {
      const item = course.items[itemIndex]
      
      if ('lessons' in item) {
        // This is a section, check its lessons
        const section = item as Section
      for (let lessonIndex = 0; lessonIndex < section.lessons.length; lessonIndex++) {
        if (section.lessons[lessonIndex].id === currentLesson?.id) {
            return { itemIndex, sectionIndex: itemIndex, lessonIndex }
          }
        }
      } else {
        // This is a level 0 video
        const lesson = item as Lesson
        if (lesson.id === currentLesson?.id) {
          return { itemIndex, sectionIndex: -1, lessonIndex: 0 } // -1 indicates level 0 video
        }
      }
    }
    return null
  }

  const getPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (!currentIndex || !course?.items) return null

    const { itemIndex, sectionIndex, lessonIndex } = currentIndex
    
    // Handle level 0 videos
    if (sectionIndex === -1) {
      // Find the previous item in the unified array
      for (let i = itemIndex - 1; i >= 0; i--) {
        const prevItem = course.items[i]
        if ('lessons' in prevItem) {
          // Previous item is a section, get its last lesson
          const section = prevItem as Section
          if (section.lessons.length > 0) {
            return section.lessons[section.lessons.length - 1]
          }
        } else {
          // Previous item is a level 0 video
          return prevItem as Lesson
        }
      }
      return null
    }
    
    // Handle section lessons
    const currentSection = course.items[sectionIndex] as Section
    
    // Try to get previous lesson in same section
    if (lessonIndex > 0) {
      return currentSection.lessons[lessonIndex - 1]
    }
    
    // Try to get last lesson of previous item
    for (let i = sectionIndex - 1; i >= 0; i--) {
      const prevItem = course.items[i]
      if ('lessons' in prevItem) {
        const section = prevItem as Section
        if (section.lessons.length > 0) {
          return section.lessons[section.lessons.length - 1]
        }
      } else {
        // Previous item is a level 0 video
        return prevItem as Lesson
      }
    }
    
    return null
  }

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (!currentIndex || !course?.items) return null

    const { itemIndex, sectionIndex, lessonIndex } = currentIndex
    
    // Handle level 0 videos
    if (sectionIndex === -1) {
      // Find the next item in the unified array
      for (let i = itemIndex + 1; i < course.items.length; i++) {
        const nextItem = course.items[i]
        if ('lessons' in nextItem) {
          // Next item is a section, get its first lesson
          const section = nextItem as Section
          if (section.lessons.length > 0) {
            return section.lessons[0]
          }
        } else {
          // Next item is a level 0 video
          return nextItem as Lesson
        }
      }
      return null
    }
    
    // Handle section lessons
    const currentSection = course.items[sectionIndex] as Section
    
    // Try to get next lesson in same section
    if (lessonIndex < currentSection.lessons.length - 1) {
      return currentSection.lessons[lessonIndex + 1]
    }
    
    // Try to get first lesson of next item
    for (let i = sectionIndex + 1; i < course.items.length; i++) {
      const nextItem = course.items[i]
      if ('lessons' in nextItem) {
        const section = nextItem as Section
        if (section.lessons.length > 0) {
          return section.lessons[0]
        }
      } else {
        // Next item is a level 0 video
        return nextItem as Lesson
      }
    }
    
    return null
  }

  const formatLessonDuration = (durationInSeconds: number) => {
    return formatDuration(durationInSeconds)
  }

  const handleShareCourse = () => {
    setShareDialogOpen(true)
    setShareLoading(true)
    setShareGenerated(false)
    setCopySuccess(false)
    
    // Generate dynamic shared course
    generateDynamicSharedCourse()
  }

  const generateDynamicSharedCourse = async () => {
    try {
      if (!course) return
      
      const response = await fetch('/api/courses/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          courseData: course
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate shared course')
      }

      const result = await response.json()
      setShareUrl(result.shareUrl)
      setShareGenerated(true)
    } catch (error) {
      console.error('Error generating shared course:', error)
      // Handle error state
    } finally {
      setShareLoading(false)
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleEditCourse = () => {
    // Navigate to edit course page
    if (course) {
    window.location.href = `/create-course?edit=${course.id}`
    }
  }

  const handleDeleteCourse = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCourse = async () => {
    if (!course) return

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Redirect to courses page after successful deletion
        window.location.href = '/courses'
      } else {
        console.error('Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return // Don't handle navigation when typing in input fields
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          const prevLesson = getPreviousLesson()
          if (prevLesson) {
            setCurrentLesson(prevLesson)
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          const nextLesson = getNextLesson()
          if (nextLesson) {
            setCurrentLesson(nextLesson)
          }
          break
      }
    }

    // Listen for share course event from navbar
    const handleShareCourseEvent = () => {
      handleShareCourse()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('share-course', handleShareCourseEvent)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('share-course', handleShareCourseEvent)
    }
  }, [currentLesson, course])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The course you are looking for does not exist.'}</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Unified Layout - Responsive Design */}
      <div className="flex flex-col lg:flex-row flex-1 h-[calc(100vh-73px)] lg:h-[calc(100vh-73px)]">
        {/* Left Panel - Video Content */}
        <div className="w-full lg:w-auto lg:flex-1 flex flex-col min-h-0">
          <div className="p-4 lg:p-6 flex-1 min-h-0 flex flex-col h-full">
            {/* Current Section & Lesson Info */}
            <div className="mb-4 flex-shrink-0">
              <div className="text-sm text-muted-foreground mb-1">{getCurrentSectionTitle()}</div>
              <h2 className="text-xl lg:text-2xl font-bold mb-3">{currentLesson?.title}</h2>
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentLesson && toggleLessonCompletion(currentLesson.id)}
                  className={cn(
                    "gap-2 transition-all duration-200",
                    currentLesson?.completed 
                      ? "bg-green-500 text-white border-green-500" 
                      : "hover:bg-gray-100"
                  )}
                >
                  {currentLesson?.completed ? (
                  <Check className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4 text-muted-foreground" />
                  )}
                  {currentLesson?.completed ? "Completed" : "Mark Complete"}
                </Button>

                
                {/* Lesson Navigation - Now positioned above video */}
                <div className="flex items-center gap-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                disabled={!getPreviousLesson()}
                onClick={() => {
                  const prevLesson = getPreviousLesson()
               console.log('⬅️ Previous Lesson Selected:', {
                 lessonId: prevLesson?.id,
                 videoId: prevLesson?.videoId,
                 title: prevLesson?.title,
                 videoUrl: prevLesson?.videoUrl
               })
                  if (prevLesson) {
                    setCurrentLesson(prevLesson)
                  }
                }}
                    className={cn(
                      "h-9 w-9 p-0 rounded-full transition-all duration-200",
                      getPreviousLesson() 
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    )}
              >
                    <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                    variant="ghost"
                    size="sm"
                disabled={!getNextLesson()}
                onClick={() => {
                  const nextLesson = getNextLesson()
               console.log('➡️ Next Lesson Selected:', {
                 lessonId: nextLesson?.id,
                 videoId: nextLesson?.videoId,
                 title: nextLesson?.title,
                 videoUrl: nextLesson?.videoUrl
               })
                  if (nextLesson) {
                    setCurrentLesson(nextLesson)
                  }
                }}
                    className={cn(
                      "h-9 w-9 p-0 rounded-full transition-all duration-200",
                      getNextLesson() 
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
              </div>
            </div>

            {/* Desktop Video Player */}
            <Card className="mb-0 hidden lg:block w-full p-0">
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  {console.log('🎬 Video Player Debug:', {
                    lessonId: currentLesson?.id,
                    videoId: currentLesson?.videoId,
                    title: currentLesson?.title,
                    url: `https://www.youtube.com/embed/${currentLesson?.videoId}?autoplay=0&rel=0`
                  })}
                  <iframe
                    key={`${currentLesson?.id}-${currentLesson?.videoId}`}
                    src={`https://www.youtube.com/embed/${currentLesson?.videoId}?autoplay=0&rel=0`}
                    title={currentLesson?.title}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Mobile Video Player */}
            <Card className="mb-0 lg:hidden flex-1 flex flex-col p-0">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="w-full flex-1">
                  <div className="aspect-video w-full h-auto">
                    <iframe
                      key={`${currentLesson?.id}-${currentLesson?.videoId}-mobile`}
                      src={`https://www.youtube.com/embed/${currentLesson?.videoId}?autoplay=0&rel=0`}
                      title={currentLesson?.title}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Course Menu */}
        <div className="w-full lg:w-1/3 lg:max-w-[400px] border-t lg:border-l lg:border-t-0 bg-muted/30 flex flex-col min-h-0">
          <div className="p-4 border-b bg-background flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-semibold text-lg">{course.title}</h1>
              {/* Course Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isMyCourse && (
                    <DropdownMenuItem onClick={handleEditCourse}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Course
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleShareCourse}>
                    <Share className="h-4 w-4 mr-2" />
                    Share Course
                  </DropdownMenuItem>
                  {isMyCourse && (
                    <DropdownMenuItem onClick={handleDeleteCourse} className="text-red-600 focus:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Course
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                  {getCompletedLessons()}/{getTotalLessons()} lessons completed
              </span>
                <Badge variant="secondary" className="font-medium">
                  {getCompletionRate()}% Complete
              </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    getCompletionRate() === 100 ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${getCompletionRate()}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {(() => {
              // Create unified array using the same logic as test page
              const unifiedItems: Array<{ item: any; globalOrderIndex: number }> = []
              
              // Add sections with their minimum globalOrderIndex
              course.sections.forEach((section: any) => {
                const sectionMinOrder = Math.min(...section.lessons.map((l: any) => l.globalOrderIndex || 0))
                unifiedItems.push({
                  item: section,
                  globalOrderIndex: sectionMinOrder
                })
              })
              
              // Add level 0 videos
              ;(course.lessons || []).forEach((lesson: any) => {
                unifiedItems.push({
                  item: lesson,
                  globalOrderIndex: lesson.globalOrderIndex || 0
                })
              })
              
              // Sort by global_order_index to get the correct unified order
              unifiedItems.sort((a, b) => a.globalOrderIndex - b.globalOrderIndex)
              
              return unifiedItems.map(({ item }) => {
                if ('lessons' in item) {
                  // This is a section
                  const section = item as Section
              const sectionCompleted = section.lessons.every((lesson) => lesson.completed)
              const sectionProgress = section.lessons.filter((lesson) => lesson.completed).length
              const isOpen = openSections.includes(section.id)

              return (
                    <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)} className="bg-white border border-[#cccccc] pt-0 pr-5 pb-2.5 pl-2.5 rounded-[20px] mb-5">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 lg:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDown className="h-4 w-4 lg:h-4 lg:w-4" /> : <ChevronRight className="h-4 w-4 lg:h-4 lg:w-4" />}
                      <div className="text-left">
                            <div className="font-medium text-sm lg:text-base">{section.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {sectionProgress}/{section.lessons.length} lessons
                        </div>
                      </div>
                    </div>
                        {sectionCompleted && <Check className="h-4 w-4 lg:h-4 lg:w-4 text-green-500" />}
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-4 mt-2 space-y-1">
                    {section.lessons.map((lesson) => {
                          const isCurrentLesson = lesson.id === currentLesson?.id

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                                "flex items-center gap-3 lg:gap-3 p-3 lg:p-3 rounded-lg cursor-pointer transition-colors",
                            isCurrentLesson ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50",
                          )}
                          onClick={() => {
                                console.log('📋 Menu Section Lesson Selected:', {
                                  lessonId: lesson.id,
                                  videoId: lesson.videoId,
                                  title: lesson.title,
                                  videoUrl: lesson.videoUrl
                                })
                            setCurrentLesson(lesson)
                                // Scroll to top on mobile to show the video
                                if (window.innerWidth < 1024) {
                                  window.scrollTo({ top: 0, behavior: "smooth" })
                                }
                          }}
                        >
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                                  <div className="w-6 h-6 lg:w-6 lg:h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="h-3 w-3 lg:h-3 lg:w-3 text-white" />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                      "w-6 h-6 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center",
                                  isCurrentLesson
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground",
                                )}
                              >
                                    <Play className="h-3 w-3 lg:h-3 lg:w-3" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                                <div className={cn("font-medium text-sm lg:text-sm", isCurrentLesson && "text-primary")}>
                              {lesson.title}
                            </div>
                                <div className="text-xs lg:text-xs text-muted-foreground">{formatLessonDuration(lesson.duration)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )
                } else {
                  // This is a level 0 video
                  const lesson = item as Lesson
                  const isCurrentLesson = lesson.id === currentLesson?.id

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                        "flex items-center gap-3 lg:gap-3 p-3 lg:p-3 rounded-lg cursor-pointer transition-colors",
                            isCurrentLesson ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50",
                          )}
                          onClick={() => {
                        console.log('📋 Menu Level 0 Lesson Selected:', {
                          lessonId: lesson.id,
                          videoId: lesson.videoId,
                          title: lesson.title,
                          videoUrl: lesson.videoUrl
                        })
                            setCurrentLesson(lesson)
                            // Scroll to top on mobile to show the video
                        if (window.innerWidth < 1024) {
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                          }}
                        >
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                          <div className="w-6 h-6 lg:w-6 lg:h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 lg:h-3 lg:w-3 text-white" />
                              </div>
                            ) : (
                              <div
                                className={cn(
                              "w-6 h-6 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center",
                                  isCurrentLesson
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground",
                                )}
                              >
                            <Play className="h-3 w-3 lg:h-3 lg:w-3" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                        <div className={cn("font-medium text-sm lg:text-sm", isCurrentLesson && "text-primary")}>
                              {lesson.title}
                            </div>
                        <div className="text-xs lg:text-xs text-muted-foreground">{formatLessonDuration(lesson.duration)}</div>
                          </div>
                        </div>
                      )
                }
              })
            })()}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share your course
            </DialogTitle>
          </DialogHeader>
          
          {shareLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-center text-muted-foreground">
                Preparing your course for sharing...
              </p>
            </div>
          ) : shareGenerated ? (
            <div className="space-y-4">
              <div className="text-center">
                <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Your course is ready for sharing. Anyone with the link will be able to access your course.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input 
                    value={shareUrl} 
                    readOnly 
                    className="flex-1"
                    placeholder="Share URL will appear here"
                  />
                  <Button 
                    onClick={copyShareLink}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="h-4 w-4" />
                        Link copied
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4" />
                        Copy course link
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShareDialogOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Something went wrong. Please try again.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{course?.title}"? This action cannot be undone.
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