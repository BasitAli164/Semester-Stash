export { api, handleApiResponse, handleApiError } from './axios-config'
export { authService } from './auth'
export { adminService } from './admin'
export { studentService } from './student'
export { attendanceService } from './attendance'
export { faceRecognitionService } from './face-recognition'

// Export types from the main types file
export type {
  LoginData,
  RegisterData,
  ChangePasswordData,
  UpdateProfileData,
  AdminStats,
  UsersFilter,
  StudentStats,
  AttendanceHistoryFilter,
  StudentDashboardData,
  MarkAttendanceData,
  MarkManualAttendanceData,
  AttendanceReportsFilter,
  AdminAttendanceStats,
  RegisterFacesData,
  RecognizeFaceData,
  VerifyFaceData,
  FaceRecognitionResponse,
  FaceVerificationResponse,
} from '@/lib/types'