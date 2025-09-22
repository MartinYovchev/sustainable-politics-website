import { supabase } from './supabase-storage'
import { nanoid } from 'nanoid'

export interface UploadResult {
  url: string
  filename: string
  path: string
}

export class SupabaseUpload {
  // Upload image to Supabase Storage
  static async uploadImage(file: File): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${nanoid()}.${fileExt}`
      const filePath = `images/${fileName}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        filename: fileName,
        path: filePath
      }
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  // Upload video to Supabase Storage
  static async uploadVideo(file: File): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${nanoid()}.${fileExt}`
      const filePath = `videos/${fileName}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        filename: fileName,
        path: filePath
      }
    } catch (error) {
      console.error('Video upload error:', error)
      throw error
    }
  }

  // Delete file from Supabase Storage
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([filePath])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('File delete error:', error)
      return false
    }
  }

  // Get file info
  static async getFileInfo(filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list(filePath.split('/')[0], {
          search: filePath.split('/')[1]
        })

      if (error) {
        throw new Error(`Failed to get file info: ${error.message}`)
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Get file info error:', error)
      return null
    }
  }

  // Validate file type and size
  static validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be smaller than 5MB' }
    }

    return { valid: true }
  }

  static validateVideo(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
    const maxSize = 100 * 1024 * 1024 // 100MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only MP4, WebM, and OGG videos are allowed' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Video must be smaller than 100MB' }
    }

    return { valid: true }
  }
}