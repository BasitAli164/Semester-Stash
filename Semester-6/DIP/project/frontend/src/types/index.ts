export interface User {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'student';
  created_at: string;
}

export interface Student {
  id: number;
  user_id: number;
  enrollment_id: string;
  image_dir: string;
  is_active: boolean;
  created_at: string;
  user?: User;
}

export interface Attendance {
  id: number;
  student_id: number;
  date: string;
  time: string;
  status: string;
  confidence: number;
  created_at: string;
  student_name?: string;
  enrollment_id?: string;
}

export interface AttendanceReport {
  id: number;
  student_id: number;
  date: string;
  time: string;
  status: string;
  confidence: number;
  student_name: string;
  enrollment_id: string;
}

export interface DashboardStats {
  total_students: number;
  today_attendance: number;
  week_attendance: number;
  recent_registrations: number;
  attendance_rate: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SystemStatus {
  database: string;
  storage: Record<string, string>;
  system_info: {
    total_students: number;
    total_embeddings: number;
    total_attendance_records: number;
  };
  server_time: string;
}