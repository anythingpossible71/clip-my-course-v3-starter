import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // YouTube Data API v3 endpoint
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      console.error("YouTube API error:", data)
      return NextResponse.json({ error: "Failed to fetch video metadata" }, { status: 500 })
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const video = data.items[0]
    const snippet = video.snippet
    const contentDetails = video.contentDetails

    // Parse duration (ISO 8601 format: PT4M13S)
    const duration = contentDetails.duration
    const durationInSeconds = parseDuration(duration)

    // Format duration for display
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      }
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return NextResponse.json({
      title: snippet.title,
      duration: formatDuration(durationInSeconds),
      description: snippet.description,
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      viewCount: "0", // YouTube API v3 doesn't provide view count in basic request
      likeCount: "0", // YouTube API v3 doesn't provide like count in basic request
      videoId: videoId
    })

  } catch (error) {
    console.error("YouTube metadata error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function parseDuration(duration: string): number {
  // Parse ISO 8601 duration format (PT4M13S, PT1H2M30S, etc.)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  
  if (!match) return 0
  
  const hours = parseInt(match[1] || "0")
  const minutes = parseInt(match[2] || "0")
  const seconds = parseInt(match[3] || "0")
  
  return hours * 3600 + minutes * 60 + seconds
} 