/**
 * Utility functions for interacting with catbox.moe
 */

/**
 * Uploads a file to catbox.moe
 * @param file The file to upload
 * @returns The URL of the uploaded file
 */
export async function uploadToCatbox(file: File): Promise<string> {
  try {
    // For files larger than 4.5MB, we need to use a different approach
    // as serverless functions have payload limits
    if (file.size > 4.5 * 1024 * 1024) {
      throw new Error("File too large for serverless function. Use direct upload instead.")
    }

    const formData = new FormData()
    formData.append("reqtype", "fileupload")
    formData.append("userhash", "") // Leave empty for anonymous upload
    formData.append("fileToUpload", file)

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`)
    }

    const url = await response.text()
    return url.trim() // The API returns the URL as plain text
  } catch (error) {
    console.error("Catbox upload error:", error)
    throw new Error("Failed to upload to catbox.moe")
  }
}

/**
 * Checks if a URL is from catbox.moe
 * @param url The URL to check
 * @returns True if the URL is from catbox.moe
 */
export function isCatboxUrl(url: string): boolean {
  return url.includes("catbox.moe") || url.includes("litterbox.catbox.moe")
}

/**
 * Gets the filename from a catbox URL
 * @param url The catbox URL
 * @returns The filename
 */
export function getFilenameFromCatboxUrl(url: string): string {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split("/")
  return pathParts[pathParts.length - 1]
}
