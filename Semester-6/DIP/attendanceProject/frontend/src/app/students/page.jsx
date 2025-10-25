'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentList } from '../../components/students/StudentList'

export default function StudentsPage() {
  const router = useRouter()

  const handleViewStudent = (studentId) => {
    router.push(`/students/${studentId}`)
  }

  const handleRegisterStudent = () => {
    router.push('/students/register')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student accounts and face enrollments
          </p>
        </div>
      </div>

      {/* Student List */}
      <StudentList
        onViewStudent={handleViewStudent}
        onRegisterStudent={handleRegisterStudent}
      />
    </div>
  )
}