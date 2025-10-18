import { SystemStatus as SystemStatusType } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SystemStatusProps {
  systemStatus: SystemStatusType | null;
}

export function SystemStatus({ systemStatus }: SystemStatusProps) {
  const statusItems = [
    {
      label: 'Face Recognition Model',
      status: systemStatus?.attendance.model_ready ? 'Ready' : 'Not Trained',
      color: systemStatus?.attendance.model_ready ? 'green' : 'yellow',
    },
    {
      label: 'Database',
      status: 'Connected',
      color: 'green',
    },
    {
      label: 'Students Ready for Training',
      value: `${systemStatus?.training.ready_students || 0}/${systemStatus?.training.total_students || 0}`,
      color: systemStatus?.training.ready_students || 0 > 0 ? 'green' : 'yellow',
    },
    {
      label: 'Storage Usage',
      value: `${systemStatus?.storage.total_size_mb || 0} MB`,
      color: 'blue',
    },
  ];

  const getStatusColor = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.color)}`}>
                {item.value || item.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}