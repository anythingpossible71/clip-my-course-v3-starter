"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, Clock, Eye, ThumbsUp, Calendar, List, ExternalLink } from "lucide-react"

interface YouTubeMetadata {
  title: string
  description: string
  thumbnail: string
  duration: string
  viewCount: string
  likeCount: string
  publishedAt: string
  channelTitle: string
  videoId: string
}

interface PlaylistVideo {
  videoId: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  duration: string
  durationInSeconds: number
  position: number
  playlistPosition: number
}

interface PlaylistMetadata {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  videoCount: number
}

interface PlaylistData {
  playlist: PlaylistMetadata
  videos: PlaylistVideo[]
}

export default function TestMetaPage() {
  const [url, setUrl] = useState("")
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null)
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPlaylist, setIsPlaylist] = useState(false)

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^?\n#]+)/
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

  const formatNumber = (num: string): string => {
    const number = parseInt(num)
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`
    }
    return number.toString()
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTotalDuration = (videos: PlaylistVideo[]): string => {
    const totalSeconds = videos.reduce((sum, video) => sum + video.durationInSeconds, 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const handleExtractMetadata = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    setLoading(true)
    setError("")
    setMetadata(null)
    setPlaylistData(null)
    setIsPlaylist(false)

    try {
      // Check if it's a playlist first
      const playlistId = extractPlaylistId(url)
      if (playlistId) {
        setIsPlaylist(true)
        const response = await fetch(`/api/youtube/playlist?playlistId=${playlistId}`, {
          method: 'GET',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract playlist metadata')
        }

        setPlaylistData(data)
        return
      }

      // Check if it's a video
      const videoId = extractVideoId(url)
      if (!videoId) {
        setError("Invalid YouTube URL. Please enter a valid YouTube video or playlist URL.")
        return
      }

      setIsPlaylist(false)
      const response = await fetch(`/api/youtube/metadata?videoId=${videoId}`, {
        method: 'GET',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract metadata')
      }

      setMetadata(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">YouTube Metadata Extractor</h1>
          <p className="text-muted-foreground">
            Enter a YouTube URL to extract video or playlist metadata including thumbnails, duration, and statistics.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Extract Metadata</CardTitle>
            <CardDescription>
              Paste a YouTube video or playlist URL below to extract information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/playlist?list=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleExtractMetadata()}
                />
                <Button 
                  onClick={handleExtractMetadata} 
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    'Extract'
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Playlist Results */}
        {playlistData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Playlist: {playlistData.playlist.title}
              </CardTitle>
              <CardDescription>
                {playlistData.playlist.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Playlist Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <img
                    src={playlistData.playlist.thumbnail}
                    alt={playlistData.playlist.title}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{playlistData.playlist.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      by {playlistData.playlist.channelTitle}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {playlistData.playlist.description}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{playlistData.playlist.videoCount}</p>
                        <p className="text-xs text-muted-foreground">Videos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{formatTotalDuration(playlistData.videos)}</p>
                        <p className="text-xs text-muted-foreground">Total Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{formatDate(playlistData.playlist.publishedAt)}</p>
                        <p className="text-xs text-muted-foreground">Created</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Playlist</p>
                        <p className="text-xs text-muted-foreground">Type</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Videos List */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Videos in Playlist ({playlistData.videos.length})</h4>
                <div className="space-y-3">
                  {playlistData.videos.map((video, index) => (
                    <div key={video.videoId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm line-clamp-2 mb-1">
                              {video.position}. {video.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mb-2">
                              {video.channelTitle} • {formatDate(video.publishedAt)}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {video.duration}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Watch
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Data */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Raw Data</h4>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(playlistData, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Single Video Results */}
        {metadata && !isPlaylist && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Metadata</CardTitle>
              <CardDescription>
                Video information extracted from YouTube
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Thumbnail and Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <img
                    src={metadata.thumbnail}
                    alt={metadata.title}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{metadata.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      by {metadata.channelTitle}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {metadata.description}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{metadata.duration}</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{formatNumber(metadata.viewCount)}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{formatNumber(metadata.likeCount)}</p>
                        <p className="text-xs text-muted-foreground">Likes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{formatDate(metadata.publishedAt)}</p>
                        <p className="text-xs text-muted-foreground">Published</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Data */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Raw Data</h4>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Embed URL */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Embed Information</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Video ID</Label>
                    <p className="text-sm text-muted-foreground font-mono">{metadata.videoId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Embed URL</Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      https://www.youtube.com/embed/{metadata.videoId}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 