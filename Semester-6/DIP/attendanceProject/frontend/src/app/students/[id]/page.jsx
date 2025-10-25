'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '../../../store'
import { Button } from '../../../components/ui/Button'
import { FaceEnrollment } from '../../../components/students/FaceEnrollment'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { StatsCard } from '../../../components/ui/StatsCard'

const UserIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const CheckIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const FaceIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { 
    currentStudent, 
    fetchStudent, 
    studentsLoading,
    toggleStudentActive,
    addStudentFaces 
  } = useStore()
  
  const [showFaceEnrollment, setShowFaceEnrollment] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchStudent(params.id)
    }
  }, [params.id, fetchStudent])

  const handleToggleActive = async () => {
    await toggleStudentActive(params.id)
  }

  const handleFaceEnrollmentComplete = async (studentId, formData) => {
    await addStudentFaces(studentId, formData)
    setShowFaceEnrollment(false)
    fetchStudent(params.id) // Refresh student data
  }

  if (studentsLoading || !currentStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">{currentStudent.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Student Profile</p>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            variant="secondary"
            onClick={() => setShowFaceEnrollment(true)}
          >
            <FaceIcon className="w-5 h-5 mr-2" />
            Add Face Data
          </Button>
          <Button
            variant={currentStudent.is_active ? "danger" : "secondary"}
            onClick={handleToggleActive}
          >
            {currentStudent.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Status"
          value={currentStudent.is_active ? "Active" : "Inactive"}
          subtitle="Account status"
          icon={CheckIcon}
        />
        <StatsCard
          title="Face Embeddings"
          value={currentStudent.embedding_count || 0}
          subtitle="Stored face data"
          icon={FaceIcon}
        />
        <StatsCard
          title="Student ID"
          value={currentStudent.student_id || "Not Set"}
          subtitle="Identification number"
          icon={UserIcon}
        />
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="futuristic-card p-6">
          <h3 className="text-xl font-bold text-gradient mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
              <p className="text-white">{currentStudent.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Username</label>
              <p className="text-white">{currentStudent.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-white">{currentStudent.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Student ID</label>
              <p className="text-white">{currentStudent.student_id || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="futuristic-card p-6">
          <h3 className="text-xl font-bold text-gradient mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration Date</label>
              <p className="text-white">
                {new Date(currentStudent.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
              <p className="text-white">
                {new Date(currentStudent.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Face Recognition</label>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentStudent.embedding_count > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-white">
                  {currentStudent.embedding_count > 0 ? 'Ready' : 'Needs Enrollment'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Face Enrollment Modal */}
      <FaceEnrollment
        studentId={currentStudent.id}
        onComplete={handleFaceEnrollmentComplete}
        isOpen={showFaceEnrollment}
        onClose={() => setShowFaceEnrollment(false)}
      />
    </div>
  )
}