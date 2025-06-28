/**
 * Centralized constants for the application
 * This file contains all shared constants to avoid duplication
 */

// Maximum file size for Vercel serverless functions (4.5MB to be safe)
export const MAX_FILE_SIZE = 4.5 * 1024 * 1024

// Supported video formats
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm', 
  'video/mov',
  'video/avi',
  'video/mkv',
  'video/wmv',
  'video/flv',
  'video/3gp'
] as const

// Supported image formats  
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml'
] as const

// Combined supported types
export const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES] as const

// Storage key for access verification
export const ACCESS_STORAGE_KEY = "imgur_lite_access" as const 