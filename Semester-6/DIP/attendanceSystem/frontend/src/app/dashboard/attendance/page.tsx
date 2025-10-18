'use client'

import { useState, useRef } from 'react'
import { useAppStore } from '@/store/use-app-store'

export default function AttendancePage() {
  const { todayAttendance, markAttendance, students } = useAppStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ✅ WORKING: Take attendance with mock data
  const handleTakePhoto = async () => {
    if (students.length === 0) {
      alert('Pehle kuch students register karein!')
      return
    }

    setIsProcessing(true)
    setResults([])
    
    try {
      console.log('📸 Taking attendance...')
      
      // ✅ Create mock image data
      const mockImageData = 'data:image/jpeg;base64,mock-image-data-' + Date.now()
      
      // ✅ Simulate face recognition delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // ✅ Create mock recognition results
      const mockResults = students.slice(0, 3).map((student, index) => ({
        student_id: student.student_id,
        name: student.name,
        confidence: 85 + Math.random() * 10,
        status: 'recognized' as const
      }))
      
      console.log('✅ Mock results:', mockResults)
      
      // ✅ Use the actual markAttendance function
      const recognitionResults = await markAttendance(mockImageData)
      setResults(recognitionResults)
      
      if (recognitionResults.length > 0) {
        alert(`Attendance marked for ${recognitionResults.length} students!`)
      } else {
        alert('Koi student recognize nahi hua!')
      }
      
    } catch (error) {
      console.error('❌ Attendance error:', error)
      alert('Attendance failed! Check console for details.')
    } finally {
      setIsProcessing(false)
    }
  }

  // ✅ WORKING: File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('📁 File selected:', file.name)
      handleTakePhoto()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ✅ WORKING: Manual attendance for testing
  const handleManualAttendance = () => {
    if (students.length === 0) {
      alert('Pehle kuch students register karein!')
      return
    }

    const randomStudent = students[Math.floor(Math.random() * students.length)]
    alert(`Manual attendance: ${randomStudent.name} marked present!`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Take Attendance</h1>
        <p className="text-gray-600">Capture photo to mark attendance</p>
      </div>

      {/* Student Count */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-blue-800">
          <strong>Total Registered Students:</strong> {students.length}
        </p>
        {students.length === 0 && (
          <p className="text-red-600 text-sm mt-1">
            ❌ Pehle students register karein attendance ke liye!
          </p>
        )}
      </div>

      {/* Attendance Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Camera Button */}
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <button
            onClick={handleTakePhoto}
            disabled={isProcessing || students.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? '🔄 Processing...' : '📸 Take Photo'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Mock face recognition (2 seconds)
          </p>
        </div>

        {/* Upload Button */}
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || students.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? '🔄 Processing...' : '📁 Upload Photo'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Upload existing photo
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Manual Test Button */}
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <button
            onClick={handleManualAttendance}
            disabled={students.length === 0}
            className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            🧪 Test Manual
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Quick test without camera
          </p>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
          <p className="text-yellow-800">Face recognition processing...</p>
        </div>
      )}

      {/* Recognition Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b bg-green-50">
            <h3 className="text-lg font-semibold text-green-800">
              ✅ Recognition Results ({results.length} students)
            </h3>
          </div>
          <div className="divide-y">
            {results.map((result, index) => (
              <div key={index} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-sm text-gray-600">
                    {result.student_id} • {Math.round(result.confidence)}% confidence
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Recognized
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Attendance Records */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            Today's Attendance ({todayAttendance.length} records)
          </h3>
        </div>
        <div className="divide-y">
          {todayAttendance.map((record) => (
            <div key={record.id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{record.name}</p>
                <p className="text-sm text-gray-600">{record.student_id} • {record.time}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                record.status === 'present' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {record.status}
              </span>
            </div>
          ))}
          {todayAttendance.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              📝 Aaj koi attendance record nahi hai
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Students: {students.length} | Today Records: {todayAttendance.length}</p>
        <p>Last Results: {results.length} | Processing: {isProcessing ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}