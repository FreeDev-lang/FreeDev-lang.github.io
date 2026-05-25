import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type ModelViewerProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string
  alt?: string
  ar?: boolean
  'ar-modes'?: string
  'ar-scale'?: string
  'ar-placement'?: string
  'xr-environment'?: boolean
  'camera-controls'?: boolean
  'touch-action'?: string
  'interaction-policy'?: string
  loading?: string
  'shadow-intensity'?: string
  'environment-image'?: string
  exposure?: string
  'auto-rotate'?: boolean
  'camera-orbit'?: string
  'min-camera-orbit'?: string
  'max-camera-orbit'?: string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps
    }
  }
}

export {}
