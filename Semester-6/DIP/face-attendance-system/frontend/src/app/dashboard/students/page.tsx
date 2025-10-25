'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudents } from '@/hooks/use-students';
import { useAuth } from '@/hooks/use-auth';
import { Student } from '@/types/student';
import { StudentList } from '@/components/features/students/student-list';
import { ConnectivityStatus } from '@/components/features/connectivity-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function StudentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    students, 
    isLoading, 
    error, 
    fetchStudents, 
    deleteStudent 
  } = useStudents();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleEdit = (student: Student) => {
    // We'll implement edit functionality later
    console.log('Edit student:', student);
  };

  const handleDeleteClick = (student: Student) => {
    setShowDeleteConfirm(student);
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteStudent(showDeleteConfirm.id);
        setShowDeleteConfirm(null);
      } catch (error) {
        // Error handled in the hook
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const handleRetry = () => {
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">
            Manage registered students and their face recognition data
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/students/register')}
          variant="primary"
        >
          Register New Student
        </Button>
      </div>

      {/* Connectivity Status */}
      <ConnectivityStatus />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.has_face_embedding).length}
            </div>
            <div className="text-sm text-gray-600">With Face Data</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {students.filter(s => !s.has_face_embedding).length}
            </div>
            <div className="text-sm text-gray-600">Pending Registration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {students.reduce((acc, s) => acc + s.image_paths.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Images</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student List */}
      <StudentList
        students={students}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete student <strong>{showDeleteConfirm.name}</strong>? 
                This action cannot be undone and will remove all associated face recognition data.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDeleteConfirm}
                  isLoading={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}