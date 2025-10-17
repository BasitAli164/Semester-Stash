import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const recentActivity = [
  {
    id: 1,
    name: 'John Doe',
    studentId: 'STU001',
    time: '09:15 AM',
    status: 'present' as const,
    avatar: 'JD'
  },
  {
    id: 2,
    name: 'Jane Smith',
    studentId: 'STU002',
    time: '09:16 AM',
    status: 'present' as const,
    avatar: 'JS'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    studentId: 'STU003',
    time: '09:20 AM',
    status: 'late' as const,
    avatar: 'MJ'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    studentId: 'STU004',
    time: '09:22 AM',
    status: 'present' as const,
    avatar: 'SW'
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{activity.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.studentId}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge 
                variant={
                  activity.status === 'present' ? 'default' :
                  activity.status === 'late' ? 'secondary' : 'destructive'
                }
                className={
                  activity.status === 'present' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                  activity.status === 'late' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''
                }
              >
                {activity.status}
              </Badge>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}