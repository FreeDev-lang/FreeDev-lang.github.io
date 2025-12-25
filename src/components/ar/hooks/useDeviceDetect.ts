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
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
    const isAndroid = /android/i.test(userAgent)
    const isMobile = isIOS || isAndroid
    const isDesktop = !isMobile

    // Check WebXR support
    const supportsWebXR =
      'xr' in navigator &&
      navigator.xr !== undefined &&
      'isSessionSupported' in navigator.xr &&
      typeof navigator.xr.isSessionSupported === 'function'

    setDeviceInfo({
      isMobile,
      isIOS,
      isAndroid,
      isDesktop,
      supportsWebXR,
    })
  }, [])

  return deviceInfo
}

