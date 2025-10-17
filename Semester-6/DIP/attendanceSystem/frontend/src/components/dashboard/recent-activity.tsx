'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Clock } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { Skeleton } from '@/components/ui/skeleton'

export function RecentActivity() {
  const { todayAttendance, fetchTodayAttendance, isAttendanceLoading } = useAppStore()

  useEffect(() => {
    fetchTodayAttendance()
  }, [fetchTodayAttendance])

  const getStatusBadge = (status: string) => {
    const variants = {
      present: { 
        class: 'bg-green-100 text-green-800 hover:bg-green-100', 
        label: 'Present' 
      },
      late: { 
        class: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100', 
        label: 'Late' 
      },
      absent: { 
        class: 'bg-red-100 text-red-800 hover:bg-red-100', 
        label: 'Absent' 
      }
    }
    
    const variant = variants[status as keyof typeof variants] || variants.present
    return (
      <Badge variant="secondary" className={variant.class}>
        {variant.label}
      </Badge>
    )
  }

  const getAvatarFallback = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleRefresh = () => {
    fetchTodayAttendance()
  }

  if (isAttendanceLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Attendance</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isAttendanceLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isAttendanceLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayAttendance.length > 0 ? (
          todayAttendance.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getAvatarFallback(activity.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.student_id}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getStatusBadge(activity.status)}
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">No attendance records for today</p>
            <p className="text-sm text-muted-foreground mt-1">
              Attendance records will appear here once marked
            </p>
          </div>
        )}
        
        {/* Summary */}
        {todayAttendance.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {todayAttendance.length} records today
              </span>
              <span className="font-medium">
                Present: {todayAttendance.filter(a => a.status === 'present').length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}