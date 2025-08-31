/**
 * Extract playlist ID from various YouTube playlist URL formats
 * @param url - YouTube playlist URL
 * @returns The playlist ID or null if not found
 */
export function extractPlaylistId(url: string): string | null {
  // Handle various YouTube playlist URL formats
  const patterns = [
    /(?:youtube\.com\/playlist\?list=|youtu\.be\/.*\?list=|youtube\.com\/watch\?.*list=)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/.*\?list=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*list=([a-zA-Z0-9_-]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Extract video ID from various YouTube video URL formats
 * @param url - YouTube video URL
 * @returns The video ID or null if not found
 */
export function extractVideoId(url: string): string | null {
  // Handle various YouTube video URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Validate if a string is a valid YouTube playlist ID
 * @param playlistId - The playlist ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidPlaylistId(playlistId: string): boolean {
  // YouTube playlist IDs are typically 34 characters long and contain letters, numbers, hyphens, and underscores
  return /^[a-zA-Z0-9_-]{34}$/.test(playlistId)
}

/**
 * Validate if a string is a valid YouTube video ID
 * @param videoId - The video ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidVideoId(videoId: string): boolean {
  // YouTube video IDs are exactly 11 characters long
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
}

/**
 * Convert a YouTube playlist URL to a playlist ID
 * @param url - YouTube playlist URL
 * @returns The playlist ID or null if invalid
 */
export function urlToPlaylistId(url: string): string | null {
  const playlistId = extractPlaylistId(url)
  if (playlistId && isValidPlaylistId(playlistId)) {
    return playlistId
  }
  return null
}

/**
 * Convert a YouTube video URL to a video ID
 * @param url - YouTube video URL
 * @returns The video ID or null if invalid
 */
export function urlToVideoId(url: string): string | null {
  const videoId = extractVideoId(url)
  if (videoId && isValidVideoId(videoId)) {
    return videoId
  }
  return null
}

/**
 * Generate YouTube thumbnail URL from video ID
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality: 'default', 'hq', 'mq', 'sd', 'maxres'
 * @returns YouTube thumbnail URL
 */
export function generateYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
  const qualityMap = {
    default: 'default.jpg',
    hq: 'hqdefault.jpg',
    mq: 'mqdefault.jpg',
    sd: 'sddefault.jpg',
    maxres: 'maxresdefault.jpg'
  }
  
  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}`
}

/**
 * Generate YouTube thumbnail URL from video URL
 * @param videoUrl - YouTube video URL
 * @param quality - Thumbnail quality: 'default', 'hq', 'mq', 'sd', 'maxres'
 * @returns YouTube thumbnail URL or null if invalid URL
 */
export function generateThumbnailFromUrl(videoUrl: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string | null {
  const videoId = extractVideoId(videoUrl)
  if (!videoId) return null
  
  return generateYouTubeThumbnail(videoId, quality)
} 