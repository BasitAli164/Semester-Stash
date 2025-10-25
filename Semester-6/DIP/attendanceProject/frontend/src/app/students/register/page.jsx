'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '../../../store'
import { StudentForm } from '../../../components/students/StudentForm'
import { FaceEnrollment } from '../../../components/students/FaceEnrollment'
import { Button } from '../../../components/ui/Button'

export default function RegisterStudentPage() {
  const { registerStudent, addStudentFaces } = useStore()
  const router = useRouter()
  const [currentStudent, setCurrentStudent] = useState(null)
  const [showFaceEnrollment, setShowFaceEnrollment] = useState(false)
  const [step, setStep] = useState('form') // 'form' or 'faces'

  const handleSubmit = async (formData) => {
    const result = await registerStudent(formData)
    
    if (result.success) {
      setCurrentStudent(result.data.student)
      setStep('faces')
      setShowFaceEnrollment(true)
    }
  }

  const handleFaceEnrollmentComplete = async (studentId, formData) => {
    await addStudentFaces(studentId, formData)
    router.push('/students')
  }

  const handleSkipFaceEnrollment = () => {
    router.push('/students')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            {step === 'form' ? 'Register Student' : 'Face Enrollment'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 'form' 
              ? 'Add new student to the system' 
              : 'Capture face images for recognition'
            }
          </p>
        </div>
        
        {step === 'faces' && (
          <Button variant="secondary" onClick={handleSkipFaceEnrollment}>
            Skip Face Enrollment
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center max-w-md mx-auto">
        <div className="flex items-center w-full">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'form' 
                ? 'bg-primary-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {step === 'form' ? '1' : '✓'}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step === 'form' ? 'text-primary-500' : 'text-green-500'
            }`}>
              Basic Info
            </span>
          </div>
          
          {/* Connector */}
          <div className={`flex-1 h-1 mx-4 ${
            step === 'faces' ? 'bg-green-500' : 'bg-gray-600'
          }`}></div>
          
          {/* Step 2 */}
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'faces' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-600 text-gray-400'
            }`}>
              2
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step === 'faces' ? 'text-primary-500' : 'text-gray-500'
            }`}>
              Face Capture
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="futuristic-card p-6">
        {step === 'form' ? (
          <StudentForm
            onSubmit={handleSubmit}
            loading={useStore(state => state.studentsLoading)}
          />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Student Registered Successfully!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {currentStudent?.name} has been added to the system.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => setShowFaceEnrollment(true)}>
                Start Face Enrollment
              </Button>
              <Button variant="secondary" onClick={handleSkipFaceEnrollment}>
                Complete Registration
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Face Enrollment Modal */}
      {currentStudent && (
        <FaceEnrollment
          studentId={currentStudent.id}
          onComplete={handleFaceEnrollmentComplete}
          isOpen={showFaceEnrollment}
          onClose={() => setShowFaceEnrollment(false)}
        />
      )}
    </div>
  )
}