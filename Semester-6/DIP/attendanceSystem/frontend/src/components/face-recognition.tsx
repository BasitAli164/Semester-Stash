'use client';

import { useState, useRef } from 'react';
import { useAttendanceStore } from '@/store/attendanceStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Scan, CheckCircle, XCircle, Upload } from 'lucide-react';

export function FaceRecognition() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    recognitionResults, 
    loading, 
    recognizeFaces, 
    markAttendance 
  } = useAttendanceStore();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecognizeFaces = async () => {
    if (!image) return;
    await recognizeFaces(image);
  };

  const handleMarkAttendance = async () => {
    const recognizedFaces = recognitionResults.filter(r => r.status === 'recognized');
    if (recognizedFaces.length > 0) {
      await markAttendance(recognizedFaces);
    }
  };

  const recognizedFaces = recognitionResults.filter(r => r.status === 'recognized');
  const unknownFaces = recognitionResults.filter(r => r.status === 'unknown');

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Upload Image for Recognition</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10"
              disabled={loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Image
            </Button>

            {image && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-white/10">
                  <img 
                    src={image} 
                    alt="Uploaded for recognition" 
                    className="w-full h-64 object-cover"
                  />
                </div>
                
                <Button
                  onClick={handleRecognizeFaces}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Scan className="h-4 w-4 mr-2" />
                  {loading ? 'Recognizing...' : 'Recognize Faces'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recognition Results */}
      {recognitionResults.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white">
          <CardHeader>
            <CardTitle>Recognition Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recognized Faces */}
              {recognizedFaces.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-400 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Recognized Students ({recognizedFaces.length})
                  </h4>
                  <div className="space-y-2">
                    {recognizedFaces.map((face, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                        <div>
                          <div className="font-medium">{face.name}</div>
                          <div className="text-sm text-gray-400">ID: {face.student_id}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-400">{face.confidence}%</div>
                          <div className="text-sm text-gray-400">Confidence</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unknown Faces */}
              {unknownFaces.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-400 mb-3 flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    Unknown Faces ({unknownFaces.length})
                  </h4>
                  <div className="space-y-2">
                    {unknownFaces.map((face, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                        <div className="font-medium">Unknown Person</div>
                        <div className="text-right">
                          <div className="font-medium text-red-400">{face.confidence}%</div>
                          <div className="text-sm text-gray-400">Confidence</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mark Attendance Button */}
              {recognizedFaces.length > 0 && (
                <Button
                  onClick={handleMarkAttendance}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {loading ? 'Marking Attendance...' : `Mark Attendance for ${recognizedFaces.length} Students`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}