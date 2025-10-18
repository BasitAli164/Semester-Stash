'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/store';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function Dashboard() {
  const { 
    attendanceStats, 
    systemStatus, 
    fetchAttendance, 
    fetchSystemStatus 
  } = useAppStore();

  useEffect(() => {
    fetchAttendance();
    fetchSystemStatus();
  }, [fetchAttendance, fetchSystemStatus]);

  return (
    <div className="space-y-6">
      <StatsCards stats={attendanceStats} systemStatus={systemStatus} />
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <SystemStatus systemStatus={systemStatus} />
      </div>
    </div>
  );
}