'use client';

import { useState, useCallback } from 'react';
import { AttendanceRecord, MarkAttendanceData, AttendanceStats } from '@/types/attendance';
import { attendanceApi } from '@/lib/api/attendance';

export function useAttendance() {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getToday();
      setTodayAttendance(response.attendance);
      return response.attendance;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch attendance';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAttendance = useCallback(async (data: MarkAttendanceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.markAttendance(data);
      
      // Refresh today's attendance after marking
      await fetchTodayAttendance();
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to mark attendance';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchTodayAttendance]);

  const getAttendanceStats = useCallback((): AttendanceStats => {
    const present = todayAttendance.filter(record => record.status === 'Present').length;
    const absent = todayAttendance.filter(record => record.status === 'Absent').length;
    const late = todayAttendance.filter(record => record.status === 'Late').length;
    const total = todayAttendance.length;

    return { present, absent, late, total };
  }, [todayAttendance]);

  return {
    todayAttendance,
    loading,
    error,
    fetchTodayAttendance,
    markAttendance,
    getAttendanceStats,
  };
}