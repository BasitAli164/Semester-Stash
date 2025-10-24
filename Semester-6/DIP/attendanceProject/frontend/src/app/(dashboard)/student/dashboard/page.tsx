'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useStudentStore } from '@/lib/store'
import { Loader2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const { dashboardData, getDashboard, isLoading } = useStudentStore()

  useEffect(() => {
    getDashboard()
  }, [getDashboard])

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const { today_attendance, monthly_stats, recent_attendance } = dashboardData

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Student Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {user?.name}!
        </p>
      </div>

      {/* Today's Attendance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass dark:glass-dark p-6 rounded-2xl lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Today's Attendance
          </h2>
          {today_attendance ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Present
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Marked at {new Date(today_attendance.time).toLocaleTimeString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Not Marked
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Attendance not marked for today
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          )}
        </div>

        {/* Monthly Stats */}
        <div className="glass dark:glass-dark p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            This Month
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Present:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {monthly_stats.present_days}/{monthly_stats.total_days}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Rate:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {monthly_stats.attendance_rate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="glass dark:glass-dark p-6 rounded-2xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Attendance
        </h2>
        <div className="space-y-3">
          {recent_attendance.length > 0 ? (
            recent_attendance.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(attendance.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {attendance.time && new Date(attendance.time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    attendance.status === 'present'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : attendance.status === 'absent'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No attendance records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}