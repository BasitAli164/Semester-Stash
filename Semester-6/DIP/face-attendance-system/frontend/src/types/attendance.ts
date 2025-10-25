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