'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useAdminStore } from '@/lib/store'
import { Loader2, Users, UserCheck, Clock, TrendingUp } from 'lucide-react'

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth()
  const { stats, getStats, isLoading } = useAdminStore()

  useEffect(() => {
    if (isAdmin) {
      getStats()
    }
  }, [isAdmin, getStats])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {user?.name}!
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass dark:glass-dark p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total_users}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass dark:glass-dark p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Students
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total_students}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="glass dark:glass-dark p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Admins
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total_admins}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="glass dark:glass-dark p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.active_users}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass dark:glass-dark p-6 rounded-2xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left">
            <Users className="h-8 w-8 text-gray-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Manage Users</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add, edit, or remove users
            </p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left">
            <Clock className="h-8 w-8 text-gray-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">View Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Check attendance reports
            </p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left">
            <UserCheck className="h-8 w-8 text-gray-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Face Registration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Register student faces
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}