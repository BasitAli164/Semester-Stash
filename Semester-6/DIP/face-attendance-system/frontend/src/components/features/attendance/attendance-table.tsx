'use client';

import { AttendanceRecord } from '@/types/attendance';
import { Card, CardContent } from '@/components/ui/card';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  loading?: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
          <p className="text-gray-500">No attendance has been marked for today.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-3">
      {records.map((record, index) => (
        <Card key={record.id || index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-semibold text-gray-900">{record.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">ID:</span> {record.student_id}
                  </div>
                  <div>
                    <span className="font-medium">Class:</span> {record.class || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {formatTime(record.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};