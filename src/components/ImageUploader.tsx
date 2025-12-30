import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { IMAGE_SPECS, resizeImage, validateImageDimensions, getFileSizeMB } from '../utils/imageResizer'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  type: 'carousel' | 'banner' | 'logo'
  currentUrl?: string
  onUpload: (file: File) => Promise<void> | void
  onRemove?: () => void
  disabled?: boolean
}

export default function ImageUploader({ type, currentUrl, onUpload, onRemove, disabled }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [validation, setValidation] = useState<{ valid: boolean; message?: string; width?: number; height?: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const specs = IMAGE_SPECS[type]

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Check initial file size (we'll compress it, but warn if it's way too large)
    const fileSizeMB = getFileSizeMB(file)
    if (fileSizeMB > specs.maxFileSize * 2) {
      toast.error(`File size is very large (${fileSizeMB.toFixed(1)}MB). It will be compressed to ${specs.maxFileSize}MB or less.`, { duration: 5000 })
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Auto-resize and compress
    try {
      setIsUploading(true)
      const originalSizeMB = getFileSizeMB(file)
      
      const resizedFile = await resizeImage(file, type)
      const compressedSizeMB = getFileSizeMB(resizedFile)
      const sizeReduction = ((originalSizeMB - compressedSizeMB) / originalSizeMB * 100).toFixed(1)
      
      // Validate dimensions of compressed image
      const validationResult = await validateImageDimensions(resizedFile, type)
      setValidation(validationResult)
      
      // Update preview with compressed image
      const compressedReader = new FileReader()
      compressedReader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      compressedReader.readAsDataURL(resizedFile)
      
      // Call parent's upload handler with the compressed file
      await onUpload(resizedFile)
      
      if (parseFloat(sizeReduction) > 0) {
        toast.success(`Image optimized! Size reduced by ${sizeReduction}% (${compressedSizeMB.toFixed(2)}MB)`)
      } else {
        toast.success('Image processed successfully')
      }
    } catch (error: any) {
      toast.error('Failed to process image: ' + error.message)
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setValidation(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onRemove) {
      onRemove()
    }
  }

  return (
    <div className="space-y-4">
      {/* Dimension Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Recommended Dimensions</h4>
            <p className="text-sm text-blue-700 mb-2">{specs.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Size:</span>{' '}
                <span className="text-blue-800">{specs.recommendedWidth} × {specs.recommendedHeight}px</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Aspect Ratio:</span>{' '}
                <span className="text-blue-800">{specs.aspectRatio.toFixed(2)}:1</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Max File Size:</span>{' '}
                <span className="text-blue-800">{specs.maxFileSize}MB</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Format:</span>{' '}
                <span className="text-blue-800">JPG, PNG, WebP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
          <p className="text-gray-700 font-medium mb-1">
            {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500">
            {specs.recommendedWidth} × {specs.recommendedHeight}px recommended
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain bg-gray-50"
            />
      {validation && (
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
          validation.valid
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {validation.valid ? (
            <>
              <Check className="w-4 h-4" />
              <span>Optimized</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Compressed</span>
            </>
          )}
        </div>
      )}
            <button
              onClick={handleRemove}
              className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {validation && !validation.valid && validation.message && (
            <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
              {validation.message}
            </div>
          )}
          {validation && validation.width && validation.height && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              Current: {validation.width} × {validation.height}px
            </div>
          )}
        </div>
      )}

      {isUploading && (
        <div className="text-center text-sm text-gray-600">
          Processing image...
        </div>
      )}
    </div>
  )
}

