export interface Student {
  id: string
  student_id: string
  name: string
  email?: string
  department?: string
  registration_date: string
  is_active: boolean
  created_at: string
  face_images_captured?: number
}

export interface StudentFormData {
  student_id: string
  name: string
  email?: string
  department?: string
  
}