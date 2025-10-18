'use client';

import { Student } from '@/types';
import { Button } from '@/components/ui/button';

interface StudentsTableProps {
  students: Student[];
  loading: boolean;
  error: string | null;
  onEditStudent: (student: Student) => void;
  onViewDetails: (student: Student) => void;
}

export function StudentsTable({
  students,
  loading,
  error,
  onEditStudent,
  onViewDetails
}: StudentsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">👨‍🎓</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
        <p className="text-gray-500 mb-4">
          {students.length === 0 ? 'No students have been registered yet.' : 'No students match your search criteria.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Student</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Department</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Face Images</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.student_id} className="hover:bg-gray-50">
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <code className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {student.student_id}
                </code>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-gray-700">{student.department}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${
                    student.face_images_captured >= 5 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {student.face_images_captured} / 5
                  </span>
                  {student.face_images_captured < 5 && (
                    <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                      Need more
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(student)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditStudent(student)}
                  >
                    Edit
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}