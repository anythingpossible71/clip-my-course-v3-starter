"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Plus, Trash2, GripVertical, Youtube, ChevronUp, ChevronDown, Edit, SquareMinus, SquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import { AddVideoModal } from "@/components/ui/add-video-modal"

interface Video {
  id: string
  title: string
  description?: string
  videoUrl: string
  duration?: string
  level: 0 | 1
  sectionId?: string
}

interface Section {
  id: string
  title: string
  lessons: Video[]
}

interface Course {
  title: string
  description: string
  sections: Section[]
  videos: Video[]  // This will be removed - videos will be in unified structure
  items: (Section | Video)[]  // New unified structure for level 0
}

interface VideoDropIndicator {
  sectionId: string
  videoId: string
  position: "top" | "bottom"
}

interface SectionDropIndicator {
  sectionId: string
  position: "top" | "bottom"
}

interface DeleteConfirmation {
  type: "section" | "video"
  sectionId: string
  videoId?: string
  title: string
}

export default function CreateCoursePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const editCourseId = searchParams.get('edit')
  const isEditMode = !!editCourseId

  // Authentication state
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const user = await response.json()
          setCurrentUser(user)
          setIsAuthenticated(true)
        } else {
          // User is not authenticated, redirect to sign in
          const currentUrl = encodeURIComponent(window.location.href)
          router.push(`/auth/signin?redirect=${currentUrl}`)
          return
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // On error, redirect to sign in
        const currentUrl = encodeURIComponent(window.location.href)
        router.push(`/auth/signin?redirect=${currentUrl}`)
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the page if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Initialize with empty course for create mode, or fetch course data for edit mode
  const [course, setCourse] = useState<Course>({
    title: "",
    description: "",
    sections: [],
    videos: [], // Will be removed
    items: []  // New unified structure
  })
  const [originalCourse, setOriginalCourse] = useState<Course | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Function to check if there are unsaved changes
  const checkForUnsavedChanges = (currentCourse: Course) => {
    if (!originalCourse) return false
    return JSON.stringify(originalCourse) !== JSON.stringify(currentCourse)
  }

  // Wrapper function to update course and track changes
  const updateCourse = (updater: (prev: Course) => Course) => {
    setCourse(prev => {
      const newCourse = updater(prev)
      const hasChanges = checkForUnsavedChanges(newCourse)
      setHasUnsavedChanges(hasChanges)
      return newCourse
    })
  }

  // Navigation guard function
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path)
      setShowUnsavedDialog(true)
    } else {
      router.push(path)
    }
  }

  // Dialog handlers
  const handleUpdateAndNavigate = async () => {
    await handleSaveChanges()
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  const handleDiscardAndNavigate = () => {
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
  }

  // Navigation guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Fetch course data if in edit mode
  useEffect(() => {
    if (isEditMode && editCourseId) {
      console.log('🎯 Edit mode detected with course ID:', editCourseId)
      fetchCourseData(editCourseId)
    }
  }, [isEditMode, editCourseId])

  const fetchCourseData = async (courseId: string) => {
    try {
      console.log('🔍 Fetching course data for ID:', courseId)
      const response = await fetch(`${window.location.origin}/api/courses/${courseId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const fetchedCourse = data.course
        console.log('📦 Fetched course data:', fetchedCourse)
        console.log('📦 Sections with IDs:', fetchedCourse.sections.map(s => ({ id: s.id, title: s.title, type: typeof s.id })))
        
        // Transform the fetched course data to match our local structure
        const transformedCourse: Course = {
          title: fetchedCourse.title,
          description: fetchedCourse.description,
          sections: fetchedCourse.sections.map((section: any) => ({
            id: section.id,
            title: section.title,
            lessons: section.lessons.map((lesson: any) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              videoUrl: lesson.videoUrl, // API response uses camelCase
              duration: lesson.duration ? Math.floor(lesson.duration / 60) + ":" + String(lesson.duration % 60).padStart(2, '0') : "",
              level: 1,
              sectionId: section.id
            }))
          })),
          videos: [], // For now, we'll start with empty videos array
          items: (() => {
            // Create a unified array that includes both sections and level 0 videos
            const unifiedItems: Array<{ item: Section | Video; globalOrderIndex: number }> = []
            
            // Add sections with their minimum globalOrderIndex
            fetchedCourse.sections.forEach((section: any) => {
              const sectionMinOrder = Math.min(...section.lessons.map((l: any) => l.globalOrderIndex || 0))
              unifiedItems.push({
                item: {
                  id: section.id,
                  title: section.title,
                  lessons: section.lessons.map((lesson: any) => ({
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    videoUrl: lesson.videoUrl,
                    duration: lesson.duration ? Math.floor(lesson.duration / 60) + ":" + String(lesson.duration % 60).padStart(2, '0') : "",
                    level: 1,
                    sectionId: section.id
                  }))
                },
                globalOrderIndex: sectionMinOrder
              })
            })
            
            // Add level 0 videos
            ;(fetchedCourse.lessons || []).forEach((lesson: any) => {
              unifiedItems.push({
                item: {
                  id: lesson.id,
                  title: lesson.title,
                  description: lesson.description,
                  videoUrl: lesson.videoUrl,
                  duration: lesson.duration ? Math.floor(lesson.duration / 60) + ":" + String(lesson.duration % 60).padStart(2, '0') : "",
                  level: 0,
                  sectionId: undefined
                },
                globalOrderIndex: lesson.globalOrderIndex || 0
              })
            })
            
            // Sort by globalOrderIndex to get the correct unified order
            unifiedItems.sort((a, b) => a.globalOrderIndex - b.globalOrderIndex)
            
            // Debug: Log the unified order
            console.log('🔄 Unified items order:', unifiedItems.map(({ item, globalOrderIndex }) => ({
              type: 'lessons' in item ? 'section' : 'video',
              title: item.title,
              globalOrderIndex
            })))
            
            // Return the sorted items
            return unifiedItems.map(({ item }) => item)
          })()
        }
        
        console.log('🔄 Transformed course data:', transformedCourse)
        updateCourse(() => transformedCourse)
        setOriginalCourse(transformedCourse) // Set original state for comparison
        setHasUnsavedChanges(false) // Reset unsaved changes flag
        console.log('📦 Course state set with sections:', transformedCourse.sections.map(s => ({ id: s.id, title: s.title, type: typeof s.id })))
        console.log('📦 Transformed course structure:', {
          sectionsCount: transformedCourse.sections.length,
          itemsCount: transformedCourse.items.length,
          itemsTypes: transformedCourse.items.map(item => 'lessons' in item ? 'section' : 'video')
        })
      } else {
        console.error('Failed to fetch course data')
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
    }
  }

  // Video drag and drop state
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)
  const [draggedVideoId, setDraggedVideoId] = useState<string | null>(null)
  const [videoDropIndicator, setVideoDropIndicator] = useState<VideoDropIndicator | null>(null)

  // Section drag and drop state
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [sectionDropIndicator, setSectionDropIndicator] = useState<SectionDropIndicator | null>(null)

  // Track collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<string[]>([])

  // Delete confirmation dialog state
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null)
  
  // Prevent double drop processing
  const [isProcessingDrop, setIsProcessingDrop] = useState(false)

  // Add Video Modal state
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false)
  const [addVideoLevel, setAddVideoLevel] = useState<0 | 1>(0)
  const [addVideoSectionId, setAddVideoSectionId] = useState<string | undefined>(undefined)
  const [editingVideo, setEditingVideo] = useState<{ id: string; title: string; description: string; duration: string; videoUrl: string } | null>(null)

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  const isSectionCollapsed = (sectionId: string) => {
    return collapsedSections.includes(sectionId)
  }

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: "",
      lessons: [],
    }
    setCourse((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
      items: [...prev.items, newSection]  // Add to unified structure
    }))
  }

  const updateSection = (sectionId: string, title: string) => {
    setCourse((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, title } : section)),
      items: prev.items.map((item) => 
        'lessons' in item && item.id === sectionId 
          ? { ...item, title } 
          : item
      ),
    }))
  }

  const confirmDeleteSection = (sectionId: string) => {
    console.log('🗑️ confirmDeleteSection called with sectionId:', sectionId)
    const section = course.sections.find((s) => s.id === sectionId)
    if (!section) {
      console.log('❌ Section not found for ID:', sectionId)
      return
    }
    console.log('✅ Section found:', section)

    setDeleteConfirmation({
      type: "section",
      sectionId,
      title: section.title || "Untitled Section",
    })
    console.log('🗑️ Delete confirmation set for section:', section.title)
  }

  const deleteSection = (sectionId: string) => {
    console.log('🗑️ deleteSection called with sectionId:', sectionId)
    updateCourse((prev) => {
      console.log('🗑️ Previous sections:', prev.sections.map(s => ({ id: s.id, title: s.title })))
      console.log('🗑️ Previous items:', prev.items.map(item => ({ id: item.id, title: item.title, type: 'lessons' in item ? 'section' : 'video' })))
      
      const updatedSections = prev.sections.filter((section) => section.id !== sectionId)
      const updatedItems = prev.items.filter((item) => !('lessons' in item) || item.id !== sectionId)
      
      console.log('🗑️ Updated sections:', updatedSections.map(s => ({ id: s.id, title: s.title })))
      console.log('🗑️ Updated items:', updatedItems.map(item => ({ id: item.id, title: item.title, type: 'lessons' in item ? 'section' : 'video' })))
      
      return {
        ...prev,
        sections: updatedSections,
        items: updatedItems,
      }
    })
    setDeleteConfirmation(null)
    console.log('🗑️ Section deleted and confirmation cleared')
  }

  // Move section up one position
  const moveSectionUp = (sectionId: string) => {
    setCourse((prev) => {
      const sectionIndex = prev.items.findIndex((item) => 'lessons' in item && item.id === sectionId)

      // Can't move up if it's already at the top
      if (sectionIndex <= 0) return prev

      const newItems = [...prev.items]
      const temp = newItems[sectionIndex]
      newItems[sectionIndex] = newItems[sectionIndex - 1]
      newItems[sectionIndex - 1] = temp

      // Also update the sections array to keep it in sync
      const newSections = [...prev.sections]
      const sectionInSectionsIndex = newSections.findIndex((section) => section.id === sectionId)
      if (sectionInSectionsIndex !== -1) {
        // Find the new position in sections array
        const newSectionIndex = newItems.findIndex((item) => 'lessons' in item && item.id === sectionId)
        const section = newSections[sectionInSectionsIndex]
        newSections.splice(sectionInSectionsIndex, 1)
        newSections.splice(newSectionIndex, 0, section)
      }

      return { ...prev, sections: newSections, items: newItems }
    })
  }

  // Move section down one position
  const moveSectionDown = (sectionId: string) => {
    setCourse((prev) => {
      const sectionIndex = prev.items.findIndex((item) => 'lessons' in item && item.id === sectionId)

      // Can't move down if it's already at the bottom
      if (sectionIndex === -1 || sectionIndex >= prev.items.length - 1) return prev

      const newItems = [...prev.items]
      const temp = newItems[sectionIndex]
      newItems[sectionIndex] = newItems[sectionIndex + 1]
      newItems[sectionIndex + 1] = temp

      // Also update the sections array to keep it in sync
      const newSections = [...prev.sections]
      const sectionInSectionsIndex = newSections.findIndex((section) => section.id === sectionId)
      if (sectionInSectionsIndex !== -1) {
        // Find the new position in sections array
        const newSectionIndex = newItems.findIndex((item) => 'lessons' in item && item.id === sectionId)
        const section = newSections[sectionInSectionsIndex]
        newSections.splice(sectionInSectionsIndex, 1)
        newSections.splice(newSectionIndex, 0, section)
      }

      return { ...prev, sections: newSections, items: newItems }
    })
  }

  const addVideo = (sectionId: string) => {
    console.log('🎬 addVideo called with sectionId:', sectionId)
    console.log('📊 Current course state before adding video:', course)
    
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      title: "",
      description: "",
      videoUrl: "",
      level: 1,
      sectionId: sectionId
    }
    
    console.log('🆕 New video object:', newVideo)
    
    setCourse((prev) => {
      console.log('🔄 setCourse callback - prev state:', prev)
      console.log('🔍 Looking for section with ID:', sectionId)
      console.log('📋 Available sections:', prev.sections.map(s => ({ id: s.id, title: s.title, lessonsCount: s.lessons.length })))
      
      // Update sections array
      const updatedSections = prev.sections.map((section) => {
        console.log('🔍 Checking section:', section.id, 'against target:', sectionId)
        if (section.id === sectionId) {
          console.log('✅ Found matching section, adding video to lessons')
          const updatedSection = { ...section, lessons: [...section.lessons, newVideo] }
          console.log('📝 Updated section:', updatedSection)
          return updatedSection
        } else {
          console.log('❌ Section ID mismatch, keeping unchanged')
          return section
        }
      })
      
      // Update items array to reflect the changes in sections
      const updatedItems = prev.items.map((item) => {
        if ('lessons' in item && item.id === sectionId) {
          console.log('🔄 Updating item in items array for section:', sectionId)
          const updatedSection = updatedSections.find(s => s.id === sectionId)
          return updatedSection || item
        }
        return item
      })
      
      const updatedCourse = {
      ...prev,
        sections: updatedSections,
        items: updatedItems
      }
      
      console.log('🎯 Final updated course state:', updatedCourse)
      return updatedCourse
    })
  }

  const addRootVideo = () => {
    console.log('🎬 addRootVideo called')
    console.log('📊 Current course state before adding root video:', course)
    
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      title: "",
      description: "",
      videoUrl: "",
      level: 0,
      sectionId: undefined
    }
    
    console.log('🆕 New root video object:', newVideo)
    
    setCourse((prev) => {
      console.log('🔄 setCourse callback for root video - prev state:', prev)
      const updatedCourse = {
      ...prev,
        items: [...prev.items, newVideo]  // Add to unified structure
      }
      console.log('🎯 Final updated course state for root video:', updatedCourse)
      return updatedCourse
    })
  }

  // Modal handlers for new Add Video functionality
  const openAddVideoModal = (level: 0 | 1, sectionId?: string, videoToEdit?: { id: string; title: string; description: string; duration: string; videoUrl: string }) => {
    setAddVideoLevel(level)
    setAddVideoSectionId(sectionId)
    setEditingVideo(videoToEdit || null)
    setIsAddVideoModalOpen(true)
  }

  const closeAddVideoModal = () => {
    setIsAddVideoModalOpen(false)
    setAddVideoLevel(0)
    setAddVideoSectionId(undefined)
    setEditingVideo(null)
  }

  const handleAddVideoFromModal = (videoData: { title: string; description: string; duration: string; videoUrl: string }) => {
    if (editingVideo) {
      // Update existing video
      setCourse((prev) => {
        if (addVideoLevel === 0) {
          // Update root video
          const updatedItems = prev.items.map((item) => {
            if (!('lessons' in item) && item.id === editingVideo.id) {
              return {
                ...item,
                title: videoData.title,
                description: videoData.description,
                videoUrl: videoData.videoUrl,
                duration: videoData.duration
              } as Video
            }
            return item
          })
          return { ...prev, items: updatedItems }
        } else {
          // Update section video
          const updatedSections = prev.sections.map((section) =>
            section.id === addVideoSectionId
              ? {
                  ...section,
                  lessons: section.lessons.map((video) =>
                    video.id === editingVideo.id
                      ? {
                          ...video,
                          title: videoData.title,
                          description: videoData.description,
                          videoUrl: videoData.videoUrl,
                          duration: videoData.duration
                        }
                      : video
                  )
                }
              : section
          )

          const updatedItems = prev.items.map((item) => {
            if ('lessons' in item && item.id === addVideoSectionId) {
              return updatedSections.find(s => s.id === addVideoSectionId) || item
            }
            return item
          })

          return {
            ...prev,
            sections: updatedSections,
            items: updatedItems
          }
        }
      })

      // Removed toast notification for editing videos
    } else {
      // Add new video
      const newVideo: Video = {
        id: `video-${Date.now()}`,
        title: videoData.title,
        description: videoData.description,
        videoUrl: videoData.videoUrl,
        duration: videoData.duration,
        level: addVideoLevel,
        sectionId: addVideoSectionId
      }

      if (addVideoLevel === 0) {
        // Add to root level at the bottom
        setCourse((prev) => {
          // Find the index where sections end and level 0 videos begin
          const sectionsEndIndex = prev.items.findIndex(item => !('lessons' in item))
          const insertIndex = sectionsEndIndex === -1 ? prev.items.length : sectionsEndIndex
          
          const newItems = [...prev.items]
          newItems.splice(insertIndex, 0, newVideo)
          
          return {
            ...prev,
            items: newItems
          }
        })
      } else {
        // Add to section
        setCourse((prev) => {
          const updatedSections = prev.sections.map((section) =>
            section.id === addVideoSectionId
              ? { ...section, lessons: [...section.lessons, newVideo] }
              : section
          )

          const updatedItems = prev.items.map((item) => {
            if ('lessons' in item && item.id === addVideoSectionId) {
              return updatedSections.find(s => s.id === addVideoSectionId) || item
            }
            return item
          })

          return {
      ...prev,
            sections: updatedSections,
            items: updatedItems
          }
        })
      }

      toast({
        title: "Video Added",
        description: `Successfully added "${videoData.title}" to the course.`,
      })
    }
  }

  const handleAddPlaylistVideos = (videos: Array<{ title: string; description: string; duration: string; videoUrl: string }>, createSection?: boolean, sectionTitle?: string) => {
    console.log('🎬 handleAddPlaylistVideos called:', { videos: videos.length, createSection, sectionTitle, level: addVideoLevel })
    
    if (createSection && addVideoLevel === 0) {
      // Create a new section and add all videos to it
      const newSection: Section = {
        id: `section-${Date.now()}`,
        title: sectionTitle || "New Section",
        lessons: videos.map((video, index) => ({
          id: `video-${Date.now()}-${index}`, // Use unique IDs for each video
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          duration: video.duration,
          level: 1,
          sectionId: `section-${Date.now()}` // This will be updated after section creation
        }))
      }
      
      setCourse((prev) => {
        // Find the index where sections end and level 0 videos begin
        const sectionsEndIndex = prev.items.findIndex(item => !('lessons' in item))
        const insertIndex = sectionsEndIndex === -1 ? prev.items.length : sectionsEndIndex
        
        const newItems = [...prev.items]
        newItems.splice(insertIndex, 0, newSection)
        
        return {
          ...prev,
          sections: [...prev.sections, newSection],
          items: newItems
        }
      })
      
      toast({
        title: "Section Created",
        description: `Successfully created section "${newSection.title}" with ${videos.length} videos.`,
      })
    } else {
      // Add videos to existing section or root level
      const newVideos: Video[] = videos.map((video, index) => ({
        id: `video-${Date.now()}-${index}`, // Use unique IDs for each video
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        duration: video.duration,
        level: addVideoLevel,
        sectionId: addVideoSectionId
      }))
      
      if (addVideoLevel === 0) {
        // Add to root level at the bottom
        setCourse((prev) => {
          // Find the index where sections end and level 0 videos begin
          const sectionsEndIndex = prev.items.findIndex(item => !('lessons' in item))
          const insertIndex = sectionsEndIndex === -1 ? prev.items.length : sectionsEndIndex
          
          const newItems = [...prev.items]
          newItems.splice(insertIndex, 0, ...newVideos)
          
          return {
            ...prev,
            items: newItems
          }
        })
      } else {
        // Add to section
        setCourse((prev) => {
          const updatedSections = prev.sections.map((section) =>
            section.id === addVideoSectionId
              ? { ...section, lessons: [...section.lessons, ...newVideos] }
              : section
          )

          const updatedItems = prev.items.map((item) => {
            if ('lessons' in item && item.id === addVideoSectionId) {
              return updatedSections.find(s => s.id === addVideoSectionId) || item
            }
            return item
          })

          return {
            ...prev,
            sections: updatedSections,
            items: updatedItems
          }
        })
      }
      
      toast({
        title: "Videos Added",
        description: `Successfully added ${videos.length} videos to the course.`,
      })
    }
  }

  const updateVideo = (sectionId: string, videoId: string, field: keyof Video, value: string) => {
    console.log('✏️ updateVideo called:', { sectionId, videoId, field, value })
    
    setCourse((prev) => {
      // Update sections array
      const updatedSections = prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.map((video) =>
                video.id === videoId ? { ...video, [field]: value } : video,
              ),
            }
          : section,
      )
      
      // Update items array to reflect the changes in sections
      const updatedItems = prev.items.map((item) => {
        if ('lessons' in item && item.id === sectionId) {
          const updatedSection = updatedSections.find(s => s.id === sectionId)
          return updatedSection || item
        }
        return item
      })
      
      return {
        ...prev,
        sections: updatedSections,
        items: updatedItems
      }
    })
  }

  const confirmDeleteVideo = (sectionId: string, videoId: string) => {
    if (sectionId === "root") {
      // Handle root videos (level 0)
      const video = course.items.find((item) => !('lessons' in item) && item.id === videoId) as Video
      if (!video) return

      setDeleteConfirmation({
        type: "video",
        sectionId,
        videoId,
        title: video.title || "Untitled Video",
      })
    } else {
      // Handle section videos (level 1)
      const section = course.sections.find((s) => s.id === sectionId)
      if (!section) return

      const video = section.lessons.find((v) => v.id === videoId)
      if (!video) return

    setDeleteConfirmation({
        type: "video",
      sectionId,
        videoId,
        title: video.title || "Untitled Video",
    })
    }
  }

  const deleteVideo = (sectionId: string, videoId: string) => {
    console.log('🗑️ deleteVideo called:', { sectionId, videoId })
    
    updateCourse((prev) => {
      if (sectionId === "root") {
        // Handle root videos (level 0)
        return {
      ...prev,
          items: prev.items.filter((item) => item.id !== videoId)
        }
      } else {
        // Handle section videos (level 1)
        const updatedSections = prev.sections.map((section) =>
        section.id === sectionId
            ? { ...section, lessons: section.lessons.filter((video) => video.id !== videoId) }
          : section,
        )
        
        // Update items array to reflect the changes in sections
        const updatedItems = prev.items.map((item) => {
          if ('lessons' in item && item.id === sectionId) {
            const updatedSection = updatedSections.find(s => s.id === sectionId)
            return updatedSection || item
          }
          return item
        })
        
        return {
          ...prev,
          sections: updatedSections,
          items: updatedItems
        }
      }
    })
    setDeleteConfirmation(null)
  }

  // Move video up one position
  const moveVideoUp = (sectionId: string, videoId: string) => {
    setCourse((prev) => {
      if (sectionId === "root") {
        // Handle root videos (level 0)
        const videoIndex = prev.items.findIndex((item) => !('lessons' in item) && item.id === videoId)
        if (videoIndex <= 0) return prev

        const newItems = [...prev.items]
        const temp = newItems[videoIndex]
        newItems[videoIndex] = newItems[videoIndex - 1]
        newItems[videoIndex - 1] = temp

        return { ...prev, items: newItems }
      } else {
        // Handle section videos (level 1)
      const sectionIndex = prev.sections.findIndex((section) => section.id === sectionId)
      if (sectionIndex === -1) return prev

      const section = prev.sections[sectionIndex]
        const videoIndex = section.lessons.findIndex((video) => video.id === videoId)

      // Can't move up if it's already at the top
        if (videoIndex <= 0) return prev

        const newVideos = [...section.lessons]
        const temp = newVideos[videoIndex]
        newVideos[videoIndex] = newVideos[videoIndex - 1]
        newVideos[videoIndex - 1] = temp

      const newSections = [...prev.sections]
        newSections[sectionIndex] = { ...section, lessons: newVideos }

        // Also update the items array to keep it synchronized
        const newItems = prev.items.map(item => 
          'lessons' in item && item.id === sectionId 
            ? { ...item, lessons: newVideos }
            : item
        )

        return { ...prev, sections: newSections, items: newItems }
      }
    })
  }

  // Move video down one position
  const moveVideoDown = (sectionId: string, videoId: string) => {
    setCourse((prev) => {
      if (sectionId === "root") {
        // Handle root videos (level 0)
        const videoIndex = prev.items.findIndex((item) => !('lessons' in item) && item.id === videoId)
        if (videoIndex === -1 || videoIndex >= prev.items.length - 1) return prev

        const newItems = [...prev.items]
        const temp = newItems[videoIndex]
        newItems[videoIndex] = newItems[videoIndex + 1]
        newItems[videoIndex + 1] = temp

        return { ...prev, items: newItems }
      } else {
        // Handle section videos (level 1)
      const sectionIndex = prev.sections.findIndex((section) => section.id === sectionId)
      if (sectionIndex === -1) return prev

      const section = prev.sections[sectionIndex]
        const videoIndex = section.lessons.findIndex((video) => video.id === videoId)

      // Can't move down if it's already at the bottom
        if (videoIndex === -1 || videoIndex >= section.lessons.length - 1) return prev

        const newVideos = [...section.lessons]
        const temp = newVideos[videoIndex]
        newVideos[videoIndex] = newVideos[videoIndex + 1]
        newVideos[videoIndex + 1] = temp

      const newSections = [...prev.sections]
        newSections[sectionIndex] = { ...section, lessons: newVideos }

        // Also update the items array to keep it synchronized
        const newItems = prev.items.map(item => 
          'lessons' in item && item.id === sectionId 
            ? { ...item, lessons: newVideos }
            : item
        )

        return { ...prev, sections: newSections, items: newItems }
      }
    })
  }

  // Move item up in the unified items array
  const moveItemUp = (itemIndex: number) => {
    setCourse((prev) => {
      if (itemIndex <= 0) return prev

      const newItems = [...prev.items]
      const temp = newItems[itemIndex]
      newItems[itemIndex] = newItems[itemIndex - 1]
      newItems[itemIndex - 1] = temp

      // Update sections array if the moved item is a section
      const movedItem = newItems[itemIndex]
      const swappedItem = newItems[itemIndex - 1]
      
      if ('lessons' in movedItem && 'lessons' in swappedItem) {
        // Both are sections, update sections array
        const newSections = newItems.filter(item => 'lessons' in item) as Section[]
        return { ...prev, items: newItems, sections: newSections }
      } else if ('lessons' in movedItem) {
        // Moved item is a section, swapped item is a video
        const newSections = newItems.filter(item => 'lessons' in item) as Section[]
        return { ...prev, items: newItems, sections: newSections }
      } else if ('lessons' in swappedItem) {
        // Moved item is a video, swapped item is a section
        const newSections = newItems.filter(item => 'lessons' in item) as Section[]
        return { ...prev, items: newItems, sections: newSections }
      }

      return { ...prev, items: newItems }
    })
  }

  // Move item down in the unified items array
  const moveItemDown = (itemIndex: number) => {
    setCourse((prev) => {
      if (itemIndex >= prev.items.length - 1) return prev

      const newItems = [...prev.items]
      const temp = newItems[itemIndex]
      newItems[itemIndex] = newItems[itemIndex + 1]
      newItems[itemIndex + 1] = temp

      // Update sections array if the moved item is a section
      const movedItem = newItems[itemIndex]
      const swappedItem = newItems[itemIndex + 1]
      
      if ('lessons' in movedItem && 'lessons' in swappedItem) {
        // Both are sections, update sections array
        const newSections = newItems.filter(item => 'lessons' in item) as Section[]
        return { ...prev, items: newItems, sections: newSections }
      } else if ('lessons' in movedItem) {
        // Moved item is a section, swapped item is a video
        const newSections = newItems.filter(item => 'lessons' in item) as Section[]
        return { ...prev, items: newItems, sections: newSections }
      } else if ('lessons' in swappedItem) {
        // Moved item is a video, swapped item is a section
        const newSections = newItems.filter(item => 'lessons' in item) as Section[]
        return { ...prev, items: newItems, sections: newSections }
      }

      return { ...prev, items: newItems }
    })
  }

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getVideoThumbnail = (videoUrl: string) => {
    const videoId = extractVideoId(videoUrl)
    if (!videoId) return null
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }

  const getTotalLessons = () => {
    const sectionVideos = course.sections.reduce((total, section) => total + section.lessons.length, 0)
    const rootVideos = course.items ? course.items.filter(item => !('lessons' in item)).length : 0
    return sectionVideos + rootVideos
  }

  const handleSaveChanges = async () => {
    if (isEditMode && editCourseId) {
      try {
        // Prepare the data to send to the API
        // Extract sections and level 0 videos from the unified items array
        const sections = course.items.filter(item => 'lessons' in item) as Section[]
        const level0Videos = course.items.filter(item => !('lessons' in item)) as Video[]
        
        // Create the data object that the API expects
        const courseData = {
          title: course.title,
          description: course.description,
          sections: sections,
          items: course.items // Include the full items array for order preservation
        }
        
        // Update existing course
        const response = await fetch(`${window.location.origin}/api/courses/${editCourseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(courseData)
        })

        if (response.ok) {
          const result = await response.json()
          toast({
            title: "Course Updated",
            description: "Your course has been successfully updated!",
            variant: "success",
            duration: 3000,
          })
          // Reset unsaved changes flag
          setHasUnsavedChanges(false)
          // Redirect back to the specific course page after a short delay
          setTimeout(() => {
            router.push(`/course/${editCourseId}`)
          }, 1000)
        } else {
          const error = await response.json()
          toast({
            title: "Update Failed",
            description: `Failed to update course: ${error.error}`,
            variant: "destructive",
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error updating course:', error)
        toast({
          title: "Update Failed",
          description: "Failed to update course. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } else {
      // Create new course
      try {
        console.log("Creating new course:", course)
        console.log("Course structure:", {
          title: course.title,
          description: course.description,
          sections: course.sections,
          videos: course.videos,
          items: course.items
        })
        console.log("Title type:", typeof course.title, "Value:", JSON.stringify(course.title))
        console.log("Description type:", typeof course.description, "Value:", JSON.stringify(course.description))
        console.log("Title length:", course.title?.length)
        console.log("Description length:", course.description?.length)
        
        // Validate required fields before sending
        if (!course.title || !course.title.trim()) {
          toast({
            title: "Validation Error",
            description: "Course title is required",
            variant: "destructive",
            duration: 5000,
          })
          return
        }
        
        if (!course.description || !course.description.trim()) {
          toast({
            title: "Validation Error",
            description: "Course description is required",
            variant: "destructive",
            duration: 5000,
          })
          return
        }
        
        // Prepare the data to send (including level 0 videos from items array)
        const level0Videos = course.items.filter(item => !('lessons' in item)) as Video[]
        
        const courseData = {
          title: course.title.trim(),
          description: course.description.trim(),
          sections: course.sections,
          items: course.items // Send the full items array including level 0 videos
        }
        
        console.log("Sending course data:", courseData)
        
        const response = await fetch(`${window.location.origin}/api/courses`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(courseData)
        })

        if (response.ok) {
          const result = await response.json()
          toast({
            title: "Course Created",
            description: "Your course has been successfully created!",
            variant: "success",
            duration: 3000,
          })
          // Redirect back to the specific course page after a short delay
          setTimeout(() => {
            router.push(`/course/${result.course.id}`)
          }, 1000)
        } else {
          const error = await response.json()
          console.error('API Error Response:', error)
          toast({
            title: "Creation Failed",
            description: `Failed to create course: ${error.error}`,
            variant: "destructive",
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error creating course:', error)
        toast({
          title: "Creation Failed",
          description: "Failed to create course. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    }
  }

  // Level 0 Item drag and drop handlers (for sections and videos mixed)
  const handleItemDragStart = (e: React.DragEvent, itemId: string, itemType: 'section' | 'video') => {
    console.log('🎯 handleItemDragStart called:', { itemId, itemType })
    setDraggedSection(itemId)
    
    // Clear Level 1 video state variables for Level 0 items
    setDraggedVideoId(null)
    setDraggedSectionId(null)
    
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData('text/plain', JSON.stringify({ itemId, itemType }))

    // Create a custom drag image
    const dragPreview = document.createElement("div")
    dragPreview.className = "bg-background border rounded p-2 shadow-lg"
    dragPreview.textContent = `Moving ${itemType}...`
    dragPreview.style.position = "absolute"
    dragPreview.style.top = "-1000px"
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 50, 25)

    // Clean up the preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
  }

  // Section drag and drop handlers (legacy - for level 1 videos within sections)
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId)
    e.dataTransfer.effectAllowed = "move"

    // Create a custom drag image
    const dragPreview = document.createElement("div")
    dragPreview.className = "bg-background border rounded p-2 shadow-lg"
    dragPreview.textContent = "Moving section..."
    dragPreview.style.position = "absolute"
    dragPreview.style.top = "-1000px"
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 50, 25)

    // Clean up the preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
  }

  const handleItemDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🎯 handleItemDragOver called:', { 
      itemId, 
      draggedSection, 
      draggedSectionId, 
      draggedVideoId 
    })

    // Only show drop indicators for Level 0 items (sections or root videos)
    // Don't show indicators when dragging Level 1 videos (section videos)
    if (draggedSectionId && draggedVideoId) {
      // We're dragging a Level 1 video, don't show Level 0 drop indicators
      console.log('❌ Level 1 video drag detected, hiding drop indicators')
      setSectionDropIndicator(null)
      return
    }

    // Don't show indicator if dragging over itself
    if (itemId === draggedSection) {
      console.log('❌ Dragging over itself, hiding drop indicators')
      setSectionDropIndicator(null)
      return
    }

    // Determine if we're in the top or bottom half of the element
    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom"

    console.log('✅ Setting drop indicator:', { sectionId: itemId, position })

    // Update the drop indicator
    setSectionDropIndicator({
      sectionId: itemId,
      position,
    })

    e.dataTransfer.dropEffect = "move"
  }

  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('📚 handleSectionDragOver called:', { 
      sectionId, 
      draggedSection, 
      draggedSectionId, 
      draggedVideoId 
    })

    // Only show drop indicators for Level 0 items (sections or root videos)
    // Don't show indicators when dragging Level 1 videos (section videos)
    if (draggedSectionId && draggedVideoId) {
      // We're dragging a Level 1 video, don't show Level 0 drop indicators
      console.log('❌ Level 1 video drag detected, hiding drop indicators')
      setSectionDropIndicator(null)
      return
    }

    // Don't show indicator if dragging over itself
    if (sectionId === draggedSection) {
      console.log('❌ Dragging over itself, hiding drop indicators')
      setSectionDropIndicator(null)
      return
    }

    // Determine if we're in the top or bottom half of the element
    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom"

    console.log('✅ Setting drop indicator:', { sectionId, position })

    // Update the drop indicator
    setSectionDropIndicator({
      sectionId,
      position,
    })

    e.dataTransfer.dropEffect = "move"
  }

  const handleSectionDragLeave = () => {
    setSectionDropIndicator(null)
  }

  const handleSectionDragEnd = () => {
    setDraggedSection(null)
    setDraggedVideoId(null)
    setDraggedSectionId(null)
    setSectionDropIndicator(null)
  }

  const handleItemDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🎯 handleItemDrop called:', { targetItemId, draggedSection })

    // Reset drop indicator
    setSectionDropIndicator(null)

    // Make sure we have valid drag data
    if (!draggedSection || !sectionDropIndicator) return

    // Don't do anything if dropped on itself
    if (draggedSection === targetItemId) return

    // Find the source and target indices in the items array
    const sourceIndex = course.items.findIndex((item) => item.id === draggedSection)
    const targetIndex = course.items.findIndex((item) => item.id === targetItemId)

    console.log('📊 Drag indices:', { sourceIndex, targetIndex, dropPosition: sectionDropIndicator.position })

    if (sourceIndex === -1 || targetIndex === -1) {
      console.log('❌ Invalid indices found')
      return
    }

    // Create a new array with the items reordered
    const newItems = [...course.items]
    const [movedItem] = newItems.splice(sourceIndex, 1)

    // Insert at the correct position based on the drop indicator
    const insertIndex = sectionDropIndicator.position === "top" ? targetIndex : targetIndex + 1

    // Adjust the insert index if we're moving from above to below
    const adjustedInsertIndex =
      sourceIndex < targetIndex && sectionDropIndicator.position === "bottom" ? insertIndex - 1 : insertIndex

    newItems.splice(adjustedInsertIndex, 0, movedItem)

    console.log('🔄 Reordered items:', newItems.map(item => ({ 
      id: item.id, 
      type: 'lessons' in item ? 'section' : 'video',
      title: 'lessons' in item ? item.title : item.title
    })))

    // Also update the sections array to keep it in sync
    const newSections = newItems.filter(item => 'lessons' in item) as Section[]

    // Update the course state with the new order
    setCourse((prevCourse) => ({
      ...prevCourse,
      items: newItems,
      sections: newSections
    }))
  }

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Reset drop indicator
    setSectionDropIndicator(null)

    // Make sure we have valid drag data
    if (!draggedSection || !sectionDropIndicator) return

    // Don't do anything if dropped on itself
    if (draggedSection === targetSectionId) return

    // Find the source and target indices
    const sourceIndex = course.sections.findIndex((section) => section.id === draggedSection)
    const targetIndex = course.sections.findIndex((section) => section.id === targetSectionId)

    if (sourceIndex === -1 || targetIndex === -1) return

    // Create a new array with the reordered sections
    const newSections = [...course.sections]
    const [movedSection] = newSections.splice(sourceIndex, 1)

    // Insert at the correct position based on the drop indicator
    const insertIndex = sectionDropIndicator.position === "top" ? targetIndex : targetIndex + 1

    // Adjust the insert index if we're moving from above to below
    const adjustedInsertIndex =
      sourceIndex < targetIndex && sectionDropIndicator.position === "bottom" ? insertIndex - 1 : insertIndex

    newSections.splice(adjustedInsertIndex, 0, movedSection)

    // Update the course state with the new order
    setCourse((prevCourse) => ({
      ...prevCourse,
      sections: newSections,
    }))
  }

  // Video drag and drop handlers
  const handleVideoDragStart = (e: React.DragEvent, sectionId: string, videoId: string) => {
    console.log('🎬 handleVideoDragStart called:', { sectionId, videoId })
    
    // Store the dragged video and section IDs
    setDraggedSectionId(sectionId)
    setDraggedVideoId(videoId)

    // Set the drag effect
    e.dataTransfer.effectAllowed = "move"

    // Create a custom drag image (optional)
    const dragPreview = document.createElement("div")
    dragPreview.className = "bg-background border rounded p-2 shadow-lg"
    dragPreview.textContent = "Moving video..."
    dragPreview.style.position = "absolute"
    dragPreview.style.top = "-1000px"
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 50, 25)

    // Clean up the preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
  }

  const handleVideoDragOver = (e: React.DragEvent, sectionId: string, videoId: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Only show drop indicators for Level 1 videos (section videos)
    // Don't show indicators when dragging Level 0 items (sections or root videos)
    if (draggedSection && !draggedSectionId) {
      // We're dragging a Level 0 item, don't show Level 1 drop indicators
      setVideoDropIndicator(null)
      return
    }

    // Don't show indicator if dragging over itself
    if (videoId === draggedVideoId) {
      setVideoDropIndicator(null)
      return
    }

    // Only show drop indicator if we're actually dragging a video
    if (!draggedSectionId || !draggedVideoId) {
      setVideoDropIndicator(null)
      return
    }

    // Determine if we're in the top or bottom half of the element
    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom"

    // Only update if the indicator would actually change
    const newIndicator: VideoDropIndicator = { sectionId, videoId, position: position as "top" | "bottom" }
    const currentIndicator = videoDropIndicator
    
    if (!currentIndicator || 
        currentIndicator.sectionId !== sectionId || 
        currentIndicator.videoId !== videoId || 
        currentIndicator.position !== position) {
      
      setVideoDropIndicator(newIndicator)
      console.log('📍 Video drop indicator set:', newIndicator)
    }

    // Set the drop effect
    e.dataTransfer.dropEffect = "move"
  }

  const handleVideoDragLeave = () => {
    setVideoDropIndicator(null)
  }

  const handleVideoDragEnd = () => {
    // Reset all drag state
    setDraggedSection(null)
    setDraggedSectionId(null)
    setDraggedVideoId(null)
    setVideoDropIndicator(null)
    setIsProcessingDrop(false)
  }

  // NEW: Level 1 video drag and drop handlers (parallel to Level 0 logic)
  const handleLevel1VideoDragStart = (e: React.DragEvent, sectionId: string, videoId: string) => {
    console.log('🎬 Level 1 handleVideoDragStart called:', { sectionId, videoId })
    e.stopPropagation() // Prevent event bubbling
    
    // Store the dragged video and section IDs
    setDraggedSectionId(sectionId)
    setDraggedVideoId(videoId)
    
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData('text/plain', JSON.stringify({ sectionId, videoId, level: 1 }))

    // Create a custom drag image
    const dragPreview = document.createElement("div")
    dragPreview.className = "bg-background border rounded p-2 shadow-lg"
    dragPreview.textContent = "Moving video..."
    dragPreview.style.position = "absolute"
    dragPreview.style.top = "-1000px"
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 50, 25)

    // Clean up the preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
  }

  const handleLevel1VideoDragOver = (e: React.DragEvent, sectionId: string, videoId: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Don't show indicator if dragging over itself
    if (videoId === draggedVideoId) {
      setVideoDropIndicator(null)
      return
    }

    // Only show drop indicators for Level 1 videos (section videos)
    // Don't show indicators when dragging Level 0 items (sections or root videos)
    if (!draggedSectionId || !draggedVideoId) {
      setVideoDropIndicator(null)
      return
    }

    // Additional check: make sure we're not dragging a Level 0 item
    if (draggedSection && !draggedSectionId) {
      // We're dragging a Level 0 item, don't show Level 1 drop indicators
      setVideoDropIndicator(null)
      return
    }

    // Determine if we're in the top or bottom half of the element
    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom"

    // Only update if the indicator would actually change
    const newIndicator: VideoDropIndicator = { sectionId, videoId, position: position as "top" | "bottom" }
    const currentIndicator = videoDropIndicator
    
    if (!currentIndicator || 
        currentIndicator.sectionId !== sectionId || 
        currentIndicator.videoId !== videoId || 
        currentIndicator.position !== position) {
      
      setVideoDropIndicator(newIndicator)
      console.log('📍 Level 1 Video drop indicator set:', newIndicator, {
        isCrossSection: draggedSectionId !== sectionId
      })
    }

    e.dataTransfer.dropEffect = "move"
  }

  const handleLevel1VideoDrop = (e: React.DragEvent, sectionId: string, targetVideoId: string) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🎯 Level 1 handleVideoDrop called:', { sectionId, targetVideoId, draggedSectionId, draggedVideoId })

    // Reset drop indicator
    setVideoDropIndicator(null)

    // Make sure we have valid drag data
    if (!draggedSectionId || !draggedVideoId || !videoDropIndicator) {
      console.log('❌ Early return - missing drag data')
      return
    }

    // Don't do anything if dropped on itself
    if (draggedVideoId === targetVideoId) {
      console.log('❌ Early return - dropped on itself')
      return
    }

    // Handle both same-section and cross-section drops
    const sourceSectionId = draggedSectionId
    const targetSectionId = sectionId

    // Find the source section and video
    const sourceSection = course.sections.find(s => s.id === sourceSectionId)
    const targetSection = course.sections.find(s => s.id === targetSectionId)
    
    if (!sourceSection || !targetSection) {
      console.log('❌ Source or target section not found')
      return
    }

    const sourceIndex = sourceSection.lessons.findIndex(video => video.id === draggedVideoId)
    const targetIndex = targetSection.lessons.findIndex(video => video.id === targetVideoId)

    console.log('📊 Level 1 Drag indices:', { 
      sourceSectionId, 
      targetSectionId, 
      sourceIndex, 
      targetIndex, 
      dropPosition: videoDropIndicator.position,
      isCrossSection: sourceSectionId !== targetSectionId
    })

    if (sourceIndex === -1 || targetIndex === -1) {
      console.log('❌ Invalid indices found')
      return
    }

    // Get the video to move
    const videoToMove = sourceSection.lessons[sourceIndex]

    // Update the course state
    setCourse((prevCourse) => {
      if (sourceSectionId === targetSectionId) {
        // Same section reordering
        const newVideos = [...sourceSection.lessons]
        const [movedVideo] = newVideos.splice(sourceIndex, 1)

    // Insert at the correct position based on the drop indicator
        const insertIndex = videoDropIndicator.position === "top" ? targetIndex : targetIndex + 1

    // Adjust the insert index if we're moving from above to below
    const adjustedInsertIndex =
          sourceIndex < targetIndex && videoDropIndicator.position === "bottom" ? insertIndex - 1 : insertIndex

        newVideos.splice(adjustedInsertIndex, 0, movedVideo)

        console.log('🔄 Level 1 Same-section reorder:', newVideos.map(video => ({ 
          id: video.id, 
          title: video.title
        })))

        const updatedSections = prevCourse.sections.map(s => 
          s.id === sourceSectionId ? { ...s, lessons: newVideos } : s
        )
        
        // Also update the items array to keep it synchronized
        const updatedItems = prevCourse.items.map(item => 
          'lessons' in item && item.id === sourceSectionId 
            ? { ...item, lessons: newVideos }
            : item
        )

        return {
          ...prevCourse,
          sections: updatedSections,
          items: updatedItems
        }
      } else {
        // Cross-section movement
        console.log('🔄 Level 1 Cross-section movement:', { 
          from: sourceSectionId, 
          to: targetSectionId, 
          video: videoToMove.title 
        })

        // Remove from source section
        const updatedSourceVideos = sourceSection.lessons.filter((_, index) => index !== sourceIndex)
        
        // Add to target section at the correct position
        const targetVideos = [...targetSection.lessons]
        const insertIndex = videoDropIndicator.position === "top" ? targetIndex : targetIndex + 1
        targetVideos.splice(insertIndex, 0, videoToMove)

        console.log('🔄 Level 1 Cross-section result:', {
          sourceSection: updatedSourceVideos.map(v => v.title),
          targetSection: targetVideos.map(v => v.title)
        })

        const updatedSections = prevCourse.sections.map(s => {
          if (s.id === sourceSectionId) {
            return { ...s, lessons: updatedSourceVideos }
          } else if (s.id === targetSectionId) {
            return { ...s, lessons: targetVideos }
          }
          return s
        })
        
        // Also update the items array to keep it synchronized
        const updatedItems = prevCourse.items.map(item => {
          if ('lessons' in item) {
            if (item.id === sourceSectionId) {
              return { ...item, lessons: updatedSourceVideos }
            } else if (item.id === targetSectionId) {
              return { ...item, lessons: targetVideos }
            }
          }
          return item
        })

        return {
          ...prevCourse,
          sections: updatedSections,
          items: updatedItems
        }
      }
    })

    // Reset drag state
    setDraggedSectionId(null)
    setDraggedVideoId(null)
  }

  // NEW: Handle drops on empty sections
  const handleLevel1VideoDropOnEmptySection = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🎯 Level 1 handleVideoDropOnEmptySection called:', { sectionId, draggedSectionId, draggedVideoId })

    // Reset drop indicator
    setVideoDropIndicator(null)

    // Make sure we have valid drag data
    if (!draggedSectionId || !draggedVideoId) {
      console.log('❌ Early return - missing drag data')
      return
    }

    // Find the source section and video
    const sourceSection = course.sections.find(s => s.id === draggedSectionId)
    const targetSection = course.sections.find(s => s.id === sectionId)
    
    if (!sourceSection || !targetSection) {
      console.log('❌ Source or target section not found')
      return
    }

    const sourceIndex = sourceSection.lessons.findIndex(video => video.id === draggedVideoId)

    console.log('📊 Level 1 Empty section drop:', { 
      sourceSectionId: draggedSectionId, 
      targetSectionId: sectionId, 
      sourceIndex,
      videoTitle: sourceSection.lessons[sourceIndex]?.title
    })

    if (sourceIndex === -1) {
      console.log('❌ Invalid source index found')
      return
    }

    // Get the video to move
    const videoToMove = sourceSection.lessons[sourceIndex]

    // Update the course state
    setCourse((prevCourse) => {
      // Remove from source section
      const updatedSourceVideos = sourceSection.lessons.filter((_, index) => index !== sourceIndex)
      
      // Add to target section (empty section, so just add to the beginning)
      const targetVideos = [videoToMove]

      console.log('🔄 Level 1 Empty section result:', {
        sourceSection: updatedSourceVideos.map(v => v.title),
        targetSection: targetVideos.map(v => v.title)
      })

      const updatedSections = prevCourse.sections.map(s => {
        if (s.id === draggedSectionId) {
          return { ...s, lessons: updatedSourceVideos }
        } else if (s.id === sectionId) {
          return { ...s, lessons: targetVideos }
        }
        return s
      })
      
      // Also update the items array to keep it synchronized
      const updatedItems = prevCourse.items.map(item => {
        if ('lessons' in item) {
          if (item.id === draggedSectionId) {
            return { ...item, lessons: updatedSourceVideos }
          } else if (item.id === sectionId) {
            return { ...item, lessons: targetVideos }
          }
        }
        return item
      })

      return {
        ...prevCourse,
        sections: updatedSections,
        items: updatedItems
      }
    })

    // Reset drag state
    setDraggedSectionId(null)
    setDraggedVideoId(null)
  }

  const handleVideoDrop = (e: React.DragEvent, targetSectionId: string, targetVideoId: string) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🎯 handleVideoDrop called:', { targetSectionId, targetVideoId, draggedSectionId, draggedVideoId })

    // Reset drop indicator
    setVideoDropIndicator(null)

    // Make sure we have valid drag data
    if (!draggedSectionId || !draggedVideoId || !videoDropIndicator) {
      console.log('❌ Early return - missing drag data')
      return
    }

    // Don't do anything if dropped on itself
    if (draggedVideoId === targetVideoId) {
      console.log('❌ Early return - dropped on itself')
      return
    }

    // Prevent double processing
    if (isProcessingDrop) {
      console.log('❌ Drop already being processed, skipping')
      return
    }
    
    setIsProcessingDrop(true)

    // Store the drag data before resetting state
    const currentDraggedVideoId = draggedVideoId
    const currentDraggedSectionId = draggedSectionId
    const currentVideoDropIndicator = videoDropIndicator

    // Reset drag state immediately to prevent double processing
    setDraggedSectionId(null)
    setDraggedVideoId(null)
    setVideoDropIndicator(null)

    setCourse((prevCourse) => {
      // Find the dragged video and its current location
      let draggedVideo: Video | null = null
      let sourceSectionId: string | null = null
      let sourceIndex: number = -1

      // Check if dragged video is in a section (level 1)
      for (const section of prevCourse.sections) {
        const videoIndex = section.lessons.findIndex(v => v.id === currentDraggedVideoId)
        if (videoIndex !== -1) {
          draggedVideo = section.lessons[videoIndex]
          sourceSectionId = section.id
          sourceIndex = videoIndex
          break
        }
      }

      // Check if dragged video is in root level (level 0)
      if (!draggedVideo) {
        const rootVideoIndex = prevCourse.items.findIndex(item => !('lessons' in item) && item.id === currentDraggedVideoId)
        if (rootVideoIndex !== -1) {
          draggedVideo = prevCourse.items[rootVideoIndex] as Video
          sourceSectionId = null // null means root level
          sourceIndex = rootVideoIndex
        }
      }

      if (!draggedVideo) {
        console.log('❌ Dragged video not found')
        return prevCourse
      }

      console.log('📊 Video drag details:', { 
        draggedVideo: { id: draggedVideo.id, title: draggedVideo.title },
        sourceSectionId, 
        sourceIndex,
        targetSectionId,
        targetVideoId,
        dropPosition: currentVideoDropIndicator.position
      })

      // Handle different drop scenarios
      if (targetSectionId === "root") {
        // Dropping into root level (level 0)
        return handleVideoDropToRoot(prevCourse, draggedVideo, sourceSectionId, sourceIndex, targetVideoId)
      } else {
        // Dropping into a section (level 1)
        return handleVideoDropToSection(prevCourse, draggedVideo, sourceSectionId, sourceIndex, targetSectionId, targetVideoId)
      }
    })

    // Use setTimeout to reset the processing flag after the state update
    setTimeout(() => {
      setIsProcessingDrop(false)
    }, 0)
  }

  const handleVideoDropToRoot = (
    prevCourse: Course, 
    draggedVideo: Video, 
    sourceSectionId: string | null, 
    sourceIndex: number, 
    targetVideoId: string
  ) => {
    console.log('🎯 Moving video to root level')

    // Find target position in root level
    const targetIndex = prevCourse.items.findIndex(item => !('lessons' in item) && item.id === targetVideoId)
    if (targetIndex === -1) {
      console.log('❌ Target video not found in root')
      return prevCourse
    }

    // Create new root video with level 0 properties
    const newRootVideo: Video = {
      ...draggedVideo,
      level: 0,
      sectionId: undefined
    }

    // Remove from source location
    let newSections = [...prevCourse.sections]
    let newItems = [...prevCourse.items]

    if (sourceSectionId) {
      // Remove from section
      newSections = newSections.map(section => 
        section.id === sourceSectionId 
          ? { ...section, lessons: section.lessons.filter((_, index) => index !== sourceIndex) }
          : section
      )
    } else {
      // Remove from root
      newItems = newItems.filter((_, index) => index !== sourceIndex)
    }

    // Insert into root at correct position
    const insertIndex = videoDropIndicator.position === "top" ? targetIndex : targetIndex + 1
    const adjustedInsertIndex = sourceIndex < targetIndex && videoDropIndicator.position === "bottom" ? insertIndex - 1 : insertIndex
    
    newItems.splice(adjustedInsertIndex, 0, newRootVideo)

    console.log('🔄 Video moved to root level:', newRootVideo.title)

      return {
        ...prevCourse,
        sections: newSections,
      items: newItems
    }
  }

  const handleVideoDropToSection = (
    prevCourse: Course, 
    draggedVideo: Video, 
    sourceSectionId: string | null, 
    sourceIndex: number, 
    targetSectionId: string, 
    targetVideoId: string
  ) => {
    console.log('🎯 Moving video to section:', targetSectionId)

    // Find target section and position
    const targetSection = prevCourse.sections.find(s => s.id === targetSectionId)
    if (!targetSection) {
      console.log('❌ Target section not found')
      return prevCourse
    }

    const targetIndex = targetSection.lessons.findIndex(v => v.id === targetVideoId)
    if (targetIndex === -1) {
      console.log('❌ Target video not found in section')
      return prevCourse
    }

    // Create new section video with level 1 properties
    const newSectionVideo: Video = {
      ...draggedVideo,
      level: 1,
      sectionId: targetSectionId
    }

    // Remove from source location
    let newSections = [...prevCourse.sections]
    let newItems = [...prevCourse.items]

    if (sourceSectionId) {
      // Remove from source section
      newSections = newSections.map(section => 
        section.id === sourceSectionId 
          ? { ...section, lessons: section.lessons.filter((_, index) => index !== sourceIndex) }
          : section
      )
    } else {
      // Remove from root
      newItems = newItems.filter((_, index) => index !== sourceIndex)
    }

    // Insert into target section at correct position
    if (!videoDropIndicator) return prevCourse
    const insertIndex = videoDropIndicator.position === "top" ? targetIndex : targetIndex + 1
    const adjustedInsertIndex = sourceIndex < targetIndex && videoDropIndicator.position === "bottom" ? insertIndex - 1 : insertIndex
    
    newSections = newSections.map(section => 
      section.id === targetSectionId 
        ? { ...section, lessons: [...section.lessons.slice(0, adjustedInsertIndex), newSectionVideo, ...section.lessons.slice(adjustedInsertIndex)] }
        : section
    )

    console.log('🔄 Video moved to section:', newSectionVideo.title, 'in section:', targetSectionId)

    return {
      ...prevCourse,
      sections: newSections,
      items: newItems
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar 
        actionButton={
          <Button onClick={handleSaveChanges}>
            {isEditMode ? "Update Course" : "Create Course"}
          </Button>
        }
      />

      {/* Page Header */}
      <div className="container mx-auto px-4 py-6 max-w-4xl pt-24">
        <div className="mb-6">
          <h1 className="text-xl font-bold">{isEditMode ? "Edit Course" : "Create New Course"}</h1>
                <p className="text-sm text-muted-foreground">
            {getTotalLessons()} videos across {course.sections.length} sections
                </p>
              </div>
        {/* Course Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Basic information about your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                placeholder="Enter course title..."
                value={course.title}
                onChange={(e) => updateCourse((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="course-description">Course Description</Label>
              <Textarea
                id="course-description"
                placeholder="Describe what students will learn in this course..."
                value={course.description}
                onChange={(e) => updateCourse((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Structure */}
        <Card className="mb-6">
          <CardHeader>
              <div>
                <CardTitle>Course Structure</CardTitle>
              <CardDescription>Organize your course into sections and videos</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Unified Course Structure - Level 0 Items */}
              {course.items.map((item, itemIndex) => {
                // Check if item is a Section
                if ('lessons' in item) {
                  const section = item as Section
                  console.log('🎨 Rendering section:', { id: section.id, title: section.title, type: typeof section.id })
                  return (
                <div
                  key={section.id}
                  className={`relative border rounded-lg ${
                    draggedSection === section.id ? "opacity-50" : ""
                  } transition-all duration-200`}
                  draggable={true}
                  onDragStart={(e) => {
                    console.log('📚 Section drag start:', { sectionId: section.id })
                    handleItemDragStart(e, section.id, 'section')
                  }}
                  onDragOver={(e) => {
                    handleItemDragOver(e, section.id)
                  }}
                  onDragLeave={() => {
                    handleSectionDragLeave()
                  }}
                  onDragEnd={() => {
                    handleSectionDragEnd()
                  }}
                  onDrop={(e) => {
                    handleItemDrop(e, section.id)
                  }}
                >
                  {/* Section drop indicator - top */}
                  {sectionDropIndicator?.sectionId === section.id &&
                    sectionDropIndicator?.position === "top" && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform -translate-y-1/2 rounded-full z-10" />
                    )}

                  {/* Section drop indicator - bottom */}
                  {sectionDropIndicator?.sectionId === section.id &&
                    sectionDropIndicator?.position === "bottom" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform translate-y-1/2 rounded-full z-10" />
                    )}

                  <Collapsible
                    open={!isSectionCollapsed(section.id)}
                    onOpenChange={() => toggleSectionCollapse(section.id)}
                  >
                    <div className="p-4">
                      {/* Section Title Row */}
                      <div className="flex items-center gap-3 mb-3">
                        {/* Collapse/Expand Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSectionCollapse(section.id)
                          }}
                        >
                          {isSectionCollapsed(section.id) ? (
                            <SquarePlus className="h-4 w-4" />
                          ) : (
                            <SquareMinus className="h-4 w-4" />
                          )}
                        </Button>

                        <Input
                          placeholder="Section title..."
                          value={section.title}
                          onChange={(e) => updateSection(section.id, e.target.value)}
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Action Buttons - Below the title */}
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            console.log('🗑️ Delete section button clicked for section:', section.id, section.title)
                            e.preventDefault()
                            e.stopPropagation()
                            confirmDeleteSection(section.id)
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSectionUp(section.id)
                          }}
                          disabled={itemIndex === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSectionDown(section.id)
                          }}
                          disabled={itemIndex === course.items.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="border-t">
                            {/* Level 1 Videos */}
                        <div className="space-y-3 p-4">
                          {/* Empty section drop placeholder - invisible by default */}
                          {section.lessons.length === 0 && (
                            <div
                              className="relative min-h-[60px] rounded-lg transition-all duration-200"
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                
                                // Only show drop indicator for Level 1 videos (section videos)
                                // Don't show indicators when dragging Level 0 items (sections or root videos)
                                if (draggedSection && !draggedSectionId) {
                                  // We're dragging a Level 0 item, don't show Level 1 drop indicators
                                  setVideoDropIndicator(null)
                                  return
                                }
                                
                                // Only show if we're dragging a Level 1 video
                                if (draggedSectionId && draggedVideoId) {
                                  setVideoDropIndicator({
                                    sectionId: section.id,
                                    videoId: "empty",
                                    position: "top"
                                  })
                                  e.dataTransfer.dropEffect = "move"
                                }
                              }}
                              onDragLeave={() => {
                                setVideoDropIndicator(null)
                              }}
                              onDrop={(e) => {
                                // Only handle Level 1 drops
                                if (draggedSectionId && draggedVideoId) {
                                  handleLevel1VideoDropOnEmptySection(e, section.id)
                                }
                              }}
                            >
                              {/* Drop indicator - only visible when dragging over Level 1 videos */}
                              {videoDropIndicator?.sectionId === section.id && 
                               videoDropIndicator?.videoId === "empty" && 
                               draggedSectionId && draggedVideoId && (
                                <div className="absolute inset-0 border-2 border-primary/50 bg-primary/5 rounded-lg flex items-center justify-center">
                                  <div className="text-primary font-medium text-sm">
                                    Drop video here
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {section.lessons.map((video, videoIndex) => (
                            <div
                                  key={video.id}
                              className={`relative flex items-start gap-3 p-3 rounded-lg bg-muted/60 ${
                                    draggedVideoId === video.id ? "opacity-50" : ""
                              } transition-all duration-200`}
                              draggable={true}
                                  onDragStart={(e) => {
                                    console.log('🎬 Level 1 video drag start:', { sectionId: section.id, videoId: video.id })
                                    e.stopPropagation() // Prevent event bubbling
                                    handleLevel1VideoDragStart(e, section.id, video.id)
                                  }}
                                  onDragOver={(e) => {
                                    // Use only Level 1 drag over logic
                                    handleLevel1VideoDragOver(e, section.id, video.id)
                                  }}
                                  onDragLeave={() => {
                                    handleVideoDragLeave()
                                  }}
                                  onDragEnd={() => {
                                    handleVideoDragEnd()
                                  }}
                                  onDrop={(e) => {
                                    // Use only Level 1 drop logic
                                    handleLevel1VideoDrop(e, section.id, video.id)
                                  }}
                            >
                                  {/* Level 1 Video drop indicator - top */}
                                  {videoDropIndicator?.videoId === video.id &&
                                    videoDropIndicator?.sectionId === section.id &&
                                    videoDropIndicator?.position === "top" && (
                                  <div className="absolute top-0 left-0 right-0 h-2 bg-primary transform -translate-y-1/2 rounded-full z-10 shadow-lg" />
                                )}

                                  {/* Level 1 Video drop indicator - bottom */}
                                  {videoDropIndicator?.videoId === video.id &&
                                    videoDropIndicator?.sectionId === section.id &&
                                    videoDropIndicator?.position === "bottom" && (
                                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-primary transform translate-y-1/2 rounded-full z-10 shadow-lg" />
                                )}



                                                      <div className="flex gap-3 items-center">
              {/* Thumbnail */}
              {video.videoUrl && getVideoThumbnail(video.videoUrl) && (
                <div className="flex-shrink-0">
                  <img
                    src={getVideoThumbnail(video.videoUrl) || undefined}
                    alt={video.title}
                    className="w-[150px] h-auto object-cover rounded border"
                  />
                </div>
              )}

              {/* Video Details */}
                                    <div className="flex-1 pr-20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">Duration: {video.duration || "N/A"}</p>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAddVideoModal(1, section.id, {
                                    id: video.id,
                                    title: video.title,
                                    description: video.description || "",
                                    duration: video.duration || "",
                                    videoUrl: video.videoUrl
                                  })}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    console.log('🗑️ Delete video button clicked for video:', video.id, video.title, 'in section:', section.id)
                                    e.preventDefault()
                                    e.stopPropagation()
                                    confirmDeleteVideo(section.id, video.id)
                                  }}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drag Controls - Fixed to the right */}
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveVideoUp(section.id, video.id)}
                          disabled={videoIndex === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <div className="cursor-grab active:cursor-grabbing py-2.5">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveVideoDown(section.id, video.id)}
                          disabled={videoIndex === section.lessons.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
            </div>
                            </div>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                                onClick={() => {
                                  console.log('🖱️ Add Video button clicked for section:', section.id)
                                  console.log('📋 Section details:', section)
                                  openAddVideoModal(1, section.id)
                                }}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                                Add Video
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                  )
                } else {
                  // Item is a Video (level 0)
                  const video = item as Video
                  return (
                    <div
                      key={video.id}
                                                    className={`relative p-3 rounded-lg bg-muted/60 border ${
                        draggedSection === video.id || draggedVideoId === video.id ? "opacity-50" : ""
                      } transition-all duration-200`}
                      draggable={true}
                      onDragStart={(e) => {
                        console.log('🎯 Level 0 video drag start:', { videoId: video.id })
                        handleItemDragStart(e, video.id, 'video')
                      }}
                      onDragOver={(e) => {
                        // Only use Level 0 drag over for root videos (same as sections)
                        handleItemDragOver(e, video.id)
                      }}
                      onDragLeave={() => {
                        handleSectionDragLeave()
                      }}
                      onDragEnd={() => {
                        handleSectionDragEnd()
                      }}
                      onDrop={(e) => {
                        // Only handle Level 0 item drop for root videos
                        handleItemDrop(e, video.id)
                      }}
                    >
                      {/* Item drop indicator - top */}
                      {sectionDropIndicator?.sectionId === video.id &&
                        sectionDropIndicator?.position === "top" && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform -translate-y-1/2 rounded-full z-10" />
                        )}

                      {/* Item drop indicator - bottom */}
                      {sectionDropIndicator?.sectionId === video.id &&
                        sectionDropIndicator?.position === "bottom" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform translate-y-1/2 rounded-full z-10" />
                        )}

                      {/* Content with right margin for controls */}
                      <div className="flex gap-3 items-center pr-20">
                                      {/* Thumbnail */}
              {video.videoUrl && getVideoThumbnail(video.videoUrl) && (
                <div className="flex-shrink-0">
                  <img
                    src={getVideoThumbnail(video.videoUrl) || undefined}
                    alt={video.title}
                    className="w-[150px] h-auto object-cover rounded border"
                  />
                </div>
              )}

                        {/* Video Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">Duration: {video.duration || "N/A"}</p>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openAddVideoModal(0, undefined, {
                                      id: video.id,
                                      title: video.title,
                                      description: video.description || "",
                                      duration: video.duration || "",
                                      videoUrl: video.videoUrl
                                    })}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                    console.log('🗑️ Delete root video button clicked for video:', video.id, video.title)
                                    e.preventDefault()
                                    e.stopPropagation()
                                    confirmDeleteVideo("root", video.id)
                                  }}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drag Controls - Fixed to the right */}
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItemUp(itemIndex)}
                          disabled={itemIndex === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <div className="cursor-grab active:cursor-grabbing py-2.5">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItemDown(itemIndex)}
                          disabled={itemIndex === course.items.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                }
              })}

              {/* Add Buttons at Bottom */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={addSection} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
                <Button onClick={() => {
                  console.log('🖱️ Add Video (root) button clicked')
                  openAddVideoModal(0)
                }} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Preview */}
        {course.title && (
          <Card>
            <CardHeader>
              <CardTitle>Course Preview</CardTitle>
              <CardDescription>How your course will appear to students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                {course.description && <p className="text-muted-foreground mb-4">{course.description}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{course.sections.length} sections</span>
                  <span>{getTotalLessons()} videos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {deleteConfirmation?.type === "section" ? "Section" : "Video"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                {deleteConfirmation?.type === "section" ? "this section" : "this video"}
                {deleteConfirmation?.title ? ` "${deleteConfirmation.title}"` : ""}?
                {deleteConfirmation?.type === "section" && ` This will also delete all videos within this section.`}{" "}
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  console.log('🗑️ AlertDialogAction clicked, deleteConfirmation:', deleteConfirmation)
                  if (deleteConfirmation?.type === "section") {
                    console.log('🗑️ Calling deleteSection with:', deleteConfirmation.sectionId)
                    deleteSection(deleteConfirmation.sectionId)
                  } else if (deleteConfirmation?.type === "video" && deleteConfirmation.videoId) {
                    console.log('🗑️ Calling deleteVideo with:', deleteConfirmation.sectionId, deleteConfirmation.videoId)
                    deleteVideo(deleteConfirmation.sectionId, deleteConfirmation.videoId)
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Video Modal */}
        <AddVideoModal
          isOpen={isAddVideoModalOpen}
          onClose={closeAddVideoModal}
          onAddVideo={handleAddVideoFromModal}
          onAddPlaylistVideos={handleAddPlaylistVideos}
          level={addVideoLevel}
          sectionId={addVideoSectionId}
          editingVideo={editingVideo}
        />

        {/* Unsaved Changes Dialog */}
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
              <AlertDialogDescription>
                Would you like to update your course?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDiscardAndNavigate}>
                Discard Changes
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateAndNavigate}>
                Update Course
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
} 