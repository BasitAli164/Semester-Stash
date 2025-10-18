'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Take Attendance',
      description: 'Use camera to mark attendance',
      icon: '📷',
      action: () => router.push('/attendance'),
      color: 'blue',
    },
    {
      title: 'Register Student',
      description: 'Add new student to system',
      icon: '👨‍🎓',
      action: () => router.push('/students/register'),
      color: 'green',
    },
    {
      title: 'View Records',
      description: 'Check attendance history',
      icon: '📊',
      action: () => router.push('/records'),
      color: 'purple',
    },
    {
      title: 'Train Model',
      description: 'Update face recognition model',
      icon: '🤖',
      action: () => router.push('/system'),
      color: 'orange',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <span className="text-3xl mb-2">{action.icon}</span>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600 text-center">{action.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}