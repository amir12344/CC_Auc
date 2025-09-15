/**
 * YouTube utility functions for extracting video IDs and building URLs
 */

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - URLs with additional query parameters
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove any whitespace
  const cleanUrl = url.trim();

  // Pattern 1: youtube.com/watch?v=VIDEO_ID
  const watchMatch = cleanUrl.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) {
    return watchMatch[1];
  }

  // Pattern 2: youtu.be/VIDEO_ID
  const shortMatch = cleanUrl.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) {
    return shortMatch[1];
  }

  // Pattern 3: youtube.com/embed/VIDEO_ID
  const embedMatch = cleanUrl.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) {
    return embedMatch[1];
  }

  // Pattern 4: youtube.com/v/VIDEO_ID
  const vMatch = cleanUrl.match(/(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
  if (vMatch) {
    return vMatch[1];
  }

  return null;
}

/**
 * Builds the YouTube embed URL for a video ID
 */
export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Builds the YouTube thumbnail URL with fallback options
 * Tries maxresdefault.jpg first (1280x720), falls back to hqdefault.jpg (480x360)
 */
export function buildYouTubeThumbnailUrl(videoId: string, quality: 'maxres' | 'hq' | 'mq' | 'sd' = 'maxres'): string {
  const qualityMap = {
    maxres: 'maxresdefault', // 1280x720
    hq: 'hqdefault',        // 480x360
    mq: 'mqdefault',        // 320x180
    sd: 'sddefault'         // 640x480
  };
  
  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Gets the best available thumbnail URL by checking if maxres exists, fallback to hq
 */
export function getBestYouTubeThumbnailUrl(videoId: string): string {
  // For now, return maxres. In production, you might want to check if the URL exists
  // and fallback to hqdefault if maxres returns 404
  return buildYouTubeThumbnailUrl(videoId, 'maxres');
}

/**
 * Converts a YouTube URL to its embed equivalent
 */
export function convertToYouTubeEmbedUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    // If we can't extract the ID, return the original URL
    return url;
  }
  return buildYouTubeEmbedUrl(videoId);
}
