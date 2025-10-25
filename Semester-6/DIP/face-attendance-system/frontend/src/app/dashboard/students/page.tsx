'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudents } from '@/hooks/use-students';
import { useAuth } from '@/hooks/use-auth';
import { Student, UpdateStudentData } from '@/types/student';
import { Button } from '@/components/ui/button';
import { StudentList } from '@/components/features/students/student-list';
import { EditStudentModal } from '@/components/features/students/edit-student-modal';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function StudentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { students, loading, error, fetchStudents, updateStudent, deleteStudent } = useStudents();
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (studentId: number, data: UpdateStudentData) => {
    try {
      await updateStudent(studentId, data);
      // Modal will close automatically after successful update
    } catch (err) {
      console.error('Failed to update student:', err);
      // Error is handled in the hook and will be displayed
    }
  };

  const handleDelete = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(studentId);
      await deleteStudent(studentId);
    } catch (err) {
      console.error('Failed to delete student:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Student Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage student registrations and face data
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/students/register')}
            >
              Register New Student
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-blue-600">{students.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-green-600">
                  {students.filter(s => s.has_face_embedding).length}
                </p>
                <p className="text-sm text-gray-600">With Face Data</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-yellow-600">
                  {students.filter(s => !s.has_face_embedding).length}
                </p>
                <p className="text-sm text-gray-600">Pending Face Registration</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold text-purple-600">
                  {students.reduce((acc, student) => acc + student.image_paths.length, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Images</p>
              </CardContent>
            </Card>
          </div>

          {/* Student List */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Registered Students</h2>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                  {error}
                </div>
              )}
              
              <StudentList
                students={students}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Student Modal */}
      <EditStudentModal
        student={editingStudent}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdate={handleUpdate}
        loading={loading}
      />
    </div>
  );
}