'use client'

import { useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Video, VideoOff } from 'lucide-react'

interface CameraFeedProps {
  onCapture: (imageData: string) => void
  isCapturing: boolean
}

export function CameraFeed({ onCapture, isCapturing }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraOn(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop())
    setStream(null)
    setIsCameraOn(false)
  }

  const captureFrame = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const context = canvas.getContext('2d')
    
    if (context) {
      context.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      onCapture(imageData)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facial Recognition Camera</CardTitle>
        <CardDescription>
          Position faces in the frame and capture for attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <VideoOff className="h-12 w-12 mx-auto mb-2" />
                <p>Camera is off</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!isCameraOn ? (
            <Button onClick={startCamera} className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button 
                onClick={captureFrame} 
                disabled={isCapturing}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {isCapturing ? 'Processing...' : 'Capture Attendance'}
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Stop Camera
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}