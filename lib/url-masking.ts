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
