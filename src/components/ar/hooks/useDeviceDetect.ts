import { useState, useEffect } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isDesktop: boolean
  supportsWebXR: boolean
  supportsARQuickLook: boolean // iOS USDZ AR Quick Look
  supportedARMode: 'webxr' | 'quicklook' | '3d-only' | 'none'
  browserName: string
  browserVersion: string
  osName: string
  osVersion: string
}

/**
 * Detect device capabilities and determine the best AR experience mode.
 */
export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    supportsWebXR: false,
    supportsARQuickLook: false,
    supportedARMode: 'none',
    browserName: '',
    browserVersion: '',
    osName: '',
    osVersion: '',
  })

  useEffect(() => {
    const checkDeviceCapabilities = async () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      
      // Detect OS
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
      const isAndroid = /android/i.test(userAgent)
      const isMobile = isIOS || isAndroid || /mobile/i.test(userAgent)
      const isDesktop = !isMobile
      
      // Parse browser info
      const browserInfo = parseBrowserInfo(userAgent)
      const osInfo = parseOSInfo(userAgent)
      
      // Check WebXR support
      let supportsWebXR = false
      if ('xr' in navigator && navigator.xr !== undefined) {
        try {
          if (typeof navigator.xr.isSessionSupported === 'function') {
            supportsWebXR = await navigator.xr.isSessionSupported('immersive-ar')
          }
        } catch (error) {
          console.warn('WebXR support check failed:', error)
          supportsWebXR = false
        }
      }
      
      // Check iOS AR Quick Look support (USDZ files)
      // AR Quick Look is supported on iOS 12+ Safari
      const supportsARQuickLook = isIOS && 
        parseFloat(osInfo.version) >= 12 && 
        /Safari/i.test(userAgent) &&
        !/CriOS|FxiOS|OPiOS|EdgiOS/.test(userAgent) // Not in other browsers
      
      // Determine best AR mode
      let supportedARMode: 'webxr' | 'quicklook' | '3d-only' | 'none' = 'none'
      
      if (supportsWebXR) {
        supportedARMode = 'webxr'
      } else if (supportsARQuickLook) {
        supportedARMode = 'quicklook'
      } else if (isMobile || isDesktop) {
        // Fall back to 3D viewer on all devices
        supportedARMode = '3d-only'
      }

      setDeviceInfo({
        isMobile,
        isIOS,
        isAndroid,
        isDesktop,
        supportsWebXR,
        supportsARQuickLook,
        supportedARMode,
        browserName: browserInfo.name,
        browserVersion: browserInfo.version,
        osName: osInfo.name,
        osVersion: osInfo.version,
      })
    }

    checkDeviceCapabilities()
  }, [])

  return deviceInfo
}

/**
 * Parse browser name and version from user agent.
 */
function parseBrowserInfo(userAgent: string): { name: string; version: string } {
  const browsers = [
    { name: 'Chrome', regex: /Chrome\/(\d+)/ },
    { name: 'Firefox', regex: /Firefox\/(\d+)/ },
    { name: 'Safari', regex: /Version\/(\d+).*Safari/ },
    { name: 'Edge', regex: /Edg\/(\d+)/ },
    { name: 'Opera', regex: /OPR\/(\d+)/ },
    { name: 'Samsung Browser', regex: /SamsungBrowser\/(\d+)/ },
  ]
  
  for (const browser of browsers) {
    const match = userAgent.match(browser.regex)
    if (match) {
      return { name: browser.name, version: match[1] }
    }
  }
  
  return { name: 'Unknown', version: '0' }
}

/**
 * Parse OS name and version from user agent.
 */
function parseOSInfo(userAgent: string): { name: string; version: string } {
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    const match = userAgent.match(/OS (\d+[._]\d+)/)
    return {
      name: 'iOS',
      version: match ? match[1].replace('_', '.') : '0'
    }
  }
  
  if (/Android/.test(userAgent)) {
    const match = userAgent.match(/Android (\d+\.?\d*)/)
    return {
      name: 'Android',
      version: match ? match[1] : '0'
    }
  }
  
  if (/Windows/.test(userAgent)) {
    const match = userAgent.match(/Windows NT (\d+\.?\d*)/)
    return {
      name: 'Windows',
      version: match ? match[1] : '0'
    }
  }
  
  if (/Mac OS X/.test(userAgent)) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
    return {
      name: 'macOS',
      version: match ? match[1].replace('_', '.') : '0'
    }
  }
  
  return { name: 'Unknown', version: '0' }
}

/**
 * Check if the current browser supports a specific WebXR feature.
 */
export async function checkWebXRFeature(feature: string): Promise<boolean> {
  if (!('xr' in navigator) || !navigator.xr) {
    return false
  }
  
  try {
    // Create a test session to check feature support
    const session = await navigator.xr.requestSession('immersive-ar', {
      optionalFeatures: [feature]
    })
    
    const supported = (session as any).enabledFeatures?.includes(feature) ?? false
    await session.end()
    
    return supported
  } catch {
    return false
  }
}

/**
 * Get a human-readable description of the device's AR capabilities.
 */
export function getARCapabilityDescription(deviceInfo: DeviceInfo): string {
  switch (deviceInfo.supportedARMode) {
    case 'webxr':
      return 'Full AR experience with WebXR'
    case 'quicklook':
      return 'AR Quick Look (iOS)'
    case '3d-only':
      return '3D viewer (AR not supported)'
    case 'none':
      return 'Not supported'
  }
}
