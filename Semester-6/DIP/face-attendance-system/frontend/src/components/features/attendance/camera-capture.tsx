'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onDetection: (results: any) => void;
  loading?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onDetection,
  loading = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Clean up stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Effect to handle video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        video.play().then(() => {
          console.log('Video playing successfully');
          setIsVideoReady(true);
        }).catch(err => {
          console.error('Error playing video:', err);
          setCameraError('Failed to play video stream');
        });
      };

      video.oncanplay = () => {
        console.log('Video can play');
        setIsVideoReady(true);
      };

      video.onerror = (e) => {
        console.error('Video error:', e);
        setCameraError('Video stream error');
      };
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsVideoReady(false);
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      console.log('Requesting camera access...');
      
      // Request camera access with specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Use front camera
        },
        audio: false 
      });
      
      console.log('Camera access granted, stream:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setCameraError(`Camera access failed: ${err.message}`);
      
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please check if your device has a camera.');
      } else if (err.name === 'NotSupportedError') {
        setCameraError('Camera not supported in your browser.');
      } else {
        setCameraError('Unable to access camera. Please check permissions and try again.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      console.log('Stopping camera...');
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
      setIsCameraOn(false);
      setIsVideoReady(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current && isVideoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        console.log('Capturing image...');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64 image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Image captured successfully');
        setCapturedImage(imageData);
        onCapture(imageData);

        // Stop camera after successful capture
        stopCamera();
      } else {
        console.error('Video not ready for capture');
        setCameraError('Video not ready. Please try again.');
      }
    } else {
      console.error('Capture conditions not met:', {
        videoRef: !!videoRef.current,
        canvasRef: !!canvasRef.current,
        isVideoReady,
        videoWidth: videoRef.current?.videoWidth,
        videoHeight: videoRef.current?.videoHeight
      });
      setCameraError('Camera not ready for capture. Please wait and try again.');
    }
  }, [onCapture, isVideoReady]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setCameraError(null);
    startCamera();
  };

  const handleManualDetection = () => {
    if (capturedImage) {
      onDetection({ image: capturedImage });
    }
  };

  // Debug info
  const debugInfo = {
    isCameraOn,
    isVideoReady,
    stream: !!stream,
    videoRef: !!videoRef.current,
    capturedImage: !!capturedImage,
    videoWidth: videoRef.current?.videoWidth,
    videoHeight: videoRef.current?.videoHeight
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h3 className="text-xl font-semibold">Face Recognition Attendance</h3>
        <p className="text-gray-600">
          Capture your face to mark attendance automatically
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Camera Error Message */}
        {cameraError && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {cameraError}
            <div className="mt-2">
              <Button 
                onClick={startCamera} 
                variant="outline" 
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-200"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Camera Preview */}
        {!capturedImage && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video border-2 border-gray-300 min-h-[400px]">
              {isCameraOn ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isVideoReady ? 'block' : 'hidden'}`}
                  />
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                      <p>Initializing camera...</p>
                      <p className="text-sm text-gray-400 mt-2">Camera is starting up</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-lg font-medium">Camera is off</p>
                  <p className="text-sm mt-1">Click "Start Camera" to begin</p>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              {!isCameraOn ? (
                <Button 
                  onClick={startCamera} 
                  className="flex-1"
                  size="lg"
                >
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={captureImage} 
                    variant="primary" 
                    className="flex-1"
                    size="lg"
                    disabled={!isVideoReady}
                  >
                    {isVideoReady ? '📸 Capture Photo' : 'Initializing...'}
                  </Button>
                  <Button 
                    onClick={stopCamera} 
                    variant="outline" 
                    className="flex-1"
                    size="lg"
                  >
                    Stop Camera
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden aspect-video border-2 border-gray-300">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={retakePhoto} 
                variant="outline" 
                className="flex-1"
                size="lg"
              >
                🔄 Retake Photo
              </Button>
              <Button 
                onClick={handleManualDetection} 
                variant="primary" 
                className="flex-1"
                size="lg"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Mark Attendance'}
              </Button>
            </div>
          </div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Debug Information (remove in production) */}
        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Debug Info:</p>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Troubleshooting:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• If camera shows "Initializing..." but never loads, try refreshing the page</li>
            <li>• Make sure no other app is using the camera</li>
            <li>• Check browser permissions for camera access</li>
            <li>• Try a different browser (Chrome recommended)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};