export interface Student {
  id: number;
  name: string;
  student_id: string;
  class: string;
  registration_date: string;
  image_paths: string[];
  has_face_embedding: boolean;
}

export interface StudentFormData {
  name: string;
  student_id: string;
  class: string;
  images: File[];
}

export interface StudentsResponse {
  students: Student[];
  count: number;
}