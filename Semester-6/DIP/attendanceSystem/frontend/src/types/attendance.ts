export interface AttendanceRecord {
  id: string
  student_id: string
  name: string
  date: string
  time: string
  status: 'present' | 'absent' | 'late'
  notes?: string
  created_at: string
}

export interface AttendanceStats {
  total_students: number
  present_today: number
  absent_today: number
  late_today: number
  attendance_rate: number
  weekly_trend: number
}

export interface FaceRecognitionResult {
  student_id: string
  name: string
  confidence: number
  status: 'recognized' | 'unknown'
  bounding_box?: {
    x: number
    y: number
    width: number
    height: number
  }
}