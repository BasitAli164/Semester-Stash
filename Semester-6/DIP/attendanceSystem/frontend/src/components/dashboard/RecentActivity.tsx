'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function RecentActivity() {
  const { attendanceRecords, fetchAttendance } = useAppStore();

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const recentRecords = attendanceRecords.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Recent Attendance</h2>
      </CardHeader>
      <CardContent>
        {recentRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No attendance records yet</p>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    record.status === 'present' ? 'bg-green-500' : 
                    record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{record.name}</p>
                    <p className="text-sm text-gray-500">{record.student_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{record.time}</p>
                  <p className="text-xs text-gray-500 capitalize">{record.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}