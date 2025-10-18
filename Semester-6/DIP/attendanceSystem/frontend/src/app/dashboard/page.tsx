'use client'

import { useAppStore } from '@/store/use-app-store'

export default function DashboardPage() {
  const { students, todayAttendance, attendanceStats } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Attendance system overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{students.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Present Today</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {todayAttendance.filter(a => a.status === 'present').length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {attendanceStats?.attendance_rate || 0}%
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <a href="/dashboard/attendance" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Take Attendance
          </a>
          <a href="/dashboard/students" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Add Student
          </a>
        </div>
      </div>
    </div>
  )
}