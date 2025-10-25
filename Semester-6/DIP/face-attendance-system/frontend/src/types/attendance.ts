export interface AttendanceRecord {
  id?: number;
  student_id: string;
  name: string;
  class: string;
  timestamp: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface TodayAttendanceResponse {
  attendance: AttendanceRecord[];
  count: number;
}

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

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface MarkAttendanceData {
  student_id: string;
  name: string;
  class: string;
  status?: 'Present' | 'Absent' | 'Late';
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