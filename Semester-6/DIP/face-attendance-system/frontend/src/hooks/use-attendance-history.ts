'use client';

import { useState, useCallback } from 'react';
import { AttendanceRecord, AttendanceHistoryResponse, AttendanceStatsResponse } from '@/types/attendance';
import { attendanceApi } from '@/lib/api/attendance';

export interface HistoryFilters {
  start_date?: string;
  end_date?: string;
  student_id?: string;
  class?: string;
  status?: string;
}

export function useAttendanceHistory() {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceHistory = useCallback(async (filters: HistoryFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getHistory(filters);
      setAttendanceHistory(response.attendance);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch attendance history';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendanceStats = useCallback(async (filters: { start_date?: string; end_date?: string } = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getStats(filters);
      setStats(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch attendance stats';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToCSV = useCallback((data: AttendanceRecord[] = attendanceHistory) => {
    const headers = ['Date', 'Time', 'Student ID', 'Name', 'Class', 'Status'];
    const csvData = data.map(record => {
      const date = new Date(record.timestamp);
      return [
        date.toISOString().split('T')[0],
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        record.student_id,
        record.name,
        record.class,
        record.status
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [attendanceHistory]);

  return {
    attendanceHistory,
    stats,
    loading,
    error,
    fetchAttendanceHistory,
    fetchAttendanceStats,
    exportToCSV,
  };
}