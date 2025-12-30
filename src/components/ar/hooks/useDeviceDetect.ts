import { useState, useEffect } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isDesktop: boolean
  supportsWebXR: boolean
}

export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    supportsWebXR: false,
  })

  useEffect(() => {
    const checkWebXRSupport = async () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
      const isAndroid = /android/i.test(userAgent)
      const isMobile = isIOS || isAndroid
      const isDesktop = !isMobile

      // Check WebXR support - try to actually check if AR is supported
      let supportsWebXR = false
      
      if ('xr' in navigator && navigator.xr !== undefined) {
        try {
          // Check if immersive-ar session is supported
          if (typeof navigator.xr.isSessionSupported === 'function') {
            supportsWebXR = await navigator.xr.isSessionSupported('immersive-ar')
          }
        } catch (error) {
          console.warn('WebXR support check failed:', error)
          supportsWebXR = false
        }
      }

      setDeviceInfo({
        isMobile,
        isIOS,
        isAndroid,
        isDesktop,
        supportsWebXR,
      })
    }

    checkWebXRSupport()
  }, [])

  return deviceInfo
}

