'use client'
import { useState, useEffect } from 'react'
import { useStore } from '../../store'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { LoadingSpinner } from '../common/LoadingSpinner'

export function StudentList({ onViewStudent, onRegisterStudent }) {
  const { students, studentsLoading, fetchStudents, toggleStudentActive } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchStudents({ page: currentPage, per_page: itemsPerPage, search: searchTerm })
  }, [currentPage, searchTerm, fetchStudents])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleToggleActive = async (studentId) => {
    await toggleStudentActive(studentId)
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.student_id && student.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search students by name, username, or ID..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Button onClick={onRegisterStudent}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </Button>
      </div>

      {/* Students Table */}
      <div className="futuristic-card p-6">
        {studentsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Student</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Student ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Face Data</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary-500">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{student.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{student.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-600 dark:text-gray-400">{student.student_id || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            student.embedding_count > 0 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {student.embedding_count > 0 ? `${student.embedding_count} embeddings` : 'No data'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.is_active 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewStudent(student.id)}
                          >
                            View
                          </Button>
                          <Button
                            variant={student.is_active ? "danger" : "secondary"}
                            size="sm"
                            onClick={() => handleToggleActive(student.id)}
                          >
                            {student.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">No students found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first student'}
                </p>
                <Button onClick={onRegisterStudent}>
                  Add Student
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}