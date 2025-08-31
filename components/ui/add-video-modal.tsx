"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, AlertCircle, Check, CheckSquare, Square } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

interface AddVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onAddVideo: (videoData: { title: string; description: string; duration: string; videoUrl: string }) => void
  onAddPlaylistVideos?: (videos: Array<{ title: string; description: string; duration: string; videoUrl: string }>, createSection?: boolean, sectionTitle?: string) => void
  level: 0 | 1
  sectionId?: string
  editingVideo?: { id: string; title: string; description: string; duration: string; videoUrl: string } | null
}

export function AddVideoModal({ isOpen, onClose, onAddVideo, onAddPlaylistVideos, level, sectionId, editingVideo }: AddVideoModalProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [videoInfo, setVideoInfo] = useState<{ title: string; duration: string; thumbnail: string } | null>(null)
  const [editableTitle, setEditableTitle] = useState("")
  const [editableDescription, setEditableDescription] = useState("")
  
  // Playlist state
  const [isPlaylist, setIsPlaylist] = useState(false)
  const [playlistData, setPlaylistData] = useState<any>(null)
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [createSection, setCreateSection] = useState(true)
  const [sectionTitle, setSectionTitle] = useState("")

  // Initialize form when editing
  useEffect(() => {
    if (editingVideo) {
      setUrl(editingVideo.videoUrl)
      setEditableTitle(editingVideo.title)
      setEditableDescription(editingVideo.description)
      setVideoInfo({
        title: editingVideo.title,
        duration: editingVideo.duration,
        thumbnail: getVideoThumbnail(editingVideo.videoUrl) || ""
      })
    } else {
      setUrl("")
      setEditableTitle("")
      setEditableDescription("")
      setVideoInfo(null)
    }
  }, [editingVideo])

  const getVideoThumbnail = (videoUrl: string) => {
    const videoId = extractVideoId(videoUrl)
    if (!videoId) return null
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const extractPlaylistId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/playlist\?list=([^&\n?#]+)/,
      /youtube\.com\/watch\?.*list=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // Duration is already formatted by the API, so we don't need to format it again

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    setIsLoading(true)
    setError("")
    setVideoInfo(null)
    setPlaylistData(null)
    setIsPlaylist(false)
    setSelectedVideos([])

    try {
      // Check if it's a playlist first
      const playlistId = extractPlaylistId(url)
      if (playlistId) {
        setIsPlaylist(true)
        const response = await fetch(`/api/youtube/playlist?playlistId=${playlistId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch playlist metadata")
        }

        setPlaylistData(data)
        // Select all videos by default
        setSelectedVideos(data.videos.map((video: any) => video.videoId))
        return
      }

      // Check if it's a video
      const videoId = extractVideoId(url)
      if (!videoId) {
        setError("Please enter a valid YouTube video or playlist URL")
        return
      }

      setIsPlaylist(false)
      const response = await fetch(`/api/youtube/metadata?videoId=${videoId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video metadata")
      }

      // Show video info to user before adding
      setVideoInfo({
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail
      })
      setEditableTitle(data.title)
      setEditableDescription("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metadata")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVideo = () => {
    if (videoInfo) {
      const videoData = {
        title: editableTitle.trim() || videoInfo.title,
        description: editableDescription.trim(),
        duration: videoInfo.duration,
        videoUrl: url.trim()
      }
      onAddVideo(videoData)
      setUrl("")
      setVideoInfo(null)
      setEditableTitle("")
      setEditableDescription("")
      onClose()
    }
  }

  const handleAddPlaylistVideos = () => {
    if (!playlistData || selectedVideos.length === 0) return

    const selectedVideoData = playlistData.videos.filter((video: any) => 
      selectedVideos.includes(video.videoId)
    )

    const videos = selectedVideoData.map((video: any) => ({
      title: video.title,
      description: video.description || "",
      duration: video.duration,
      videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`
    }))

    // Use the new bulk addition function if available, otherwise fall back to individual addition
    if (onAddPlaylistVideos) {
      // When already in a section (level === 1), don't create a new section
      const shouldCreateSection = level === 0 ? createSection : false
      const sectionTitleToUse = level === 0 ? sectionTitle : ""
      onAddPlaylistVideos(videos, shouldCreateSection, sectionTitleToUse)
    } else {
      // Fallback to individual addition
      videos.forEach(videoData => {
        onAddVideo(videoData)
      })
    }

    // Reset state
    setUrl("")
    setPlaylistData(null)
    setIsPlaylist(false)
    setSelectedVideos([])
    setCreateSection(true)
    setSectionTitle("")
    onClose()
  }

  const handleClose = () => {
    setUrl("")
    setError("")
    setVideoInfo(null)
    setPlaylistData(null)
    setIsPlaylist(false)
    setSelectedVideos([])
    setCreateSection(true)
    setSectionTitle("")
    setEditableTitle("")
    setEditableDescription("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingVideo ? "Edit Video" : "Add Video"}</DialogTitle>
          <DialogDescription>
            {editingVideo 
              ? "Edit the video details"
              : level === 0 
                ? "Add a video to the course root level"
                : "Add a video to this section"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 flex-1 overflow-y-auto">
          {!editingVideo && !isPlaylist && (
            <div className="grid gap-2">
              <Label htmlFor="url">YouTube URL</Label>
              <Input
                id="url"
                placeholder="Please paste video or playlist link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSubmit()
                  }
                }}
                disabled={isLoading}
              />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {videoInfo && (
            <div className="space-y-4">
              {/* Video Preview */}
                              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex gap-3">
                  <img 
                    src={videoInfo.thumbnail} 
                    alt={videoInfo.title}
                    className="w-20 h-15 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">{videoInfo.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Duration: {videoInfo.duration}</p>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter lesson title..."
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Lesson Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter lesson description..."
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {isPlaylist && playlistData && (
            <div className="space-y-4">
              {/* Success Banner */}
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Playlist identified. Please select the videos you would like to add to this course
                </AlertDescription>
              </Alert>

              {/* Section Creation Option - Only show when not already in a section */}
              {level === 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="create-section"
                      checked={createSection}
                      onCheckedChange={(checked) => setCreateSection(checked as boolean)}
                    />
                    <Label htmlFor="create-section" className="text-sm font-medium">
                      Create a section for these videos
                    </Label>
                  </div>
                  
                  {createSection && (
                    <div className="grid gap-2">
                      <Label htmlFor="section-title">Section Title</Label>
                      <Input
                        id="section-title"
                        placeholder="Enter section title..."
                        value={sectionTitle}
                        onChange={(e) => setSectionTitle(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Video Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Select Videos</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVideos(playlistData.videos.map((video: any) => video.videoId))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVideos([])}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                {/* Scrollable Video List */}
                <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {playlistData.videos.map((video: any) => (
                    <div key={video.videoId} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                      <Checkbox
                        checked={selectedVideos.includes(video.videoId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedVideos([...selectedVideos, video.videoId])
                          } else {
                            setSelectedVideos(selectedVideos.filter(id => id !== video.videoId))
                          }
                        }}
                      />
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-16 h-12 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">Duration: {video.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {isPlaylist && playlistData ? (
            <Button 
              onClick={handleAddPlaylistVideos} 
              disabled={selectedVideos.length === 0 || (level === 0 && createSection && !sectionTitle.trim())}
            >
              Add Selected Videos ({selectedVideos.length})
            </Button>
          ) : videoInfo || editingVideo ? (
            <Button onClick={handleAddVideo}>
              {editingVideo ? "Update Video" : "Save Video"}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading || !url.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Fetch Video"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 