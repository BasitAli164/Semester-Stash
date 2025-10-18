'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StudentsTable } from '@/components/students/StudentsTable';
import { StudentFormModal } from '@/components/students/StudentFormModal';

export default function StudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    students, 
    studentsLoading, 
    studentsError,
    fetchStudents,
    deleteStudent 
  } = useAppStore();

  useEffect(() => {
    fetchStudents(true);
  }, [fetchStudents]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setShowFormModal(true);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowFormModal(true);
  };

  const handleDeleteStudent = (student: any) => {
    setDeletingStudent(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingStudent) {
      setIsDeleting(true);
      const success = await deleteStudent(deletingStudent.student_id);
      setIsDeleting(false);
      
      if (success) {
        setShowDeleteModal(false);
        setDeletingStudent(null);
        // Refresh the students list
        fetchStudents(true);
      } else {
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingStudent(null);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingStudent(null);
    fetchStudents(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">
            Manage student registrations and face data
          </p>
        </div>
        <Button onClick={handleAddStudent} className="whitespace-nowrap">
          Add New Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ready for Training</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.face_images_captured >= 5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Need More Images</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.face_images_captured < 5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search students by name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="whitespace-nowrap">
                Filter
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="whitespace-nowrap"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Students ({filteredStudents.length})
          </h2>
        </CardHeader>
        <CardContent>
          <StudentsTable
            students={filteredStudents}
            loading={studentsLoading}
            error={studentsError}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onViewDetails={(student) => router.push(`/students/${student.student_id}`)}
          />
        </CardContent>
      </Card>

      {/* Student Form Modal */}
      {showFormModal && (
        <StudentFormModal
          student={editingStudent}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingStudent && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Student</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deletingStudent.name}</strong> ({deletingStudent.student_id})? 
                This action cannot be undone and will remove all associated data.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  loading={isDeleting}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}