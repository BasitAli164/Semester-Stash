'use client'
import { useEffect } from 'react'
import { useStore } from '../../store'
import { AttendanceCamera } from '../../components/attendance/AttendanceCamera'
import { StatsCard } from '../../components/ui/StatsCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

const CheckIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UserIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const ChartIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

export default function AttendancePage() {
  const { 
    attendanceStats, 
    todayAttendance,
    fetchAttendanceStats, 
    fetchTodayAttendance,
    clearRecognitionResult 
  } = useStore()

  useEffect(() => {
    fetchAttendanceStats()
    fetchTodayAttendance()
    
    // Clear previous recognition results when page loads
    clearRecognitionResult()
  }, [fetchAttendanceStats, fetchTodayAttendance, clearRecognitionResult])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Mark attendance using face recognition
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Attendance"
          value={attendanceStats?.overview?.attendance_today || 0}
          subtitle={`${attendanceStats?.overview?.attendance_rate_today || 0}% of students`}
          icon={CheckIcon}
        />
        <StatsCard
          title="Total Students"
          value={attendanceStats?.overview?.total_students || 0}
          subtitle="Registered in system"
          icon={UserIcon}
        />
        <StatsCard
          title="Monthly Rate"
          value={`${Math.round(
            ((attendanceStats?.monthly?.present || 0) / 
            ((attendanceStats?.monthly?.present || 0) + (attendanceStats?.monthly?.absent || 0)) * 100) || 0
          )}%`}
          subtitle="Current month"
          icon={ChartIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Section - 2/3 width */}
        <div className="lg:col-span-2">
          <AttendanceCamera />
        </div>

        {/* Today's Attendance Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Today's Attendance List */}
          <div className="futuristic-card p-6">
            <h3 className="text-xl font-bold text-gradient mb-4">Today's Attendance</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayAttendance.length > 0 ? (
                todayAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-500">
                          {record.user_name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{record.user_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {record.time && new Date(`2000-01-01T${record.time}`).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'present' 
                        ? 'bg-green-500/20 text-green-500' 
                        : record.status === 'late'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No attendance marked today
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="futuristic-card p-6">
            <h3 className="text-xl font-bold text-gradient mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Present Today</span>
                <span className="font-semibold text-green-500">
                  {todayAttendance.filter(a => a.status === 'present').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Late Today</span>
                <span className="font-semibold text-yellow-500">
                  {todayAttendance.filter(a => a.status === 'late').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Absent Today</span>
                <span className="font-semibold text-red-500">
                  {todayAttendance.filter(a => a.status === 'absent').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}