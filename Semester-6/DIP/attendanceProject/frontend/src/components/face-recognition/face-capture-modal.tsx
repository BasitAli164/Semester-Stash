'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Camera, Loader2 } from 'lucide-react'

interface FaceCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
  isLoading?: boolean
}

export function FaceCaptureModal({ isOpen, onClose, onCapture, isLoading }: FaceCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true)
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        
        // Call onCapture with the image data
        onCapture(imageData)
        
        setIsCapturing(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mark Attendance with Face Recognition
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera Preview */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Face overlay guide */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-green-400 rounded-full opacity-50"></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          Position your face within the circle and ensure good lighting
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={captureImage}
            disabled={isLoading || isCapturing}
            className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading || isCapturing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
            <span>
              {isLoading || isCapturing ? 'Processing...' : 'Capture'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}