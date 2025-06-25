/**
 * Utility functions for URL masking
 */

/**
 * Extracts the filename from a URL
 * @param url The URL to extract from
 * @returns The filename
 */
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    return pathParts[pathParts.length - 1]
  } catch (error) {
    // If URL parsing fails, try a simple regex
    const match = url.match(/\/([^/]+)$/)
    return match ? match[1] : url
  }
}

/**
 * Determines if a file is a video based on its extension
 * @param filename The filename or URL to check
 * @returns True if the file appears to be a video
 */
export function isVideoFile(filename: string): boolean {
  const videoExtensions = [
    '.mp4', '.webm', '.mov', '.avi', '.mkv', 
    '.wmv', '.flv', '.3gp', '.m4v', '.ogv'
  ]
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return videoExtensions.includes(extension)
}

/**
 * Determines if a file is an image based on its extension
 * @param filename The filename or URL to check
 * @returns True if the file appears to be an image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', 
    '.bmp', '.svg', '.tiff', '.ico'
  ]
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return imageExtensions.includes(extension)
}

/**
 * Masks a catbox.moe URL to use the custom domain
 * @param url The original catbox URL
 * @returns The masked URL using i.dhrv.dev
 */
export function maskCatboxUrl(url: string): string {
  if (!url) return url

  // If it's already using our domains, return as is
  if (url.includes("i.dhrv.dev") || url.includes("img.intercomm.in")) {
    return url
  }

  // Check if it's a catbox URL
  if (url.includes("catbox.moe")) {
    const filename = getFilenameFromUrl(url)
    
    // Use different subdomain for videos if desired (optional enhancement)
    // For now, we'll use the same domain for both images and videos
    return `https://i.dhrv.dev/${filename}`
  }

  // Return the original URL if it's not from catbox
  return url
}

/**
 * Unmasks a custom domain URL back to the original catbox URL
 * @param url The masked URL
 * @param originalUrl The original catbox URL (if known)
 * @returns The original catbox URL
 */
export function unmaskUrl(url: string, originalUrl?: string): string {
  if (!url) return url

  // If we have the original URL and the masked URL is using any of our domains, return the original
  if (originalUrl && (url.includes("i.dhrv.dev") || url.includes("img.intercomm.in"))) {
    return originalUrl
  }

  // If it's using our domains but we don't have the original, try to reconstruct it
  if (url.includes("i.dhrv.dev") || url.includes("img.intercomm.in")) {
    const filename = getFilenameFromUrl(url)
    return `https://files.catbox.moe/${filename}`
  }

  // Return the URL as is if it's not using our domains
  return url
}

/**
 * Gets the appropriate content type for a file based on its extension
 * @param filename The filename or URL
 * @returns The MIME content type
 */
export function getContentTypeFromFilename(filename: string): string {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  
  // Video types
  const videoTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm', 
    '.mov': 'video/mov',
    '.avi': 'video/avi',
    '.mkv': 'video/mkv',
    '.wmv': 'video/wmv',
    '.flv': 'video/flv',
    '.3gp': 'video/3gp',
    '.m4v': 'video/mp4',
    '.ogv': 'video/ogg'
  }
  
  // Image types
  const imageTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.tiff': 'image/tiff',
    '.ico': 'image/x-icon'
  }
  
  return videoTypes[extension] || imageTypes[extension] || 'application/octet-stream'
}
