'use client'
import { useEffect } from 'react'
import { useStore } from '../../store'
import { StatsCard } from '../../components/ui/StatsCard'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { Button } from '../../components/ui/Button'
import { useRouter } from 'next/navigation'

// Icons for stats cards
const UserIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const CheckIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ChartIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const FaceIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function DashboardPage() {
  const { 
    studentStats, 
    attendanceStats, 
    fetchStudentStats, 
    fetchAttendanceStats,
    studentsLoading 
  } = useStore()
  
  const router = useRouter()

  useEffect(() => {
    fetchStudentStats()
    fetchAttendanceStats()
  }, [fetchStudentStats, fetchAttendanceStats])

  if (studentsLoading && (!studentStats || !attendanceStats)) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Register Student',
      description: 'Add new student with face enrollment',
      icon: UserIcon,
      action: () => router.push('/students/register'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Mark Attendance',
      description: 'Start face recognition attendance',
      icon: CheckIcon,
      action: () => router.push('/attendance'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'View Reports',
      description: 'Check attendance analytics',
      icon: ChartIcon,
      action: () => router.push('/reports'),
      color: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to Facial Attendance System
          </p>
        </div>
        <Button 
          onClick={() => router.push('/attendance')}
          className="mt-4 sm:mt-0"
        >
          <CheckIcon className="w-5 h-5 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={studentStats?.total_students || 0}
          subtitle="Registered in system"
          icon={UserIcon}
        />
        <StatsCard
          title="Active Students"
          value={studentStats?.active_students || 0}
          subtitle="Currently active"
          icon={CheckIcon}
        />
        <StatsCard
          title="With Face Data"
          value={studentStats?.students_with_faces || 0}
          subtitle="Face embeddings stored"
          icon={FaceIcon}
        />
        <StatsCard
          title="Today's Attendance"
          value={attendanceStats?.overview?.attendance_today || 0}
          subtitle={`${attendanceStats?.overview?.attendance_rate_today || 0}% rate`}
          icon={ChartIcon}
        />
      </div>

      {/* Quick Actions */}
      <div className="futuristic-card p-6">
        <h2 className="text-2xl font-bold text-gradient mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="group p-6 rounded-xl bg-gradient-to-r hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl text-left"
              style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                  <p className="text-white/80 text-sm">{action.description}</p>
                </div>
                <svg className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="futuristic-card p-6">
          <h3 className="text-xl font-bold text-gradient mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {attendanceStats?.last_7_days?.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(day.date).toLocaleDateString()}
                </span>
                <span className="font-semibold text-primary-500">
                  {day.attendance_count} attendance
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="futuristic-card p-6">
          <h3 className="text-xl font-bold text-gradient mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Face Recognition</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Camera Service</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}