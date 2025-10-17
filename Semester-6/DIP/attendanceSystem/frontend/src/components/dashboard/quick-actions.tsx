import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Camera, BarChart3, Settings } from 'lucide-react'

const actions = [
  {
    title: 'Register Student',
    description: 'Add new student with face data',
    icon: Users,
    href: '/dashboard/students',
    variant: 'default' as const
  },
  {
    title: 'Take Attendance',
    description: 'Start facial recognition',
    icon: Camera,
    href: '/dashboard/attendance',
    variant: 'default' as const
  },
  {
    title: 'View Reports',
    description: 'Attendance analytics',
    icon: BarChart3,
    href: '/dashboard/reports',
    variant: 'outline' as const
  },
  {
    title: 'System Settings',
    description: 'Train model & settings',
    icon: Settings,
    href: '/dashboard/system',
    variant: 'outline' as const
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto flex-col gap-2 p-4"
              asChild
            >
              <a href={action.href}>
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}