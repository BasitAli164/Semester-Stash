'use client'

import { useEffect, useState } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  Target,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'
import { useStudentStore } from '@/lib/store'
import { StudentStatsCard } from '@/components/dashboard/student-stats-card'
import { MarkAttendanceButton } from '@/components/face-recognition/mark-attendance-button'

export default function StudentDashboardPage() {
  const { dashboardData, getDashboard, isLoading } = useStudentStore()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await getDashboard()
      } catch (error: any) {
        toast.error('Failed to load dashboard data')
      }
    }

    loadDashboardData()
  }, [getDashboard])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const todayAttendance = dashboardData?.today_attendance
  const monthlyStats = dashboardData?.monthly_stats
  const recentAttendance = dashboardData?.recent_attendance || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {dashboardData?.user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your attendance overview for today
          </p>
        </div>
        <MarkAttendanceButton />
      </div>

      {/* Today's Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Today's Attendance Status
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className={`text-lg font-semibold mt-2 ${
              todayAttendance 
                ? 'text-green-600' 
                : 'text-yellow-600'
            }`}>
              {todayAttendance 
                ? `✅ Attendance marked at ${new Date(`2000-01-01T${todayAttendance.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : '⏳ Attendance not marked yet'
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Method</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {todayAttendance?.method === 'face_recognition' ? 'Face Recognition' : 'Manual'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StudentStatsCard
          title="Monthly Rate"
          value={`${monthlyStats?.attendance_rate?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          description="Current month"
        />
        <StudentStatsCard
          title="Present Days"
          value={monthlyStats?.present_days || 0}
          icon={Calendar}
          description="This month"
        />
        <StudentStatsCard
          title="Total Days"
          value={monthlyStats?.total_days || 0}
          icon={Clock}
          description="This month"
        />
        <StudentStatsCard
          title="Current Streak"
          value={recentAttendance.filter(att => att.status === 'present').length || 0}
          icon={Target}
          description="Consecutive days"
        />
      </div>

      {/* Recent Attendance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Attendance
        </h3>
        <div className="space-y-3">
          {recentAttendance.length > 0 ? (
            recentAttendance.map((attendance, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    attendance.status === 'present' ? 'bg-green-500' : 
                    attendance.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(attendance.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {attendance.time ? new Date(`2000-01-01T${attendance.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not marked'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    attendance.status === 'present' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : attendance.status === 'absent'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                  }`}>
                    {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                  </span>
                  {attendance.confidence && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {attendance.confidence > 0 ? `Confidence: ${(attendance.confidence * 100).toFixed(1)}%` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No attendance records found
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
          <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
            Need to mark attendance?
          </h4>
          <p className="text-primary-700 dark:text-primary-300 text-sm mb-4">
            Use the face recognition system to mark your attendance quickly and securely.
          </p>
          <MarkAttendanceButton variant="secondary" />
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            View full history
          </h4>
          <p className="text-green-700 dark:text-green-300 text-sm">
            Check your complete attendance history and download reports.
          </p>
        </div>
      </div>
    </div>
  )
}