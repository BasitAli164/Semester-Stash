'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFaceRecognition } from '@/hooks/use-face-recognition';
import { useAttendance } from '@/hooks/use-attendance';
import { CameraCapture } from '@/components/features/attendance/camera-capture';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function MarkAttendancePage() {
  const router = useRouter();
  const { detectFaces, loading: recognitionLoading } = useFaceRecognition();
  const { markAttendance, loading: attendanceLoading } = useAttendance();
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [attendanceResult, setAttendanceResult] = useState<any>(null);

  const loading = recognitionLoading || attendanceLoading;

  const handleCapture = async (imageData: string) => {
    try {
      const results = await detectFaces(imageData);
      setDetectionResult(results);
      
      // If faces are detected and recognized, mark attendance automatically
      if (results.recognitions && results.recognitions.length > 0) {
        const recognizedFaces = results.recognitions.filter((rec: any) => rec.recognized);
        
        if (recognizedFaces.length > 0) {
          // Mark attendance for the first recognized face
          const firstRecognition = recognizedFaces[0];
          await handleMarkAttendance(firstRecognition);
        }
      }
    } catch (error) {
      console.error('Face detection failed:', error);
    }
  };

  const handleMarkAttendance = async (recognition: any) => {
    try {
      const result = await markAttendance({
        student_id: recognition.student_id,
        name: recognition.name,
        class: recognition.class,
        status: 'Present',
      });
      
      setAttendanceResult({
        success: true,
        student: {
          name: recognition.name,
          student_id: recognition.student_id,
          class: recognition.class,
        },
        message: result.message,
      });
    } catch (error) {
      setAttendanceResult({
        success: false,
        message: 'Failed to mark attendance',
      });
    }
  };

  const handleManualDetection = async (data: any) => {
    await handleCapture(data.image);
  };

  const resetProcess = () => {
    setDetectionResult(null);
    setAttendanceResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/attendance')}
            className="mb-4"
          >
            ← Back to Attendance
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">
            Use face recognition to mark attendance automatically
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Section */}
          <div className="lg:col-span-2">
            <CameraCapture
              onCapture={handleCapture}
              onDetection={handleManualDetection}
              loading={loading}
            />
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Detection Results */}
            {detectionResult && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Detection Results</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Faces Detected:</span>
                      <span className="font-medium">{detectionResult.faces_detected}</span>
                    </div>
                    
                    {detectionResult.recognitions?.map((rec: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">Face {index + 1}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rec.recognized 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rec.recognized ? 'Recognized' : 'Unknown'}
                          </span>
                        </div>
                        
                        {rec.recognized && (
                          <div className="text-sm space-y-1">
                            <div><strong>Name:</strong> {rec.name}</div>
                            <div><strong>ID:</strong> {rec.student_id}</div>
                            <div><strong>Class:</strong> {rec.class}</div>
                            <div><strong>Confidence:</strong> {(rec.confidence * 100).toFixed(1)}%</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attendance Result */}
            {attendanceResult && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Attendance Result</h3>
                  
                  {attendanceResult.success ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-green-900 mb-2">Attendance Marked Successfully!</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {attendanceResult.student.name} ({attendanceResult.student.student_id})
                      </p>
                      <Button onClick={resetProcess} variant="outline" className="w-full">
                        Mark Another Attendance
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-red-900 mb-2">Attendance Failed</h4>
                      <p className="text-sm text-gray-600 mb-3">{attendanceResult.message}</p>
                      <Button onClick={resetProcess} variant="outline" className="w-full">
                        Try Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}