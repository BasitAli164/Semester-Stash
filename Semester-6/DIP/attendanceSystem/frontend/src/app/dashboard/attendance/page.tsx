'use client'

import { useState,useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Users, CheckCircle, Clock, User, Upload } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

type RecognitionResult = {
  name?: string
  student_id?: string
  confidence?: number
  status: 'recognized' | 'unknown'
}

type AttendanceRecord = {
  id: string
  name: string
  time: string
  status: string
}

export default function AttendancePage() {
  const { markAttendance, todayAttendance } = useAppStore()
  const [isCapturing, setIsCapturing] = useState(false)
  const [recognitionResults, setRecognitionResults] = useState<RecognitionResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Capture photo using camera
  const capturePhotoWithCamera = async () => {
    try {
      // Check if browser supports camera
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Camera not supported in this browser')
        return
      }

      setIsCapturing(true)
      toast('Accessing camera...')

      // Access camera temporarily
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      })
      
      // Create video element temporarily for capture
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          resolve(null)
        }
      })

      // Create canvas for capture
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      
      if (context) {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        
        // Send to backend for recognition
        await processAttendancePhoto(imageData)
      }

      // Stop all video tracks immediately
      stream.getTracks().forEach(track => track.stop())
      
    } catch (error) {
      console.error('Camera error:', error)
      toast.error('Unable to access camera. Please check permissions.')
    } finally {
      setIsCapturing(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsCapturing(true)
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      const imageData = e.target?.result as string
      await processAttendancePhoto(imageData)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    
    reader.onerror = () => {
      toast.error('Failed to read image file')
      setIsCapturing(false)
    }
    
    reader.readAsDataURL(file)
  }

  // Process the captured photo for attendance
  const processAttendancePhoto = async (imageData: string) => {
    try {
      toast('Processing photo for face recognition...')
      
      // Send to backend for recognition
      const results: RecognitionResult[] = await markAttendance(imageData)
      setRecognitionResults(results)

      const recognized = results.filter((r) => r.status === 'recognized')
      if (recognized.length > 0) {
        toast.success(`Attendance marked for ${recognized.length} student(s) ✅`)
      } else {
        toast.warning('No recognized faces found 😕')
      }
    } catch (error) {
      toast.error('Failed to recognize faces ❌')
    } finally {
      setIsCapturing(false)
    }
  }

  const presentCount = todayAttendance.filter(
    (record: AttendanceRecord) => record.status === 'present'
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Take Attendance</h1>
        <p className="text-muted-foreground">
          Capture photo to automatically recognize and mark attendance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Capture and Results */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Take Attendance Photo</CardTitle>
              <CardDescription>
                Capture a photo to automatically recognize students and mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Capture Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={capturePhotoWithCamera}
                  disabled={isCapturing}
                  className="h-24 flex flex-col gap-3"
                  variant="outline"
                >
                  <Camera className="h-8 w-8" />
                  <div>
                    <div className="font-medium">Take Photo</div>
                    <div className="text-xs text-muted-foreground">Use camera</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCapturing}
                  className="h-24 flex flex-col gap-3"
                  variant="outline"
                >
                  <Upload className="h-8 w-8" />
                  <div>
                    <div className="font-medium">Upload Photo</div>
                    <div className="text-xs text-muted-foreground">From device</div>
                  </div>
                </Button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">📸 How to take attendance:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Click "Take Photo" to use your camera instantly</li>
                  <li>• Or click "Upload Photo" to use an existing image</li>
                  <li>• Ensure faces are clearly visible in the photo</li>
                  <li>• System will automatically recognize registered students</li>
                  <li>• Attendance will be marked automatically</li>
                </ul>
              </div>

              {/* Status */}
              {isCapturing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Processing photo...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recognition Results */}
          {recognitionResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recognition Results</CardTitle>
                <CardDescription>
                  {recognitionResults.filter((r) => r.status === 'recognized').length} recognized,{' '}
                  {recognitionResults.filter((r) => r.status === 'unknown').length} unknown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recognitionResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'recognized'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback
                            className={
                              result.status === 'recognized'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {result.status === 'recognized' ? result.name : 'Unknown Person'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {result.status === 'recognized' ? result.student_id : 'Not registered'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={result.status === 'recognized' ? 'default' : 'secondary'}
                          className={
                            result.status === 'recognized'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {result.status === 'recognized' ? 'Recognized' : 'Unknown'}
                        </Badge>
                        {result.status === 'recognized' && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Attendance Marked
                          </p>
                        )}
                      </div>
                    </div>
                    {result.status === 'recognized' && result.confidence && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Confidence: {Math.round(result.confidence)}%
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Present:</span>
                  <span className="font-semibold text-green-600">{presentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Marked:</span>
                  <span className="font-semibold">{todayAttendance.length}</span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/dashboard/reports">View Full Report</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayAttendance.slice(0, 3).map((record: AttendanceRecord) => (
                <div key={record.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{record.name}</p>
                    <p className="text-xs text-muted-foreground">{record.time}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Present
                  </Badge>
                </div>
              ))}
              {todayAttendance.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No attendance today
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}