'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/store';
import { CameraInterface } from '@/components/attendance/CameraInterface';
import { RecognitionResults } from '@/components/attendance/RecognitionResults';
import { StudentDetailsModal } from '@/components/attendance/StudentDetailsModal';
import { UnknownFaceModal } from '@/components/attendance/UnknownFaceModal';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AttendancePage() {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showUnknownModal, setShowUnknownModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const { 
    recognitionResults, 
    attendanceStats,
    fetchAttendanceStats 
  } = useAppStore();

  useEffect(() => {
    fetchAttendanceStats();
  }, [fetchAttendanceStats]);

  const handleFaceRecognized = (student: any) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleUnknownFace = () => {
    setShowUnknownModal(true);
  };

  const recognizedCount = recognitionResults.filter(r => r.status === 'recognized' && r.attendance_marked).length;
  const unknownCount = recognitionResults.filter(r => r.status === 'unknown').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Today's Summary</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Present</span>
              <span className="text-2xl font-bold text-green-600">
                {attendanceStats?.present || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Absent</span>
              <span className="text-2xl font-bold text-red-600">
                {attendanceStats?.absent || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Attendance Rate</span>
              <span className="text-2xl font-bold text-blue-600">
                {attendanceStats?.attendance_rate || 0}%
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Recognized (Now)</span>
                <span className="font-semibold text-green-600">{recognizedCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Unknown (Now)</span>
                <span className="font-semibold text-yellow-600">{unknownCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Interface */}
        <div className="lg:col-span-2">
          <CameraInterface 
            onFaceRecognized={handleFaceRecognized}
            onUnknownFace={handleUnknownFace}
          />
        </div>
      </div>

      {/* Recognition Results */}
      <RecognitionResults results={recognitionResults} />

      {/* Modals */}
      {showStudentModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setShowStudentModal(false)}
        />
      )}

      {showUnknownModal && (
        <UnknownFaceModal
          onClose={() => setShowUnknownModal(false)}
          onRegister={() => {
            setShowUnknownModal(false);
            window.location.href = '/students/register';
          }}
        />
      )}
    </div>
  );
}