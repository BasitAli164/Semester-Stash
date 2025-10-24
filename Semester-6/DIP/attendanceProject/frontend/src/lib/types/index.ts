export interface User {
  id: number
  name: string
  username: string
  email: string | null
  role: 'admin' | 'student'
  image_dir: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: number
  user_id: number
  user_name: string
  date: string
  time: string
  status: 'present' | 'absent' | 'late'
  confidence: number | null
  method: string
  location: string | null
  created_at: string
}

export interface Embedding {
  id: number
  user_id: number
  model_name: string
  embedding_shape: string
  distance_metric: string
  created_at: string
}

export interface AuthResponse {
  message: string
  access_token: string
  user: User
}

export interface ApiResponse<T = any> {
  message: string
  data?: T
  status: 'success' | 'error'
  status_code: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  pages: number
  current_page: number
  per_page: number
}

// Add the missing types that are used in stores
export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  name: string
  username: string
  password: string
  role: 'admin' | 'student'
  email?: string
  image_dir?: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

export interface UpdateProfileData {
  name?: string
  email?: string
  image_dir?: string
}

export interface AdminStats {
  total_users: number
  total_students: number
  total_admins: number
  active_users: number
}

export interface StudentStats {
  current_month: {
    total_days: number
    present_days: number
    absent_days: number
    attendance_rate: number
  }
  current_streak: number
  total_attendance: number
}

export interface AdminAttendanceStats {
  overview: {
    total_students: number
    attendance_today: number
    attendance_rate_today: number
  }
  monthly: {
    present: number
    absent: number
    late: number
  }
  last_7_days: Array<{
    date: string
    attendance_count: number
  }>
}

export interface StudentDashboardData {
  today_attendance: Attendance | null
  recent_attendance: Attendance[]
  monthly_stats: {
    present_days: number
    total_days: number
    attendance_rate: number
  }
  user: User
}

// Filter types
export interface UsersFilter {
  page?: number
  per_page?: number
  role?: 'admin' | 'student'
}

export interface AttendanceHistoryFilter {
  page?: number
  per_page?: number
  start_date?: string
  end_date?: string
}

export interface AttendanceReportsFilter {
  page?: number
  per_page?: number
  user_id?: number
  start_date?: string
  end_date?: string
  status?: 'present' | 'absent' | 'late'
}

// Face Recognition types
export interface FaceRecognitionResponse {
  message: string
  recognized: boolean
  user?: User
  confidence?: number
}

export interface FaceVerificationResponse {
  message: string
  verified: boolean
  confidence: number
}

export interface RegisterFacesData {
  user_id: number
  images: File[]
}

export interface RecognizeFaceData {
  image?: File
  image_data?: string
  threshold?: number
}

export interface VerifyFaceData {
  image?: File
  image_data?: string
  threshold?: number
}

export interface MarkAttendanceData {
  image_data?: string
  image?: File
  threshold?: number
}

export interface MarkManualAttendanceData {
  user_id: number
  date: string
  status: 'present' | 'absent' | 'late'
}