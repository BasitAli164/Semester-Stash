import { apiClient } from './client';
import { AttendanceRecord, TodayAttendanceResponse, MarkAttendanceData, AttendanceStats } from '@/types/attendance';

export interface AttendanceHistoryResponse {
  attendance: AttendanceRecord[];
  count: number;
  filters: {
    start_date?: string;
    end_date?: string;
    student_id?: string;
    class?: string;
    status?: string;
  };
}

export interface AttendanceRangeResponse {
  attendance: AttendanceRecord[];
  count: number;
  start_date: string;
  end_date: string;
}

export interface StudentAttendanceResponse {
  student_id: string;
  attendance: Array<{
    timestamp: string;
    status: string;
  }>;
  days: number;
  count: number;
}

export interface AttendanceStatsResponse {
  stats: Record<string, number>;
  percentages: Record<string, number>;
  total: number;
  date_range: {
    start_date?: string;
    end_date?: string;
  };
}

export const attendanceApi = {
  async getToday(): Promise<TodayAttendanceResponse> {
    const response = await apiClient.get<TodayAttendanceResponse>('/attendance/today');
    return response.data;
  },

  async markAttendance(data: MarkAttendanceData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/attendance/mark', data);
    return response.data;
  },

  async getHistory(params?: {
    start_date?: string;
    end_date?: string;
    student_id?: string;
    class?: string;
    status?: string;
  }): Promise<AttendanceHistoryResponse> {
    const response = await apiClient.get<AttendanceHistoryResponse>('/attendance/history', {
      params
    });
    return response.data;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<AttendanceRangeResponse> {
    const response = await apiClient.get<AttendanceRangeResponse>(
      `/attendance/range?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  },

  async getStudentAttendance(studentId: string, days: number = 30): Promise<StudentAttendanceResponse> {
    const response = await apiClient.get<StudentAttendanceResponse>(
      `/attendance/student/${studentId}?days=${days}`
    );
    return response.data;
  },

  async getStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AttendanceStatsResponse> {
    const response = await apiClient.get<AttendanceStatsResponse>('/attendance/stats', {
      params
    });
    return response.data;
  },
};