'use client';

import { useRouter } from 'next/navigation';
import { useStudents } from '@/hooks/use-students';
import { StudentFormData } from '@/types/student';
import { StudentForm } from '@/components/features/students/student-form';
import { Card, CardContent } from '@/components/ui/card';

export default function RegisterStudentPage() {
  const router = useRouter();
  const { registerStudent, isLoading, error } = useStudents();

  const handleSubmit = async (formData: StudentFormData) => {
    await registerStudent(formData);
    // Redirect back to students list on success
    router.push('/dashboard/students');
  };

  const handleCancel = () => {
    router.push('/dashboard/students');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register New Student</h1>
        <p className="text-gray-600">
          Add a new student to the face recognition system
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Form */}
      <StudentForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}