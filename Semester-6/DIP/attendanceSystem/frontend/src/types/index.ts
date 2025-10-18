// types/index.ts

// Student Types
export interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  department: string;
  phone?: string;
  registration_date: string;
  is_active: boolean;
  created_at: string;
  face_images_captured: number;
  attendance_stats?: AttendanceStats;
}

export interface StudentFormData {
  student_id: string;
  name: string;
  email?: string;
  department?: string;
  phone?: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: number;
  student_id: string;
  name: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  created_at: string;
  department?: string;
  email?: string;
}

export interface AttendanceReport {
  attendance: AttendanceRecord[];
  absent_students: AbsentStudent[];
  stats: AttendanceStats;
  date: string;
  total_records: number;
}

export interface AbsentStudent {
  student_id: string;
  name: string;
  department: string;
  status: 'absent';
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

// Face Recognition Types
export interface FaceRecognitionResult {
  student_id: string;
  name: string;
  confidence: number;
  status: 'recognized' | 'unknown';
  bounding_box: number[];
  raw_confidence?: number;
  attendance_marked?: boolean;
  attendance_message?: string;
  attendance_time?: string;
}

export interface RecognitionResponse {
  success: boolean;
  message: string;
  results: FaceRecognitionResult[];
}

export interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  marked_count: number;
  detailed_results: FaceRecognitionResult[];
}

// System Types
export interface SystemStatus {
  training: TrainingStatus;
  storage: StorageStats;
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
  ready_students_details: Record<string, StudentTrainingStatus>;
  not_ready_students_details: Record<string, StudentTrainingStatus>;
  min_images_required: number;
  can_train: boolean;
  error?: string;
}

export interface StudentTrainingStatus {
  name: string;
  image_count: number;
  status: 'ready' | 'not_ready';
  needed?: number;
}

export interface StorageStats {
  total_images: number;
  total_size_bytes: number;
  total_size_mb: number;
  students_with_faces: number;
  model_size_bytes: number;
  model_size_mb: number;
}

export interface TrainingResponse {
  success: boolean;
  message: string;
  stats?: {
    total_images: number;
    total_students: number;
    students_trained: [string, string][];
    model_type: string;
    timestamp: string;
  };
}

export interface HealthCheck {
  success: boolean;
  status: string;
  timestamp: string;
  components: {
    database: string;
    file_system: string;
    face_model: string;
  };
}

// API Response Types - FIXED: Added message property to all responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface StudentsResponse {
  success: boolean;
  message: string; // Added this
  students: Student[];
  count?: number;
}

export interface StudentResponse {
  success: boolean;
  message: string; // Added this
  student: Student;
}

export interface AttendanceResponse {
  success: boolean;
  message: string; // Added this
  report: AttendanceReport;
}

export interface CaptureFacesResponse {
  success: boolean;
  message: string;
  images_captured: number;
}

export interface DeleteFacesResponse {
  success: boolean;
  message: string;
}

export interface StudentStatsResponse {
  success: boolean;
  message: string;
  stats: any;
}

export interface AttendanceStatsResponse {
  success: boolean;
  message: string;
  stats: any;
}

export interface AttendanceRangeResponse {
  success: boolean;
  message: string;
  report: any;
}

export interface ModelStatusResponse {
  success: boolean;
  message: string;
  model_ready: boolean;
}

export interface SystemStatusResponse {
  success: boolean;
  message: string;
  status: SystemStatus;
}

export interface TrainingStatusResponse {
  success: boolean;
  message: string;
  status: TrainingStatus;
}

export interface ValidateTrainingResponse {
  success: boolean;
  message: string;
  can_train: boolean;
  issues: string[];
}

export interface StorageResponse {
  success: boolean;
  message: string;
  storage: StorageStats;
}

export interface LogsResponse {
  success: boolean;
  message: string;
  logs: any[];
}

export interface CleanupResponse {
  success: boolean;
  message: string;
}

// UI State Types
export interface AppState {
  // Students
  students: Student[];
  currentStudent: Student | null;
  studentsLoading: boolean;
  studentsError: string | null;
  
  // Attendance
  attendanceRecords: AttendanceRecord[];
  attendanceStats: AttendanceStats | null;
  recognitionResults: FaceRecognitionResult[];
  isMarkingAttendance: boolean;
  attendanceLoading: boolean;
  
  // System
  systemStatus: SystemStatus | null;
  isTraining: boolean;
  trainingStatus: TrainingStatus | null;
  storageStats: StorageStats | null;
  systemLoading: boolean;
  
  // UI
  activeTab: 'dashboard' | 'attendance' | 'students' | 'records' | 'system';
  cameraActive: boolean;
  modal: {
    type: 'studentDetails' | 'unknownFace' | 'training' | null;
    data: any;
  };
}

// Form Types
export interface CaptureFacesData {
  image: string; // base64
}

export interface MarkAttendanceData {
  recognized_faces: FaceRecognitionResult[];
}

export interface ManualAttendanceData {
  student_id: string;
  status?: string;
  notes?: string;
}