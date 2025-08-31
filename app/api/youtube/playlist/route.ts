import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("playlistId")

    if (!playlistId) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 })
    }

    // YouTube Data API v3 endpoint
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    // First, get playlist details
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&part=snippet&key=${apiKey}`
    const playlistResponse = await fetch(playlistUrl)
    const playlistData = await playlistResponse.json()

    if (!playlistResponse.ok) {
      console.error("YouTube API error:", playlistData)
      return NextResponse.json({ error: "Failed to fetch playlist metadata" }, { status: 500 })
    }

    if (!playlistData.items || playlistData.items.length === 0) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    const playlist = playlistData.items[0]
    const playlistSnippet = playlist.snippet

    // Get playlist items (videos)
    const playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails&maxResults=50&key=${apiKey}`
    const itemsResponse = await fetch(playlistItemsUrl)
    const itemsData = await itemsResponse.json()

    if (!itemsResponse.ok) {
      console.error("YouTube API error:", itemsData)
      return NextResponse.json({ error: "Failed to fetch playlist items" }, { status: 500 })
    }

    // Extract video IDs from playlist items
    const videoIds = itemsData.items.map((item: any) => item.contentDetails.videoId).join(',')

    // Get detailed video information
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=snippet,contentDetails&key=${apiKey}`
    const videosResponse = await fetch(videosUrl)
    const videosData = await videosResponse.json()

      if (!videosResponse.ok) {
      console.error("YouTube API error:", videosData)
      return NextResponse.json({ error: "Failed to fetch video details" }, { status: 500 })
      }

    // Create a map of video details for quick lookup
    const videoDetailsMap = new Map()
    videosData.items.forEach((video: any) => {
      videoDetailsMap.set(video.id, video)
    })

    // Combine playlist items with video details
    const videos = itemsData.items.map((item: any, index: number) => {
      const videoDetails = videoDetailsMap.get(item.contentDetails.videoId)
      const snippet = videoDetails?.snippet || item.snippet
      const contentDetails = videoDetails?.contentDetails

      // Parse duration
      const duration = contentDetails?.duration || "PT0S"
      const durationInSeconds = parseDuration(duration)
      const formattedDuration = formatDuration(durationInSeconds)
            
            return {
              videoId: item.contentDetails.videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        duration: formattedDuration,
        durationInSeconds: durationInSeconds,
        position: index + 1,
        playlistPosition: item.snippet.position + 1
      }
    })

    return NextResponse.json({ 
      playlist: {
        id: playlistId,
        title: playlistSnippet.title,
        description: playlistSnippet.description,
        thumbnail: playlistSnippet.thumbnails?.high?.url || playlistSnippet.thumbnails?.medium?.url || playlistSnippet.thumbnails?.default?.url,
        channelTitle: playlistSnippet.channelTitle,
        publishedAt: playlistSnippet.publishedAt,
        videoCount: videos.length
      },
      videos: videos
    })

  } catch (error) {
    console.error("YouTube playlist error:", error)
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

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
} 