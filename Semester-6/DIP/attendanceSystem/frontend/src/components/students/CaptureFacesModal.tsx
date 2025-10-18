'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Student } from '@/types';
import { useAppStore } from '@/store/store';
import { Button } from '@/components/ui/button';

interface CaptureFacesModalProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

export function CaptureFacesModal({ student, onClose, onSuccess }: CaptureFacesModalProps) {
  const webcamRef = useRef<Webcam>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedCount, setCapturedCount] = useState(student.face_images_captured);
  const [captureProgress, setCaptureProgress] = useState<number[]>([]);

  const { captureStudentFaces } = useAppStore();

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;

    setIsCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (!imageSrc) {
      alert('Failed to capture image. Please ensure camera permissions are granted.');
      setIsCapturing(false);
      return;
    }

    try {
      const success = await captureStudentFaces(student.student_id, imageSrc);
      
      if (success) {
        const newCount = capturedCount + 1;
        setCapturedCount(newCount);
        setCaptureProgress(prev => [...prev, Date.now()]);
        
        if (newCount >= 5) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      } else {
        alert('Failed to capture face image. Please try again.');
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      alert('An error occurred while capturing the face image.');
    } finally {
      setIsCapturing(false);
    }
  }, [captureStudentFaces, student.student_id, capturedCount, onSuccess]);

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  const neededImages = Math.max(0, 5 - capturedCount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Capture Face Images for {student.name}
              </h3>
              
              <div className="space-y-4">
                {/* Progress */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Progress: {capturedCount} / 5 images
                    </span>
                    <span className="text-sm text-blue-700">
                      {neededImages} more needed
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(capturedCount / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

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

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Capture Instructions:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Capture images from different angles</li>
                    <li>• Vary your facial expressions slightly</li>
                    <li>• Ensure good lighting on your face</li>
                    <li>• Look directly at the camera</li>
                    <li>• Remove glasses/hats if they obstruct your face</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={toggleCamera}
                    variant="outline"
                    className="flex-1"
                  >
                    {cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
                  </Button>
                  
                  <Button
                    onClick={capture}
                    disabled={!cameraActive || isCapturing || capturedCount >= 5}
                    loading={isCapturing}
                    className="flex-1"
                  >
                    {isCapturing 
                      ? 'Capturing...' 
                      : capturedCount >= 5 
                        ? 'Completed!' 
                        : `Capture Image (${capturedCount + 1}/5)`
                    }
                  </Button>

                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                    disabled={isCapturing}
                  >
                    {capturedCount >= 5 ? 'Finish' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}