'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Users, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { CameraFeed } from '@/components/attendance/camera-feed'
import { RecognitionResults } from '@/components/attendance/recognition-results'

export default function AttendancePage() {
  const { markAttendance, todayAttendance, isAttendanceLoading } = useAppStore()
  const [isCapturing, setIsCapturing] = useState(false)
  const [recognitionResults, setRecognitionResults] = useState<any[]>([])

  const handleCapture = async (imageData: string) => {
    setIsCapturing(true)
    try {
      const results = await markAttendance(imageData)
      setRecognitionResults(results)
    } catch (error) {
      console.error('Attendance capture failed:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  const presentCount = todayAttendance.filter(record => record.status === 'present').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Take Attendance</h1>
        <p className="text-muted-foreground">
          Use facial recognition to mark student attendance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CameraFeed 
            onCapture={handleCapture}
            isCapturing={isCapturing}
          />
          
          <RecognitionResults results={recognitionResults} />
        </div>

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
                <CheckCircle className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard/students">Register New Student</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard/system">Train Model</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}