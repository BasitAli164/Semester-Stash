import { AttendanceStats as AttendanceStatsType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface AttendanceStatsProps {
  stats: AttendanceStatsType | null;
  viewMode: 'daily' | 'range';
  dateRange: { start: string; end: string };
}

export function AttendanceStats({ stats, viewMode, dateRange }: AttendanceStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: '👨‍🎓',
      color: 'blue',
      description: 'Registered students'
    },
    {
      title: 'Present',
      value: stats.present,
      icon: '✅',
      color: 'green',
      description: `${((stats.present / stats.total_students) * 100).toFixed(1)}% attendance`
    },
    {
      title: 'Absent',
      value: stats.absent,
      icon: '❌',
      color: 'red',
      description: `${((stats.absent / stats.total_students) * 100).toFixed(1)}% absent`
    },
    {
      title: 'Late',
      value: stats.late,
      icon: '⏰',
      color: 'yellow',
      description: `${((stats.late / stats.total_students) * 100).toFixed(1)}% late`
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
      yellow: 'bg-yellow-50 text-yellow-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
            
            {/* Overall attendance rate */}
            {card.title === 'Present' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Overall Attendance Rate</span>
                  <span className="font-medium text-gray-900">{stats.attendance_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.attendance_rate}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}