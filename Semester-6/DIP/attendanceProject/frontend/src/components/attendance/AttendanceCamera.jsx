'use client'
import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Button } from '../ui/Button'
import { useStore } from '../../store'

export function AttendanceCamera() {
  const webcamRef = useRef(null)
  const { markAttendance, attendanceLoading, recognitionResult } = useStore()
  const [isCameraActive, setIsCameraActive] = useState(false)

  const capture = useCallback(async () => {
    if (!webcamRef.current) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      await markAttendance(imageSrc)
    }
  }, [markAttendance])

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  }

  return (
    <div className="space-y-6">
      {/* Camera Section */}
      <div className="futuristic-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gradient">Face Recognition</h3>
          <Button
            variant={isCameraActive ? "danger" : "primary"}
            onClick={() => setIsCameraActive(!isCameraActive)}
          >
            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
          </Button>
        </div>

        {isCameraActive ? (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-64 md:h-96 rounded-xl object-cover"
            />
            {/* Face detection overlay */}
            <div className="absolute inset-0 border-4 border-primary-500/50 rounded-xl pointer-events-none animate-pulse"></div>
            
            {/* Capture button */}
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
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h4 className="text-lg font-medium text-white mb-2">Camera Inactive</h4>
            <p className="text-gray-500 dark:text-gray-400">
              Click "Start Camera" to begin face recognition
            </p>
          </div>
        )}
      </div>

      {/* Recognition Result */}
      {recognitionResult && (
        <div className={`futuristic-card p-6 ${
          recognitionResult.recognized 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-red-500/30 bg-red-500/10'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              recognitionResult.recognized ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {recognitionResult.recognized ? (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                {recognitionResult.recognized ? 'Attendance Marked!' : 'Recognition Failed'}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {recognitionResult.message}
                {recognitionResult.confidence && (
                  <span className="ml-2 text-primary-500">
                    (Confidence: {(recognitionResult.confidence * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
              {recognitionResult.student && (
                <div className="mt-2 p-3 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">{recognitionResult.student.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {recognitionResult.student.student_id} • {recognitionResult.student.username}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="futuristic-card p-6">
        <h4 className="font-semibold text-white mb-3">Instructions</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>Ensure good lighting and clear face visibility</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>Position your face within the frame</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>Click the capture button or wait for auto-capture</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>Attendance can only be marked once per day per student</span>
          </li>
        </ul>
      </div>
    </div>
  )
}