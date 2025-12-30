/**
 * Image resizer utility with dimension recommendations
 */

export interface ImageSpecs {
  recommendedWidth: number
  recommendedHeight: number
  maxFileSize: number // in MB
  aspectRatio: number
  description: string
}

export const IMAGE_SPECS: Record<string, ImageSpecs> = {
  carousel: {
    recommendedWidth: 1920,
    recommendedHeight: 800,
    maxFileSize: 5,
    aspectRatio: 2.4, // 1920/800
    description: 'Carousel slides are displayed prominently on your store homepage'
  },
  banner: {
    recommendedWidth: 1920,
    recommendedHeight: 400,
    maxFileSize: 3,
    aspectRatio: 4.8, // 1920/400
    description: 'Banners appear at strategic locations throughout your store'
  },
  logo: {
    recommendedWidth: 500,
    recommendedHeight: 500,
    maxFileSize: 2,
    aspectRatio: 1, // 1:1
    description: 'Store logo displayed in headers and branding areas'
  }
}

/**
 * Resize image to recommended dimensions while maintaining aspect ratio
 * Also compresses the image to reduce file size
 */
export async function resizeImage(
  file: File,
  type: 'carousel' | 'banner' | 'logo'
): Promise<File> {
  const specs = IMAGE_SPECS[type]
  if (!specs) {
    throw new Error(`Unknown image type: ${type}`)
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        
        // Always resize to recommended dimensions (or keep if smaller) for consistency
        let newWidth = width
        let newHeight = height
        
        if (width > specs.recommendedWidth || height > specs.recommendedHeight) {
          // Calculate scaling factor
          const scaleWidth = specs.recommendedWidth / width
          const scaleHeight = specs.recommendedHeight / height
          const scale = Math.min(scaleWidth, scaleHeight)

          // Calculate new dimensions
          newWidth = Math.round(width * scale)
          newHeight = Math.round(height * scale)
        }
        // Note: Even if image is already the right size, we'll still compress it for file size reduction

        // Set canvas dimensions
        canvas.width = newWidth
        canvas.height = newHeight

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw and resize image
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Determine output format - convert to JPEG for better compression
        const outputFormat = 'image/jpeg'
        const outputQuality = 0.85 // Start with 85% quality

        // Compress image with adaptive quality to meet file size requirements
        const maxSizeBytes = specs.maxFileSize * 1024 * 1024
        let quality = outputQuality
        let blob: Blob | null = null

        // Try to compress to target file size
        for (let attempt = 0; attempt < 5; attempt++) {
          blob = await new Promise<Blob | null>((resolveBlob) => {
            canvas.toBlob(
              (b) => resolveBlob(b),
              outputFormat,
              quality
            )
          })

          if (!blob) {
            reject(new Error('Failed to create blob'))
            return
          }

          // If file size is acceptable or quality is too low, stop
          if (blob.size <= maxSizeBytes || quality <= 0.5) {
            break
          }

          // Reduce quality for next attempt
          quality -= 0.1
        }

        if (!blob) {
          reject(new Error('Failed to compress image'))
          return
        }

        // Get file extension
        const originalName = file.name
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName
        const newFileName = `${nameWithoutExt}.jpg`

        // Create new file with compressed image
        const resizedFile = new File([blob], newFileName, {
          type: outputFormat,
          lastModified: Date.now()
        })

        resolve(resizedFile)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  file: File,
  type: 'carousel' | 'banner' | 'logo'
): Promise<{ valid: boolean; message?: string; width?: number; height?: number }> {
  const specs = IMAGE_SPECS[type]
  if (!specs) {
    return Promise.resolve({ valid: false, message: `Unknown image type: ${type}` })
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const width = img.width
        const height = img.height
        const aspectRatio = width / height
        const targetAspectRatio = specs.aspectRatio

        // Check if dimensions are close to recommended (within 20% tolerance)
        const widthDiff = Math.abs(width - specs.recommendedWidth) / specs.recommendedWidth
        const heightDiff = Math.abs(height - specs.recommendedHeight) / specs.recommendedHeight
        const aspectDiff = Math.abs(aspectRatio - targetAspectRatio) / targetAspectRatio

        if (widthDiff > 0.2 || heightDiff > 0.2) {
          resolve({
            valid: false,
            message: `Recommended dimensions: ${specs.recommendedWidth}x${specs.recommendedHeight}px. Your image: ${width}x${height}px`,
            width,
            height
          })
          return
        }

        if (aspectDiff > 0.1) {
          resolve({
            valid: false,
            message: `Aspect ratio mismatch. Recommended: ${targetAspectRatio.toFixed(2)}:1. Your image: ${aspectRatio.toFixed(2)}:1`,
            width,
            height
          })
          return
        }

        resolve({ valid: true, width, height })
      }

      img.onerror = () => {
        resolve({ valid: false, message: 'Failed to load image' })
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      resolve({ valid: false, message: 'Failed to read file' })
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024)
}

