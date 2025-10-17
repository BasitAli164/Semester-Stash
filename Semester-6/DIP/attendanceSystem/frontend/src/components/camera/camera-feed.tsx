'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraFeedProps {
  onCapture: (imageData: string) => void;
  isCapturing?: boolean;
  className?: string;
}

export function CameraFeed({ onCapture, isCapturing = false, className }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={className}>
      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
        {!isCameraActive ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Camera className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Camera Inactive</p>
            <p className="text-sm mt-2">Click start to activate camera</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Capture overlay */}
        {isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg" />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-center mt-6 space-x-4">
        {!isCameraActive ? (
          <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button 
              onClick={captureImage} 
              disabled={isCapturing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Circle className="w-4 h-4 mr-2" />
              {isCapturing ? 'Capturing...' : 'Capture Image'}
            </Button>
            <Button 
              onClick={stopCamera} 
              variant="outline"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Camera
            </Button>
          </>
        )}
      </div>
    </div>
  );
}