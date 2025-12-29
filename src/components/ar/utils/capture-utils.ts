/**
 * Capture utilities for WebAR
 * Provides photo capture functionality for the AR experience
 */

export interface CaptureResult {
  dataUrl: string
  blob: Blob
  width: number
  height: number
  timestamp: number
}

/**
 * Capture the current canvas as an image
 */
export async function captureCanvas(canvas: HTMLCanvasElement): Promise<CaptureResult> {
  return new Promise((resolve, reject) => {
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      
      // Convert data URL to blob
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          resolve({
            dataUrl,
            blob,
            width: canvas.width,
            height: canvas.height,
            timestamp: Date.now()
          })
        })
        .catch(reject)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Capture with JPEG format for smaller file size
 */
export async function captureCanvasAsJpeg(
  canvas: HTMLCanvasElement, 
  quality: number = 0.92
): Promise<CaptureResult> {
  return new Promise((resolve, reject) => {
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          resolve({
            dataUrl,
            blob,
            width: canvas.width,
            height: canvas.height,
            timestamp: Date.now()
          })
        })
        .catch(reject)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Download the captured image
 */
export function downloadCapture(result: CaptureResult, filename?: string): void {
  const link = document.createElement('a')
  link.href = result.dataUrl
  link.download = filename || `fria-ar-${result.timestamp}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Share the captured image using Web Share API
 */
export async function shareCapture(result: CaptureResult, title?: string): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) {
    console.warn('Web Share API not supported')
    return false
  }
  
  try {
    const file = new File([result.blob], `fria-ar-${result.timestamp}.png`, {
      type: 'image/png'
    })
    
    const shareData: ShareData = {
      title: title || 'My FRIA AR Design',
      text: 'Check out my furniture design in AR!',
      files: [file]
    }
    
    if (navigator.canShare(shareData)) {
      await navigator.share(shareData)
      return true
    }
    
    // Fallback to sharing just URL if files not supported
    await navigator.share({
      title: title || 'My FRIA AR Design',
      text: 'Check out my furniture design in AR!'
    })
    return true
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled share
      return false
    }
    throw error
  }
}

/**
 * Save to device gallery (mobile only, requires user gesture)
 */
export async function saveToGallery(result: CaptureResult): Promise<boolean> {
  try {
    // Try using the File System Access API (Chrome)
    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `fria-ar-${result.timestamp}.png`,
        types: [{
          description: 'PNG Image',
          accept: { 'image/png': ['.png'] }
        }]
      })
      
      const writable = await handle.createWritable()
      await writable.write(result.blob)
      await writable.close()
      return true
    }
    
    // Fallback to download
    downloadCapture(result)
    return true
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return false
    }
    // Fallback to download on error
    downloadCapture(result)
    return true
  }
}

/**
 * Copy image to clipboard
 */
export async function copyToClipboard(result: CaptureResult): Promise<boolean> {
  try {
    if (!navigator.clipboard?.write) {
      console.warn('Clipboard API not supported')
      return false
    }
    
    const item = new ClipboardItem({
      'image/png': result.blob
    })
    
    await navigator.clipboard.write([item])
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Create a thumbnail from a capture
 */
export function createThumbnail(
  result: CaptureResult, 
  maxSize: number = 200
): Promise<CaptureResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      captureCanvas(canvas).then(resolve).catch(reject)
    }
    img.onerror = reject
    img.src = result.dataUrl
  })
}

