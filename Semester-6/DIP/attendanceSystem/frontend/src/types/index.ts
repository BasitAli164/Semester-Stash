export interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  department: string;
  registration_date: string;
  is_active: boolean;
  created_at: string;
  face_images_captured: number;
}

export interface AttendanceRecord {
  id: number;
  student_id: string;
  name: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  created_at: string;
}

export interface AttendanceStats {
  total_students: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  attendance_rate: number;
  weekly_trend: number;
}

export interface FaceRecognitionResult {
  student_id: string;
  name: string;
  confidence: number;
  status: 'recognized' | 'unknown';
  bounding_box?: number[];
  attendance_marked?: boolean;
  attendance_message?: string;
  attendance_time?: string;
}

export interface SystemStatus {
  training: any;
  storage: any;
  attendance: {
    model_ready: boolean;
  };
  database: {
    students_count: number;
  };
  system: {
    min_images_for_training: number;
    recognition_confidence_threshold: number;
  };
}

export interface TrainingStatus {
  total_students: number;
  ready_students: number;
  not_ready_students: number;
  total_images: number;
  model_trained: boolean;
  can_train: boolean;
  min_images_required: number;
}