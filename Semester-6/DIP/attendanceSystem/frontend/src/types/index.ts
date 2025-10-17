export interface Student {
  student_id: string;
  name: string;
  email?: string;
  department?: string;
  phone?: string;
  registration_date: string;
  face_images_count: number;
  attendance_stats?: {
    total_days: number;
    present_days: number;
    attendance_rate: number;
  };
}

export interface AttendanceRecord {
  student_id: string;
  name: string;
  time: string;
  status: string;
  notes?: string;
  department?: string;
  email?: string;
  date?: string;
}

export interface AttendanceReport {
  attendance: AttendanceRecord[];
  absent_students: any[];
  stats: AttendanceStats;
  date: string;
  total_records: number;
}

export interface AttendanceStats {
  date: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  attendance_rate: number;
  on_time: number;
}

export interface FaceRecognitionResult {
  student_id: string;
  name: string;
  confidence: number;
  bounding_box: number[];
  status: 'recognized' | 'unknown';
  raw_confidence: number;
  attendance_marked?: boolean;
  attendance_message?: string;
  attendance_time?: string;
}

export interface SystemStatus {
  training: {
    total_students: number;
    ready_students: number;
    not_ready_students: number;
    total_images: number;
    model_trained: boolean;
    can_train: boolean;
    min_images_required: number;
  };
  storage: {
    total_images: number;
    total_size_mb: number;
    students_with_faces: number;
    model_size_mb: number;
  };
  attendance: {
    model_ready: boolean;
  };
  database: {
    students_count: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  results?: T;            
  students?: T;
  report?: T;
  stats?: T;
  status?: T;
  storage?: T;
  logs?: T;
  images_captured?: number; 
  marked_count?: number;
}