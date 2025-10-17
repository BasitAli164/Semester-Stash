'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, UserPlus, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudentForm } from '@/components/forms/student-form';
import { CameraFeed } from '@/components/camera/camera-feed';
import { studentService } from '@/services/api.service';
import { useAppStore } from '@/store/app.store';
import Link from 'next/link';

export default function RegisterStudentPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const { addNotification, refreshData } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'form' | 'camera'>('form');
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(studentId);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleStudentRegistered = (studentId: string) => {
    setCurrentStudentId(studentId);
    setActiveTab('camera');
  };

  const handleCaptureImage = async (imageData: string) => {
    if (!currentStudentId) {
      addNotification('Please register student first');
      return;
    }

    setIsCapturing(true);
    try {
      const response = await studentService.captureFaces(currentStudentId, imageData);
      if (response.success) {
        addNotification(`Face captured successfully! (${response.images_captured} total)`);
        await refreshData();
      } else {
        addNotification(response.message || 'Failed to capture face');
      }
    } catch (error) {
      addNotification('Error capturing face image');
      console.error('Capture error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/students">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {currentStudentId ? 'Add Face Data' : 'Register Student'}
          </h1>
          <p className="text-slate-600">
            {currentStudentId 
              ? 'Capture face images for recognition' 
              : 'Create new student profile'
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-slate-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'form' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('form')}
          className={activeTab === 'form' ? 'bg-white shadow-sm' : ''}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Student Info
        </Button>
        <Button
          variant={activeTab === 'camera' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('camera')}
          disabled={!currentStudentId}
          className={activeTab === 'camera' ? 'bg-white shadow-sm' : ''}
        >
          <Camera className="w-4 h-4 mr-2" />
          Face Capture
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student Form */}
        {activeTab === 'form' && (
          <div className="lg:col-span-2">
            <StudentForm onSuccess={() => handleStudentRegistered} />
          </div>
        )}

        {/* Camera Feed */}
        {activeTab === 'camera' && currentStudentId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Face Capture</CardTitle>
              </CardHeader>
              <CardContent>
                <CameraFeed 
                  onCapture={handleCaptureImage}
                  isCapturing={isCapturing}
                />
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Capture Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure good lighting on the face</li>
                    <li>• Look directly at the camera</li>
                    <li>• Capture different angles and expressions</li>
                    <li>• Aim for 20+ images for best recognition</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Student ID</label>
                    <p className="text-lg font-semibold text-slate-900">{currentStudentId}</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      ✅ Student registered successfully! Now capture face images to enable facial recognition.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}