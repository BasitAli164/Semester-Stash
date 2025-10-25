'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { useStore } from '../../../store'
import { Button } from '../../../components/ui/Button'
import { RecognitionFeedback } from '../../../components/attendance/RecognitionFeedback'

export default function LiveAttendancePage() {
  const webcamRef = useRef(null)
  const { markAttendance, attendanceLoading, recognitionResult, clearRecognitionResult } = useStore()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [autoCapture, setAutoCapture] = useState(true)
  const [captureInterval, setCaptureInterval] = useState(null)

  useEffect(() => {
    return () => {
      if (captureInterval) {
        clearInterval(captureInterval)
      }
      clearRecognitionResult()
    }
  }, [captureInterval, clearRecognitionResult])

  const capture = useCallback(async () => {
    if (!webcamRef.current || attendanceLoading) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      await markAttendance(imageSrc)
    }
  }, [markAttendance, attendanceLoading])

  const startAutoCapture = () => {
    if (captureInterval) {
      clearInterval(captureInterval)
    }
    
    const interval = setInterval(() => {
      if (!attendanceLoading) {
        capture()
      }
    }, 3000) // Capture every 3 seconds
    
    setCaptureInterval(interval)
  }

  const stopAutoCapture = () => {
    if (captureInterval) {
      clearInterval(captureInterval)
      setCaptureInterval(null)
    }
  }

  const handleCameraToggle = () => {
    if (isCameraActive) {
      setIsCameraActive(false)
      stopAutoCapture()
      clearRecognitionResult()
    } else {
      setIsCameraActive(true)
      if (autoCapture) {
        startAutoCapture()
      }
    }
  }

  const handleAutoCaptureToggle = (enabled) => {
    setAutoCapture(enabled)
    if (enabled && isCameraActive) {
      startAutoCapture()
    } else {
      stopAutoCapture()
    }
  }

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Live Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time face recognition with auto-capture
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            variant={autoCapture ? "primary" : "secondary"}
            onClick={() => handleAutoCaptureToggle(!autoCapture)}
            disabled={!isCameraActive}
          >
            {autoCapture ? 'Auto: ON' : 'Auto: OFF'}
          </Button>
          <Button
            variant={isCameraActive ? "danger" : "primary"}
            onClick={handleCameraToggle}
          >
            {isCameraActive ? 'Stop Live' : 'Start Live'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera and Controls - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Camera Feed */}
          <div className="futuristic-card p-6">
            {isCameraActive ? (
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-64 md:h-96 rounded-xl object-cover"
                />
                {/* Live indicator */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>
                
                {/* Face detection overlay */}
                <div className="absolute inset-0 border-4 border-primary-500/50 rounded-xl pointer-events-none animate-pulse"></div>
                
                {/* Manual capture button */}
                {!autoCapture && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button
                      onClick={capture}
                      loading={attendanceLoading}
                      size="lg"
                      className="rounded-full w-16 h-16 p-0 flex items-center justify-center"
                    >
                      {attendanceLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-8 h-8 bg-white rounded-full"></div>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h4 className="text-lg font-medium text-white mb-2">Live Feed Inactive</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Click "Start Live" to begin real-time recognition
                </p>
                <Button onClick={handleCameraToggle}>
                  Start Live Recognition
                </Button>
              </div>
            )}
          </div>

          {/* Recognition Results */}
          {recognitionResult && (
            <RecognitionFeedback result={recognitionResult} />
          )}
        </div>

        {/* Controls and Info - 1/3 width */}
        <div className="space-y-6">
          {/* Mode Controls */}
          <div className="futuristic-card p-6">
            <h3 className="text-xl font-bold text-gradient mb-4">Recognition Mode</h3>
            <div className="space-y-4">
              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  autoCapture 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => handleAutoCaptureToggle(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    autoCapture ? 'border-primary-500 bg-primary-500' : 'border-gray-500'
                  }`}>
                    {autoCapture && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Auto Capture</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically capture every 3 seconds
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  !autoCapture 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => handleAutoCaptureToggle(false)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    !autoCapture ? 'border-primary-500 bg-primary-500' : 'border-gray-500'
                  }`}>
                    {!autoCapture && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Manual Capture</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to capture when ready
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="futuristic-card p-6">
            <h3 className="text-xl font-bold text-gradient mb-4">Live Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Camera Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isCameraActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {isCameraActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Capture Mode</span>
                <span className="px-2 py-1 bg-primary-500/20 text-primary-500 rounded-full text-xs font-medium">
                  {autoCapture ? 'Auto' : 'Manual'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Recognition Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  attendanceLoading 
                    ? 'bg-yellow-500/20 text-yellow-500' 
                    : recognitionResult?.recognized
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-gray-500/20 text-gray-500'
                }`}>
                  {attendanceLoading ? 'Processing...' : recognitionResult?.recognized ? 'Success' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="futuristic-card p-6">
            <h3 className="text-xl font-bold text-gradient mb-4">Live Mode Guide</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Auto mode continuously scans for faces</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Manual mode gives you control over captures</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Ensure consistent lighting for best results</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Multiple students can be recognized sequentially</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}