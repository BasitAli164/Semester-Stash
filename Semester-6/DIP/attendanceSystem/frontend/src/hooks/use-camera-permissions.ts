// src/hooks/use-camera-permissions.ts
'use client'

import { useState, useEffect } from 'react'

export function useCameraPermissions() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // Check if browser supports media devices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false)
      return
    }

    // Check camera permissions
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setHasPermission(videoDevices.length > 0)
      })
      .catch(() => {
        setHasPermission(false)
      })
  }, [])

  return { hasPermission, isSupported }
}