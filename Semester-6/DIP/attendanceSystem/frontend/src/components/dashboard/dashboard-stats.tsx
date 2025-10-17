import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: 'Total Students',
    value: '1,234',
    icon: Users,
    description: '+12% from last month',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    title: 'Present Today',
    value: '892',
    icon: CheckCircle,
    description: '+5% from yesterday',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    title: 'Absent Today',
    value: '56',
    icon: XCircle,
    description: '-2% from yesterday',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    title: 'Attendance Rate',
    value: '94.1%',
    icon: TrendingUp,
    description: '+3.2% from last week',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
]

export function DashboardStats() {
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