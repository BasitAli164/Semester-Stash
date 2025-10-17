'use client';

import { useState, useEffect } from 'react';
import { Camera, Users, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CameraFeed } from '@/components/camera/camera-feed';
import { attendanceService } from '@/services/api.service';
import { useAppStore } from '@/store/app.store';
import { FaceRecognitionResult } from '@/types';
import Link from 'next/link';

export default function TakeAttendancePage() {
  const { modelReady, addNotification, refreshData } = useAppStore();
  const [recognitionResults, setRecognitionResults] = useState<FaceRecognitionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [lastCaptureTime, setLastCaptureTime] = useState<number>(0);

  useEffect(() => {
    if (!modelReady) {
      addNotification('Face recognition model is not trained. Please train the model first.');
    }
  }, [modelReady, addNotification]);

  const handleCaptureImage = async (imageData: string) => {
    if (!modelReady) {
      addNotification('Model not ready for recognition');
      return;
    }

    // Throttle recognition to prevent too many requests
    const now = Date.now();
    if (now - lastCaptureTime < 2000) { // 2 second throttle
      return;
    }
    setLastCaptureTime(now);

    setIsProcessing(true);
    try {
      const response = await attendanceService.recognizeFaces(imageData);
      if (response.success && response.results) {
        setRecognitionResults(response.results);
        if (response.results.length > 0) {
          addNotification(`Recognized ${response.results.filter(r => r.status === 'recognized').length} faces`);
        }
      } else {
        addNotification(response.message || 'Recognition failed');
      }
    } catch (error) {
      addNotification('Error during face recognition');
      console.error('Recognition error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAttendance = async () => {
    const recognizedFaces = recognitionResults.filter(r => r.status === 'recognized');
    if (recognizedFaces.length === 0) {
      addNotification('No recognized faces to mark attendance for');
      return;
    }

    setIsMarking(true);
    try {
      const response = await attendanceService.markAttendance(recognizedFaces);
      if (response.success) {
        addNotification(`Attendance marked for ${response.marked_count} students`);
        setRecognitionResults(prev => 
          prev.map(face => ({
            ...face,
            attendance_marked: face.status === 'recognized',
            attendance_message: 'Attendance marked'
          }))
        );
        await refreshData();
      } else {
        addNotification(response.message || 'Failed to mark attendance');
      }
    } catch (error) {
      addNotification('Error marking attendance');
      console.error('Mark attendance error:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const recognizedCount = recognitionResults.filter(r => r.status === 'recognized').length;
  const unknownCount = recognitionResults.filter(r => r.status === 'unknown').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/attendance">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Take Attendance</h1>
          <p className="text-slate-600">
            Use facial recognition to mark attendance automatically
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Live Camera Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CameraFeed 
              onCapture={handleCaptureImage}
              isCapturing={isProcessing}
            />
            
            {!modelReady && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Face recognition model is not trained. Please train the model in the dashboard first.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recognition Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Recognition Results
              </span>
              <div className="flex space-x-2">
                <Badge variant="success">{recognizedCount} Known</Badge>
                <Badge variant="destructive">{unknownCount} Unknown</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Processing face recognition...</p>
              </div>
            ) : recognitionResults.length > 0 ? (
              <div className="space-y-4">
                {recognitionResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {result.status === 'recognized' ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900">
                          {result.status === 'recognized' ? result.name : 'Unknown Person'}
                        </p>
                        {result.status === 'recognized' && (
                          <p className="text-sm text-slate-500">
                            {result.student_id} • {result.confidence}% confidence
                          </p>
                        )}
                        {result.attendance_marked && (
                          <p className="text-xs text-green-600 font-medium">
                            ✓ Attendance marked
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={result.status === 'recognized' ? 'success' : 'destructive'}
                    >
                      {result.status === 'recognized' ? 'Recognized' : 'Unknown'}
                    </Badge>
                  </div>
                ))}

                {recognizedCount > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <Button
                      onClick={handleMarkAttendance}
                      disabled={isMarking}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isMarking ? 'Marking Attendance...' : `Mark Attendance for ${recognizedCount} Students`}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p>No faces detected yet</p>
                <p className="text-sm mt-2">
                  Capture an image to start face recognition
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Position faces clearly in the camera view</li>
                <li>2. Click "Capture Image" to recognize faces</li>
                <li>3. Review recognition results</li>
                <li>4. Click "Mark Attendance" for recognized students</li>
                <li>5. Unknown faces need to be registered first</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}