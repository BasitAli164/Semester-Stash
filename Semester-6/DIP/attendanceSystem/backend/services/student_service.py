# my code
import os
import sys

# Add the backend directory to Python path
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, current_dir)

from models.database import DatabaseManager
from utils.file_manager import FileManager
from utils.image_processor import ImageProcessor


class StudentService:
    """Handles student-related business logic"""
    
    def __init__(self):
        self.db = DatabaseManager()
        self.file_manager = FileManager()
        self.image_processor = ImageProcessor()
    
    def register_student(self, student_data: Dict) -> Tuple[bool, str]:
        """Register a new student"""
        student_id = student_data.get('student_id', '').strip()
        name = student_data.get('name', '').strip()
        email = student_data.get('email', '').strip() or None
        department = student_data.get('department', '').strip() or None
        phone = student_data.get('phone', '').strip() or None
        
        # Validation
        if not student_id:
            return False, "Student ID is required"
        
        if not name:
            return False, "Student name is required"
        
        if len(student_id) > 20:
            return False, "Student ID must be 20 characters or less"
        
        if len(name) > 100:
            return False, "Student name must be 100 characters or less"
        
        # Check if student ID contains only alphanumeric characters
        if not student_id.replace('_', '').replace('-', '').isalnum():
            return False, "Student ID can only contain letters, numbers, hyphens, and underscores"
        
        return self.db.add_student(student_id, name, email, department, phone)
    
    def capture_face_images(self, student_id: str, image_data: str) -> Tuple[bool, str, int]:
        """Capture and save face images for a student"""
        try:
            # Validate student exists
            student = self.db.get_student(student_id)
            if not student:
                return False, "Student not found", 0
            
            # Validate image size
            if not self.image_processor.validate_image_size(image_data):
                return False, "Image size too large. Maximum size is 5MB.", 0
            
            # Convert base64 to image
            image = self.image_processor.base64_to_image(image_data)
            
            # Enhance image quality
            enhanced_image = self.image_processor.enhance_image_quality(image)
            
            # Detect faces
            face_images, face_coords = self.image_processor.detect_faces(enhanced_image)
            
            if not face_images:
                return False, "No faces detected in the image. Please ensure face is clearly visible.", 0
            
            # Check if we have too many faces (likely error)
            if len(face_images) > 5:
                return False, f"Too many faces detected ({len(face_images)}). Please ensure only one person is in the frame.", 0
            
            # Save face images
            current_count = self.file_manager.count_student_images(student_id)
            saved_count = 0
            
            for i, face_img in enumerate(face_images):
                success, message = self.file_manager.save_face_image(
                    student_id, face_img, current_count + i + 1
                )
                if success:
                    saved_count += 1
            
            if saved_count == 0:
                return False, "Failed to save any face images", 0
            
            return True, f"Successfully captured {saved_count} face image(s)", saved_count
            
        except ValueError as e:
            return False, str(e), 0
        except Exception as e:
            return False, f"Error capturing faces: {str(e)}", 0
    
    def get_student_info(self, student_id: str) -> Optional[Dict]:
        """Get complete student information"""
        student = self.db.get_student(student_id)
        if not student:
            return None
        
        # Add additional information
        student_dict = dict(student)
        student_dict['face_images_count'] = self.file_manager.count_student_images(student_id)
        student_dict['attendance_history'] = self.db.get_attendance_history(student_id)
        
        # Calculate attendance statistics
        attendance_history = student_dict['attendance_history']
        total_days = len(attendance_history)
        present_days = len([a for a in attendance_history if a['status'] == 'present'])
        
        student_dict['attendance_stats'] = {
            'total_days': total_days,
            'present_days': present_days,
            'attendance_rate': round((present_days / total_days) * 100, 2) if total_days > 0 else 0
        }
        
        return student_dict
    
    def get_all_students(self, include_stats: bool = False) -> List[Dict]:
        """Get all students with optional statistics"""
        students = self.db.get_all_students()
        
        for student in students:
            student['face_images_count'] = self.file_manager.count_student_images(student['student_id'])
            
            if include_stats:
                attendance_history = self.db.get_attendance_history(student['student_id'], days=30)
                present_count = len([a for a in attendance_history if a['status'] == 'present'])
                student['recent_attendance_rate'] = round((present_count / 30) * 100, 2) if attendance_history else 0
        
        return students
    
    def update_student(self, student_id: str, update_data: Dict) -> Tuple[bool, str]:
        """Update student information"""
        allowed_fields = {'name', 'email', 'department', 'phone', 'is_active'}
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields and v is not None}
        
        if not filtered_data:
            return False, "No valid fields to update"
        
        return self.db.update_student(student_id, **filtered_data)
    
    def delete_student_faces(self, student_id: str) -> Tuple[bool, str]:
        """Delete all face images for a student"""
        try:
            student = self.db.get_student(student_id)
            if not student:
                return False, "Student not found"
            
            success = self.file_manager.cleanup_student_data(student_id)
            if success:
                return True, f"All face images for {student['name']} have been deleted"
            else:
                return False, "Failed to delete face images"
                
        except Exception as e:
            return False, f"Error deleting face images: {str(e)}"
    
    def get_student_stats(self) -> Dict:
        """Get overall student statistics"""
        total_students = self.db.get_students_count()
        students_with_faces = 0
        total_face_images = 0
        
        all_students = self.db.get_all_students()
        for student in all_students:
            face_count = self.file_manager.count_student_images(student['student_id'])
            if face_count > 0:
                students_with_faces += 1
                total_face_images += face_count
        
        return {
            'total_students': total_students,
            'students_with_faces': students_with_faces,
            'students_without_faces': total_students - students_with_faces,
            'total_face_images': total_face_images,
            'avg_images_per_student': round(total_face_images / students_with_faces, 2) if students_with_faces > 0 else 0,
            'coverage_rate': round((students_with_faces / total_students) * 100, 2) if total_students > 0 else 0
        }


# your code:
from typing import List, Dict, Tuple, Optional

class StudentService:
    """Handles student-related business logic"""
    
    def __init__(self):
        from models.database import DatabaseManager
        from utils.file_manager import FileManager
        from utils.image_processor import ImageProcessor
        
        self.db = DatabaseManager()
        self.file_manager = FileManager()
        self.image_processor = ImageProcessor()
    
    def register_student(self, student_data: Dict) -> Tuple[bool, str]:
        """Register a new student"""
        student_id = student_data.get('student_id', '').strip()
        name = student_data.get('name', '').strip()
        email = student_data.get('email', '').strip() or None
        department = student_data.get('department', '').strip() or None
        
        # Validation
        if not student_id:
            return False, "Student ID is required"
        
        if not name:
            return False, "Student name is required"
        
        return self.db.add_student(student_id, name, email, department)
    
    def capture_face_images(self, student_id: str, image_data: str) -> Tuple[bool, str, int]:
        """Capture and save face images for a student"""
        try:
            # Validate student exists
            student = self.db.get_student(student_id)
            if not student:
                return False, "Student not found", 0
            
            # Convert base64 to image
            image = self.image_processor.base64_to_image(image_data)
            
            # Detect faces
            face_images, face_coords = self.image_processor.detect_faces(image)
            
            if not face_images:
                return False, "No faces detected in the image", 0
            
            # Save face images
            current_count = self.file_manager.count_student_images(student_id)
            saved_count = 0
            
            for i, face_img in enumerate(face_images):
                success, message = self.file_manager.save_face_image(
                    student_id, face_img, current_count + i + 1
                )
                if success:
                    saved_count += 1
            
            return True, f"Saved {saved_count} face image(s)", saved_count
            
        except Exception as e:
            return False, f"Error capturing faces: {str(e)}", 0
    
    def get_all_students(self) -> List[Dict]:
        """Get all students"""
        return self.db.get_all_students()
    
    def get_student_info(self, student_id: str) -> Optional[Dict]:
        """Get complete student information"""
        student = self.db.get_student(student_id)
        if not student:
            return None
        
        # Add additional information
        student_dict = dict(student)
        student_dict['face_images_count'] = self.file_manager.count_student_images(student_id)
        
        return student_dict