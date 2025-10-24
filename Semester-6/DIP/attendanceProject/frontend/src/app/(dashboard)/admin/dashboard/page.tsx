'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminStore } from '@/lib/store'
import { useAttendanceStore } from '@/lib/store'
import { AdminStatsCard } from '@/components/dashboard/admin-stats-card'

export default function AdminDashboardPage() {
  const { stats, getStats, isLoading: adminLoading } = useAdminStore()
  const { adminStats, getAdminStats, isLoading: attendanceLoading } = useAttendanceStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([getStats(), getAdminStats()])
      } catch (error: any) {
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [getStats, getAdminStats])

  if (isLoading || adminLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your attendance system
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          description="All registered users"
        />
        <AdminStatsCard
          title="Students"
          value={stats?.total_students || 0}
          icon={UserCheck}
          trend={{ value: 8, isPositive: true }}
          description="Active students"
        />
        <AdminStatsCard
          title="Today's Attendance"
          value={adminStats?.overview.attendance_today || 0}
          icon={Calendar}
          trend={{ value: 15, isPositive: true }}
          description="Marked today"
        />
        <AdminStatsCard
          title="Attendance Rate"
          value={`${adminStats?.overview.attendance_rate_today?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          trend={{ value: 5.2, isPositive: true }}
          description="Today's rate"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Attendance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Attendance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
              <span className="font-semibold text-green-600">
                {adminStats?.monthly.present || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
              <span className="font-semibold text-red-600">
                {adminStats?.monthly.absent || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Late</span>
              <span className="font-semibold text-yellow-600">
                {adminStats?.monthly.late || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {adminStats?.last_7_days?.slice(-3).map((day, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(day.date).toLocaleDateString()}
                </span>
                <span className="font-semibold text-primary-600">
                  {day.attendance_count} attendance
                </span>
              </div>
            )) || (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity data
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-200 text-left">
            <Users className="h-6 w-6 text-primary-600 mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Manage Users</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add or modify users
            </p>
          </button>
          
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 text-left">
            <Calendar className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white">View Reports</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Attendance analytics
            </p>
          </button>
          
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 text-left">
            <UserCheck className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Mark Manual</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manual attendance
            </p>
          </button>
          
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 text-left">
            <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Statistics</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View insights
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}