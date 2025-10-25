'use client';

import { AttendanceStats } from '@/types/attendance';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  stats: AttendanceStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total',
      value: stats.total,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '👥',
    },
    {
      title: 'Present',
      value: stats.present,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅',
    },
    {
      title: 'Absent',
      value: stats.absent,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '❌',
    },
    {
      title: 'Late',
      value: stats.late,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: '⏰',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm text-gray-600">{card.title}</p>
              </div>
              <div className={`text-2xl ${card.bgColor} p-3 rounded-full`}>
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};