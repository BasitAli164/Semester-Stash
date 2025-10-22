'use client';

import { useEffect } from 'react';
import { useCamera } from '@/hooks/use-camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RotateCcw, CheckCircle } from 'lucide-react';

interface FaceCameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function FaceCamera({ 
  onCapture, 
  onClose, 
  title = "Face Capture",
  description = "Position your face in the frame and capture image"
}: FaceCameraProps) {
  const {
    isCameraOn,
    capturedImage,
    error,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    retakeImage,
  } = useCamera();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const imageData = captureImage();
    if (imageData) {
      onCapture(imageData);
    }
  };

  const handleRetake = () => {
    retakeImage();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-6 w-6" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex justify-center gap-4">
          {!capturedImage ? (
            <>
              <Button onClick={handleCapture} disabled={!isCameraOn}>
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleConfirm}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
              <Button variant="outline" onClick={handleRetake}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}