'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StudentDetails } from '@/components/students/StudentDetails';
import { CaptureFacesModal } from '@/components/students/CaptureFacesModal';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  
  const { 
    currentStudent, 
    studentsLoading,
    fetchStudent 
  } = useAppStore();

  useEffect(() => {
    if (studentId) {
      fetchStudent(studentId);
    }
  }, [studentId, fetchStudent]);

  if (studentsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❓</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Not Found</h2>
        <p className="text-gray-600 mb-6">The requested student could not be found.</p>
        <Button onClick={() => router.push('/students')}>
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push('/students')}
            className="mb-4"
          >
            ← Back to Students
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
          <p className="text-gray-600 mt-1">
            Manage student information and face data
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowCaptureModal(true)}
          >
            Capture Face Images
          </Button>
        </div>
      </div>

      {/* Student Details */}
      <StudentDetails student={currentStudent} />

      {/* Capture Faces Modal */}
      {showCaptureModal && (
        <CaptureFacesModal
          student={currentStudent}
          onClose={() => setShowCaptureModal(false)}
          onSuccess={() => {
            setShowCaptureModal(false);
            fetchStudent(studentId);
          }}
        />
      )}
    </div>
  );
}