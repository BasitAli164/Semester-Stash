'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCheck, 
  Camera,
  BarChart3,
  Settings,
  X
} from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Attendance Reports', href: '/admin/attendance', icon: Calendar },
  { name: 'Face Registration', href: '/admin/face-registration', icon: Camera },
  { name: 'Statistics', href: '/admin/statistics', icon: BarChart3 },
]

const studentNavigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Mark Attendance', href: '/student/attendance', icon: UserCheck },
  { name: 'Attendance History', href: '/student/history', icon: Calendar },
  { name: 'Profile', href: '/student/profile', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { isAdmin } = useAuth()

  const navigation = isAdmin ? adminNavigation : studentNavigation

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isAdmin ? 'Admin Panel' : 'Student Portal'}
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-200
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive 
                    ? 'text-primary-500' 
                    : 'text-gray-400 group-hover:text-gray-500'
                  }
                `} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {isAdmin ? 'Administrator' : 'Student'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {isAdmin ? 'Full access' : 'Limited access'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}