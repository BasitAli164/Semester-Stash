export interface Student {
  id: number;
  name: string;
  student_id: string;
  class: string;
  registration_date: string;
  image_paths: string[];
  has_face_embedding: boolean;
}

export interface CreateStudentData {
  name: string;
  student_id: string;
  class: string;
  images: File[];
}

export interface UpdateStudentData {
  name?: string;
  class?: string;
  student_id?: string; // Add this for completeness
}

export interface StudentsResponse {
  students: Student[];
  count: number;
}

export interface StudentResponse {
  student: Student;
}