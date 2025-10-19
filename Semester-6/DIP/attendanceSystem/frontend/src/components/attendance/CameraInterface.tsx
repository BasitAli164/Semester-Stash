'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useAppStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CameraInterfaceProps {
  onFaceRecognized: (student: any) => void;
  onUnknownFace: () => void;
}

export function CameraInterface({ onFaceRecognized, onUnknownFace }: CameraInterfaceProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const { 
    recognizeFaces, 
    markAttendance, 
    setRecognitionResults,
    setIsMarkingAttendance 
  } = useAppStore();

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
    frameRate: { ideal: 30, max: 60 }
  };

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;

    setIsCapturing(true);
    
    try {
      // Get screenshot - remove the quality parameter as it's not supported
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        alert('Failed to capture image. Please ensure camera permissions are granted and your face is clearly visible.');
        setIsCapturing(false);
        return;
      }

      console.log("📸 Image captured, starting recognition...");
      
      // Recognize faces
      const results = await recognizeFaces(imageSrc);
      
      console.log(`🔍 Recognition results: ${results.length} faces detected`);
      
      if (results.length > 0) {
        const recognizedFaces = results.filter(r => r.status === 'recognized');
        const unknownFaces = results.filter(r => r.status === 'unknown');

        console.log(`✅ Recognized: ${recognizedFaces.length}, ❓ Unknown: ${unknownFaces.length}`);

        if (recognizedFaces.length > 0) {
          // Mark attendance for recognized faces
          setIsMarkingAttendance(true);
          const markedCount = await markAttendance(recognizedFaces);
          
          console.log(`🎯 Marked attendance for ${markedCount} students`);
          
          if (markedCount > 0) {
            // Show details for first recognized student
            const firstRecognized = results.find((r: any) => r.attendance_marked);
            if (firstRecognized) {
              onFaceRecognized(firstRecognized);
            }
          }
        } else if (unknownFaces.length > 0) {
          console.log("🆕 Unknown face detected");
          onUnknownFace();
        }
      } else {
        alert('No faces detected. Please ensure:\n• Your face is clearly visible\n• Good lighting conditions\n• Face is within the green guide box\n• No obstructions (glasses, hats, etc.)');
      }
    } catch (error) {
      console.error('❌ Error processing image:', error);
      alert('Failed to process image. Please try again with better lighting and clear face visibility.');
    } finally {
      setIsCapturing(false);
      setIsMarkingAttendance(false);
    }
  }, [recognizeFaces, markAttendance, onFaceRecognized, onUnknownFace, setIsMarkingAttendance]);

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Live Camera</h2>
          <Button
            onClick={toggleCamera}
            variant="secondary"
            size="sm"
          >
            {cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Camera Feed */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {cameraActive ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-lg">Camera is off</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Click "Turn On Camera" to start
                  </p>
                </div>
              </div>
            )}
            
            {/* Face Detection Guide */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-green-500 border-dashed rounded-lg w-64 h-64 flex items-center justify-center">
                  <span className="text-green-500 text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                    Position face here
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Capture Button */}
          <div className="flex justify-center">
            <Button
              onClick={capture}
              disabled={!cameraActive || isCapturing}
              loading={isCapturing}
              size="lg"
              className="min-w-48"
            >
              {isCapturing ? 'Processing...' : 'Capture & Recognize'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure good lighting and clear face visibility</li>
              <li>• Position your face within the green guide box</li>
              <li>• Remove glasses or hats if they obstruct your face</li>
              <li>• Look directly at the camera</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}