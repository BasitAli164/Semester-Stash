'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, RefreshCw, AlertCircle } from 'lucide-react'

interface CameraFeedProps {
  onCapture: (imageData: string) => void
  isCapturing: boolean
}

export function CameraFeed({ onCapture, isCapturing }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)

  // Start camera and show preview
  const startCamera = async () => {
    try {
      setError(null)
      
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      console.log('📸 Starting camera for photo capture...')
      
      // Get camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera
        }
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Wait for video to be ready
        videoRef.current.onloadeddata = () => {
          console.log('✅ Camera ready for photos')
          setIsCameraReady(true)
        }
        
        // Play the video
        await videoRef.current.play()
      }
    } catch (error: any) {
      console.error('❌ Camera error:', error)
      setError(`Camera access failed: ${error.message}`)
      setIsCameraReady(false)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraReady(false)
    setError(null)
  }

  // Capture photo directly
  const capturePhoto = () => {
    if (!videoRef.current || !isCameraReady) {
      setError('Camera not ready. Please start camera first.')
      return
    }

    const video = videoRef.current
    
    // Check if video has valid data
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera feed not available. Please try again.')
      return
    }

    console.log(`📷 Capturing photo: ${video.videoWidth}x${video.videoHeight}`)
    
    // Create canvas for photo capture
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    
    if (context) {
      // Draw current video frame to canvas (mirrored for front camera)
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to base64 image
      const photoData = canvas.toDataURL('image/jpeg', 0.9)
      console.log('✅ Photo captured successfully')
      
      // Send to parent component
      onCapture(photoData)
    }
  }

  // Take another photo (keep camera running)
  const takeAnotherPhoto = () => {
    capturePhoto()
  }

  // Restart camera
  const restartCamera = () => {
    stopCamera()
    setTimeout(() => startCamera(), 300)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Attendance Photo</CardTitle>
        <CardDescription>
          {isCameraReady ? 'Position face in frame and capture photo' : 'Start camera to take photo'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Preview Area */}
        <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden border-2 border-blue-300">
          {/* Hidden video element for camera access */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect
          />
          
          {/* Camera Not Started State */}
          {!stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium">Camera Ready</p>
                <p className="text-sm">Click "Start Camera" to begin</p>
              </div>
            </div>
          )}

          {/* Camera Active - Show Capture UI */}
          {isCameraReady && (
            <>
              {/* Capture frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed rounded-lg w-64 h-64 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-70" />
                    <p className="text-sm opacity-70">Position face here</p>
                  </div>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                ● LIVE
              </div>
            </>
          )}

          {/* Loading State */}
          {stream && !isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center text-white">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Initializing camera...</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <Button 
              onClick={restartCamera}
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Camera Controls */}
        <div className="flex gap-3 flex-wrap">
          {!stream ? (
            // Start Camera Button
            <Button 
              onClick={startCamera} 
              className="flex items-center gap-2 flex-1"
              size="lg"
            >
              <Camera className="h-4 w-4" />
              Start Camera & Take Photo
            </Button>
          ) : isCameraReady ? (
            // Photo Capture Controls
            <>
              <Button 
                onClick={capturePhoto} 
                disabled={isCapturing}
                className="flex items-center gap-2 flex-1"
                size="lg"
              >
                <Camera className="h-4 w-4" />
                {isCapturing ? 'Processing Photo...' : 'Capture Photo'}
              </Button>
              <Button 
                variant="outline" 
                onClick={restartCamera}
                size="lg"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Restart Camera
              </Button>
            </>
          ) : (
            // Camera Starting
            <Button disabled className="flex items-center gap-2 flex-1" size="lg">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Starting Camera...
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-800 mb-2">How to use:</p>
          <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
            <li>Click "Start Camera" to activate your camera</li>
            <li>Position your face in the frame</li>
            <li>Click "Capture Photo" to take attendance</li>
            <li>System will automatically recognize your face</li>
          </ol>
        </div>

        {/* Camera Status */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Status: {isCameraReady ? 'Ready for Photos' : stream ? 'Starting...' : 'Not Started'}</span>
          <span>
            {videoRef.current && isCameraReady && 
              `Resolution: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`
            }
          </span>
        </div>
      </CardContent>
    </Card>
  )
}