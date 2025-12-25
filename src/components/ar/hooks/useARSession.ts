import { useState, useEffect, useCallback, useRef } from 'react'

export interface ARSessionHook {
  session: XRSession | null
  referenceSpace: XRReferenceSpace | null
  isSupported: boolean
  isActive: boolean
  error: string | null
  startSession: () => Promise<void>
  endSession: () => Promise<void>
}

export function useARSession(): ARSessionHook {
  const [session, setSession] = useState<XRSession | null>(null)
  const [referenceSpace, setReferenceSpace] = useState<XRReferenceSpace | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<XRSession | null>(null)

  // Check WebXR support
  useEffect(() => {
    const checkSupport = async () => {
      if (!navigator.xr) {
        setIsSupported(false)
        setError('WebXR is not supported in this browser')
        return
      }

      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar')
        setIsSupported(supported)
        if (!supported) {
          setError('AR is not supported on this device')
        }
      } catch (err) {
        setIsSupported(false)
        setError('Failed to check WebXR support')
      }
    }

    checkSupport()
  }, [])

  const startSession = useCallback(async () => {
    if (!navigator.xr) {
      setError('WebXR is not available')
      return
    }

    try {
      const newSession = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor', 'hit-test'],
        optionalFeatures: ['bounded-floor', 'dom-overlay'],
        domOverlay: { root: document.body },
      })

      setSession(newSession)
      sessionRef.current = newSession

      // Create reference space
      const space = await newSession.requestReferenceSpace('local-floor')
      setReferenceSpace(space)

      setIsActive(true)
      setError(null)

      // Handle session end
      newSession.addEventListener('end', () => {
        setSession(null)
        setReferenceSpace(null)
        setIsActive(false)
        sessionRef.current = null
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start AR session'
      setError(errorMessage)
      setIsActive(false)
    }
  }, [])

  const endSession = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await sessionRef.current.end()
      } catch (err) {
        console.error('Error ending AR session:', err)
      }
    }
  }, [])

  return {
    session,
    referenceSpace,
    isSupported,
    isActive,
    error,
    startSession,
    endSession,
  }
}

