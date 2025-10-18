import { AttendanceStats, SystemStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  stats: AttendanceStats | null;
  systemStatus: SystemStatus | null;
}

export function StatsCards({ stats, systemStatus }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Students',
      value: systemStatus?.database.students_count || 0,
      icon: '👨‍🎓',
      color: 'blue',
    },
    {
      title: 'Present Today',
      value: stats?.present || 0,
      icon: '✅',
      color: 'green',
    },
    {
      title: 'Absent Today',
      value: stats?.absent || 0,
      icon: '❌',
      color: 'red',
    },
    {
      title: 'Attendance Rate',
      value: `${stats?.attendance_rate || 0}%`,
      icon: '📈',
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
      purple: 'bg-purple-50 text-purple-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}