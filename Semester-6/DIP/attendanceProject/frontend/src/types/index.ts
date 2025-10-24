export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  image_dir: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  user_id: number;
  user_name: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  confidence: number;
  method: string;
  location?: string;
  created_at: string;
}

export interface Student extends User {
  embedding_count: number;
  last_attendance?: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  status_code: number;
  error_code?: string;
  details?: any;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterStudentData {
  name: string;
  username: string;
  password: string;
  email?: string;
  role: 'student';
}