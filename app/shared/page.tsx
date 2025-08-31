"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, ChevronLeft, Play, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/utils/course-helpers"
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

export default function SharedCoursePage() {
  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [openSections, setOpenSections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCourseSaved, setIsCourseSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showSignInDialog, setShowSignInDialog] = useState(false)

  // Get course ID from URL query parameter
  const [courseId, setCourseId] = useState<string | null>(null)

  useEffect(() => {
    // Get the 'cid' parameter from the URL
    const urlParams = new URLSearchParams(window.location.search)
    const cid = urlParams.get('cid')
    setCourseId(cid)
  }, [])

  // Fetch current user and check for redirect
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const user = await response.json()
          setCurrentUser(user)
          
          // Check if this is the user's own course and redirect
          if (course && user && course.creator.id === user.id) {
            console.log('🔄 Redirecting to own course view:', {
              courseId: course.id,
              userId: user.id,
              courseCreatorId: course.creator.id
            })
            window.location.href = `/course/${course.id}`
            return
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchCurrentUser()
  }, [course]) // Add course as dependency to check after course loads

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return

      try {
        setLoading(true)
        
        // Find course by sharedCourseId
        const response = await fetch(`/api/courses/shared/${courseId}`)
        
        if (!response.ok) {
          throw new Error('Course not found or not shared')
        }

        const courseData = await response.json()
        
        console.log('📦 Course data received:', {
          id: courseData.id,
          title: courseData.title,
          sharedCourseId: courseData.sharedCourseId
        })
        
        // Create a unified structure for the course view using the exact same logic as main course page
        const unifiedItems: Array<{ item: any; globalOrderIndex: number }> = []
        
        // Add sections with their minimum globalOrderIndex (same as main course page)
        courseData.sections.forEach((section: any) => {
          if (section.lessons && section.lessons.length > 0) {
            const sectionMinOrder = Math.min(...section.lessons.map((l: any) => l.globalOrderIndex || 0))
            unifiedItems.push({
              item: section,
              globalOrderIndex: sectionMinOrder
            })
          }
        })
        
        // Add level 0 videos (same as main course page)
        ;(courseData.lessons || []).forEach((lesson: any) => {
          unifiedItems.push({
            item: lesson,
            globalOrderIndex: lesson.globalOrderIndex || 0
          })
        })
        
        // Sort by globalOrderIndex to get the correct unified order (same as main course page)
        unifiedItems.sort((a, b) => a.globalOrderIndex - b.globalOrderIndex)
        
        const unifiedCourse = {
          ...courseData,
          items: unifiedItems.map(({ item }) => item)
        }
        
        setCourse(unifiedCourse)
        
        // Check if course is already saved by current user
        if (courseData.savedCourses && courseData.savedCourses.length > 0) {
          setIsCourseSaved(true)
          // Show alert for saved course
          alert('✅ This course is already in your saved courses!')
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
        setOpenSections(courseData.sections.map((section: Section) => section.id))
        
      } catch (error) {
        console.error('Error fetching course:', error)
        setError('Course not found or not available for sharing')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]))
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

  const handleSaveCourse = async () => {
    if (!course || !currentUser) return

    try {
      setSaveLoading(true)
      setSaveMessage(null)

      console.log('💾 Saving course:', {
        courseId: course.id,
        courseTitle: course.title,
        sharedCourseId: course.sharedCourseId
      })

      const response = await fetch('/api/courses/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsCourseSaved(true)
        setSaveMessage('Course saved successfully!')
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage(null)
        }, 3000)
      } else {
        setSaveMessage(result.error || 'Failed to save course')
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setSaveMessage(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Error saving course:', error)
      setSaveMessage('Failed to save course')
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    } finally {
      setSaveLoading(false)
    }
  }

  const toggleLessonCompletion = async (lessonId: string) => {
    if (!currentUser) {
      setShowSignInDialog(true)
      return
    }

    try {
      console.log(`🔄 Toggling completion for lesson: ${lessonId}`)

      const response = await fetch(`/api/lessons/${lessonId}/toggle-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error('Failed to toggle lesson completion')
      }

      // Update the course data to reflect the new completion status
      if (course) {
        const updatedCourse = { ...course }
        
        // Update the current lesson's completion status
        if (currentLesson && currentLesson.id === lessonId) {
          const updatedLesson = { ...currentLesson, completed: result.isCompleted }
          setCurrentLesson(updatedLesson)
        }

        // Update the lesson in the course data
        const updateLessonInCourse = (lessons: any[]) => {
          return lessons.map(lesson => 
            lesson.id === lessonId 
              ? { ...lesson, completed: result.isCompleted }
              : lesson
          )
        }

        // Update lessons in sections
        if (updatedCourse.sections) {
          updatedCourse.sections = updatedCourse.sections.map(section => ({
            ...section,
            lessons: updateLessonInCourse(section.lessons)
          }))
        }

        // Update level 0 lessons
        if (updatedCourse.lessons) {
          updatedCourse.lessons = updateLessonInCourse(updatedCourse.lessons)
        }

        setCourse(updatedCourse)
      }

      console.log(`✅ Toggled completion for lesson: ${lessonId} - ${result.isCompleted ? 'completed' : 'incomplete'}`)
    } catch (error) {
      console.error('Error toggling lesson completion:', error)
      setSaveMessage('Failed to update lesson completion')
      setTimeout(() => setSaveMessage(null), 3000)
    }
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

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentLesson, course])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shared course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
          <p className="text-muted-foreground">{error || 'This shared course is not available.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
              <Navbar 
          showSaveButton={!!currentUser && !!course}
          onSaveCourse={handleSaveCourse}
          isCourseSaved={isCourseSaved}
        />

      {/* Save Message */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${
            saveMessage.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {saveMessage}
          </div>
        </div>
      )}

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
                {/* Mark as Complete Button */}
                {currentLesson && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentUser) {
                        toggleLessonCompletion(currentLesson.id)
                      } else {
                        setShowSignInDialog(true)
                      }
                    }}
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
                )}

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
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {getTotalLessons()} lessons
                </span>
                {currentUser && (
                  <span>
                    {(() => {
                      const completedLessons = course.sections?.reduce((total, section) => 
                        total + section.lessons.filter(lesson => lesson.completed).length, 0
                      ) || 0 + (course.lessons?.filter(lesson => lesson.completed).length || 0)
                      
                      const totalLessons = getTotalLessons()
                      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
                      
                      return `${completedLessons}/${totalLessons} completed (${progressPercentage}%)`
                    })()}
                  </span>
                )}
              </div>
              {currentUser && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(() => {
                        const completedLessons = course.sections?.reduce((total, section) => 
                          total + section.lessons.filter(lesson => lesson.completed).length, 0
                        ) || 0 + (course.lessons?.filter(lesson => lesson.completed).length || 0)
                        
                        const totalLessons = getTotalLessons()
                        return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
                      })()}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {(() => {
              // Create unified array using the same logic as main course page
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
                  const isOpen = openSections.includes(section.id)

                  return (
                    <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)} className="bg-white border border-[#cccccc] pt-0 pr-5 pb-2.5 pl-2.5 rounded-[20px] mb-5">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 lg:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDown className="h-4 w-4 lg:h-4 lg:w-4" /> : <ChevronRight className="h-4 w-4 lg:h-4 lg:w-4" />}
                          <div className="text-left">
                            <div className="font-medium text-sm lg:text-base">{section.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {section.lessons.length} lessons
                            </div>
                          </div>
                        </div>
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
                                <div
                                  className={cn(
                                    "w-6 h-6 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center",
                                    isCurrentLesson
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : lesson.completed
                                      ? "border-green-500 bg-green-500 text-white"
                                      : "border-muted-foreground",
                                  )}
                                >
                                  {lesson.completed ? (
                                    <Check className="h-3 w-3 lg:h-3 lg:w-3" />
                                  ) : (
                                    <Play className="h-3 w-3 lg:h-3 lg:w-3" />
                                  )}
                                </div>
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
                        <div
                          className={cn(
                            "w-6 h-6 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center",
                            isCurrentLesson
                              ? "border-primary bg-primary text-primary-foreground"
                              : lesson.completed
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-muted-foreground",
                          )}
                        >
                          {lesson.completed ? (
                            <Check className="h-3 w-3 lg:h-3 lg:w-3" />
                          ) : (
                            <Play className="h-3 w-3 lg:h-3 lg:w-3" />
                          )}
                        </div>
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

      {/* Sign In Dialog */}
      <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to save your progress</DialogTitle>
            <DialogDescription>
              Create an account or sign in to track your progress on this course. Your completion status will be saved and you can continue where you left off.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSignInDialog(false)}
              className="w-full sm:w-auto"
            >
              Continue without signing in
            </Button>
            <Button
              onClick={() => {
                setShowSignInDialog(false)
                const currentUrl = window.location.href
                // Add a special parameter to indicate this is a shared course redirect
                const redirectUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}check_owner=true`
                window.location.href = `/auth/signin?redirect=${encodeURIComponent(redirectUrl)}`
              }}
              className="w-full sm:w-auto"
            >
              Sign in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 