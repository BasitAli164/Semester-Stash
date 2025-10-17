'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, XCircle, TrendingUp, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardStats() {
  const { attendanceStats, fetchAttendanceStats, isAttendanceLoading } = useAppStore()

  useEffect(() => {
    fetchAttendanceStats()
  }, [fetchAttendanceStats])

  const stats = [
    {
      title: 'Total Students',
      value: attendanceStats?.total_students?.toString() || '0',
      icon: Users,
      description: 'Registered in system',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Present Today',
      value: attendanceStats?.present_today?.toString() || '0',
      icon: CheckCircle,
      description: 'Marked present today',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Absent Today',
      value: attendanceStats?.absent_today?.toString() || '0',
      icon: XCircle,
      description: 'Not marked present',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Attendance Rate',
      value: attendanceStats?.attendance_rate ? `${attendanceStats.attendance_rate}%` : '0%',
      icon: TrendingUp,
      description: 'Overall attendance rate',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
  ]

  if (isAttendanceLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}