'use client';

import { useRouter } from 'next/navigation';
import { useStudents } from '@/hooks/use-students';
import { CreateStudentData } from '@/types/student';
import { StudentForm } from '@/components/features/students/student-form';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function RegisterStudentPage() {
  const router = useRouter();
  const { createStudent, loading } = useStudents();
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (studentData: CreateStudentData) => {
    try {
      setSubmitError('');
      await createStudent(studentData);
      // Only redirect if successful
      router.push('/dashboard/students');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to register student');
      // Don't redirect on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/students')}
            className="mb-4"
          >
            ← Back to Students
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Register New Student</h1>
          <p className="text-gray-600 mt-2">
            Register a new student with face images for attendance tracking
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {submitError}
          </div>
        )}

        <StudentForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}