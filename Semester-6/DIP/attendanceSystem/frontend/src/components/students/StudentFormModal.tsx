'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Student, StudentFormData } from '@/types';
import { useAppStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudentFormModalProps {
  student?: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

type CaptureMode = 'camera' | 'upload' | null;
type CaptureStep = 'form' | 'capture' | 'review';

export function StudentFormModal({ student, onClose, onSuccess }: StudentFormModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    student_id: '',
    name: '',
    email: '',
    department: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>(null);
  const [captureStep, setCaptureStep] = useState<CaptureStep>('form');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { registerStudent, updateStudent } = useAppStore();

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id,
        name: student.name,
        email: student.email || '',
        department: student.department || '',
        phone: student.phone || ''
      });
    }
  }, [student]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions and try again.');
      setCaptureMode(null);
      setCaptureStep('form');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImages(prev => [...prev, imageData]);
        
        // Show success feedback
        setIsCapturing(true);
        setTimeout(() => setIsCapturing(false), 500);
      }
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number, type: 'captured' | 'uploaded') => {
    if (type === 'captured') {
      setCapturedImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required';
    }

    // Validate that we have at least one face image
    const totalImages = capturedImages.length + uploadedImages.length;
    if (totalImages === 0) {
      newErrors.images = 'At least one face image is required for face recognition';
    } else if (totalImages < 3) {
      newErrors.images = 'For better recognition, capture 3-5 face images from different angles';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        images: [...capturedImages, ...uploadedImages]
      };

      const success = student 
        ? await updateStudent(student.student_id, submitData)
        : await registerStudent(submitData);

      if (success) {
        onSuccess();
      } else {
        alert('Failed to save student. Please try again.');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const startImageCapture = (mode: 'camera' | 'upload') => {
    setCaptureMode(mode);
    setCaptureStep('capture');
    
    if (mode === 'camera') {
      startCamera();
    }
  };

  const finishImageCapture = () => {
    if (captureMode === 'camera') {
      stopCamera();
    }
    setCaptureMode(null);
    setCaptureStep('form');
  };

  const totalImages = capturedImages.length + uploadedImages.length;
  const isEditing = !!student;

  if (captureStep === 'capture') {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">
              {captureMode === 'camera' ? 'Capture Face Images' : 'Upload Face Images'}
            </h2>
            <button 
              onClick={finishImageCapture}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {captureMode === 'camera' ? (
              <div className="space-y-4">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Capture feedback */}
                  {isCapturing && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-2xl font-bold">✓ Captured!</div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    type="button"
                    onClick={captureImage}
                    disabled={isCapturing}
                  >
                    📸 Capture Image
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={finishImageCapture}
                  >
                    Finish ({capturedImages.length} captured)
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>• Capture 3-5 images from different angles</p>
                  <p>• Ensure good lighting and clear face visibility</p>
                  <p>• Remove glasses or hats if possible</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    <div className="text-4xl">📁</div>
                    <p className="text-lg font-medium">Upload Face Images</p>
                    <p className="text-gray-600">Select 3-5 clear face images</p>
                    
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={finishImageCapture}
                  >
                    Finish ({uploadedImages.length} uploaded)
                  </Button>
                </div>
              </div>
            )}

            {/* Preview captured/uploaded images */}
            {(capturedImages.length > 0 || uploadedImages.length > 0) && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Captured Images:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {capturedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        onClick={() => removeImage(index, 'captured')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        onClick={() => removeImage(index, 'uploaded')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Student' : 'Register New Student'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student_id">Student ID *</Label>
              <Input
                id="student_id"
                value={formData.student_id}
                onChange={(e) => handleChange('student_id', e.target.value)}
                error={errors.student_id}
                disabled={isEditing}
                placeholder="e.g., 20230001"
              />
            </div>

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="e.g., john.doe@university.edu"
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                error={errors.department}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g., +1234567890"
              />
            </div>
          </div>

          {/* Face Image Capture Section */}
          <div className="border-t pt-6">
            <Label className="block text-lg font-semibold mb-4">
              Face Images for Recognition *
            </Label>
            
            {errors.images && (
              <p className="text-red-500 text-sm mb-4">{errors.images}</p>
            )}

            {/* Capture Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => startImageCapture('camera')}
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="font-medium">Capture with Camera</p>
                <p className="text-sm text-gray-600">Use your webcam to capture live images</p>
              </div>

              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => startImageCapture('upload')}
              >
                <div className="text-4xl mb-2">📁</div>
                <p className="font-medium">Upload from Device</p>
                <p className="text-sm text-gray-600">Select images from your computer</p>
              </div>
            </div>

            {/* Image Preview */}
            {(capturedImages.length > 0 || uploadedImages.length > 0) && (
              <div className="space-y-3">
                <p className="font-medium">
                  Captured Images ({totalImages}/5 recommended)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {capturedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(index, 'captured')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(index, 'uploaded')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Registering...' 
                : isEditing 
                  ? 'Update Student' 
                  : 'Register Student'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}