# backend/services/attendance_service.py
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta

class AttendanceService:
    """Handles attendance-related business logic"""
    
    def __init__(self):
        from models.database import DatabaseManager
        from utils.file_manager import FileManager
        from utils.image_processor import ImageProcessor
        from models.face_model import FaceRecognizer
        
        self.db = DatabaseManager()
        self.file_manager = FileManager()
        self.image_processor = ImageProcessor()
        self.face_recognizer = FaceRecognizer()
    
    def is_model_ready(self) -> bool:
        """Check if face recognition model is ready"""
        return self.face_recognizer.is_model_ready()
    
    def recognize_faces(self, image_data: str) -> Tuple[bool, str, List[Dict]]:
        """Recognize faces in image and return results"""
        try:
            import numpy as np
            
            if not self.is_model_ready():
                return False, "Face recognition model is not trained. Please train the model first.", []
            
            # Validate image size
            if not self.image_processor.validate_image_size(image_data):
                return False, "Image size too large. Maximum size is 5MB.", []
            
            # Convert base64 to image
            image = self.image_processor.base64_to_image(image_data)
            
            # Enhance image quality for better recognition
            enhanced_image = self.image_processor.enhance_image_quality(image)
            
            # Convert to numpy array for face recognition
            image_array = np.array(enhanced_image)
            
            # Recognize faces
            results = self.face_recognizer.recognize_faces(image_array)
            
            if not results:
                return False, "No faces detected in the image", []
            
            # Count recognized vs unknown faces
            recognized_faces = [r for r in results if r['status'] == 'recognized']
            unknown_faces = [r for r in results if r['status'] == 'unknown']
            
            message = f"Detected {len(results)} faces: {len(recognized_faces)} recognized, {len(unknown_faces)} unknown"
            
            return True, message, results
            
        except Exception as e:
            return False, f"Face recognition failed: {str(e)}", []
    
    def mark_attendance_from_recognition(self, recognition_results: List[Dict]) -> Tuple[int, List[Dict]]:
        """Mark attendance for recognized students"""
        marked_count = 0
        detailed_results = []
        
        for face in recognition_results:
            if face['status'] == 'recognized':
                student_id = face['student_id']
                name = face['name']
                
                # Mark attendance
                success, message = self.db.mark_attendance(student_id, name)
                
                # Update face data with attendance result
                face['attendance_marked'] = success
                face['attendance_message'] = message
                face['attendance_time'] = self._get_current_time() if success else None
                
                if success:
                    marked_count += 1
                    # Log successful attendance
                    self.db._log('INFO', f'Attendance marked via recognition: {name} ({student_id})', 'attendance')
                else:
                    # Log attendance marking failure
                    self.db._log('WARNING', f'Attendance marking failed: {name} ({student_id}) - {message}', 'attendance')
            else:
                # Unknown face
                face['attendance_marked'] = False
                face['attendance_message'] = "Unknown face - attendance not marked"
                face['attendance_time'] = None
            
            detailed_results.append(face)
        
        return marked_count, detailed_results
    
    def mark_manual_attendance(self, student_id: str, status: str = "present", notes: str = None) -> Tuple[bool, str]:
        """Manually mark attendance for a student"""
        try:
            student = self.db.get_student(student_id)
            if not student:
                return False, "Student not found"
            
            success, message = self.db.mark_attendance(student_id, student['name'], status, notes)
            
            if success:
                self.db._log('INFO', f'Manual attendance marked: {student["name"]} ({student_id}) - {status}', 'attendance')
            else:
                self.db._log('WARNING', f'Manual attendance failed: {student["name"]} ({student_id}) - {message}', 'attendance')
            
            return success, message
            
        except Exception as e:
            error_msg = f"Error marking manual attendance: {str(e)}"
            self.db._log('ERROR', error_msg, 'attendance')
            return False, error_msg
    
    def get_attendance_report(self, date: str = None) -> Dict:
        """Get comprehensive attendance report for a date"""
        attendance = self.db.get_attendance(date)
        stats = self.db.get_attendance_stats(date)
        
        # Get all active students to identify absentees
        all_students = self.db.get_all_students()
        present_student_ids = {a['student_id'] for a in attendance if a['status'] == 'present'}
        
        absent_students = []
        for student in all_students:
            if student['student_id'] not in present_student_ids:
                absent_students.append({
                    'student_id': student['student_id'],
                    'name': student['name'],
                    'department': student.get('department', ''),
                    'status': 'absent'
                })
        
        return {
            'attendance': attendance,
            'absent_students': absent_students,
            'stats': stats,
            'date': date or self._get_current_date(),
            'total_records': len(attendance) + len(absent_students)
        }
    
    def get_attendance_range_report(self, start_date: str, end_date: str) -> Dict:
        """Get attendance report for a date range"""
        try:
            attendance_data = self.db.get_attendance_range(start_date, end_date)
            
            # Calculate range statistics
            student_attendance = {}
            date_range = []
            
            current_date = start_date
            while current_date <= end_date:
                date_range.append(current_date)
                # Increment date
                current_dt = datetime.strptime(current_date, '%Y-%m-%d')
                current_dt += timedelta(days=1)
                current_date = current_dt.strftime('%Y-%m-%d')
            
            # Initialize student tracking
            all_students = self.db.get_all_students()
            for student in all_students:
                student_attendance[student['student_id']] = {
                    'name': student['name'],
                    'department': student.get('department', ''),
                    'present_count': 0,
                    'total_days': len(date_range),
                    'attendance_by_date': {date: 'absent' for date in date_range}
                }
            
            # Populate with actual attendance
            for record in attendance_data:
                student_id = record['student_id']
                date = record['date']
                if student_id in student_attendance and date in student_attendance[student_id]['attendance_by_date']:
                    if record['status'] == 'present':
                        student_attendance[student_id]['present_count'] += 1
                        student_attendance[student_id]['attendance_by_date'][date] = 'present'
            
            # Calculate statistics
            total_students = len(all_students)
            total_days = len(date_range)
            
            return {
                'start_date': start_date,
                'end_date': end_date,
                'total_days': total_days,
                'total_students': total_students,
                'student_attendance': student_attendance,
                'daily_attendance': attendance_data,
                'date_range': date_range
            }
            
        except Exception as e:
            self.db._log('ERROR', f'Range report failed: {str(e)}', 'attendance')
            return {}
    
    def get_attendance_stats(self, date: str = None) -> Dict:
        """Get attendance statistics"""
        return self.db.get_attendance_stats(date)
    
    def export_attendance(self, date: str = None) -> Tuple[bool, str, str]:
        """Export attendance data to CSV"""
        try:
            report = self.get_attendance_report(date)
            
            if not report['attendance'] and not report['absent_students']:
                return False, "No attendance data to export", ""
            
            # Combine present and absent records
            all_records = []
            for att in report['attendance']:
                all_records.append({
                    'date': report['date'],
                    'student_id': att['student_id'],
                    'name': att['name'],
                    'time': att['time'],
                    'status': att['status'],
                    'department': att.get('department', '')
                })
            
            for abs in report['absent_students']:
                all_records.append({
                    'date': report['date'],
                    'student_id': abs['student_id'],
                    'name': abs['name'],
                    'time': '',
                    'status': 'absent',
                    'department': abs.get('department', '')
                })
            
            filename = f"attendance_{report['date']}.csv"
            filepath = self.file_manager.export_attendance_csv(all_records, filename)
            
            return True, f"Attendance data exported successfully", filepath
            
        except Exception as e:
            error_msg = f"Export failed: {str(e)}"
            self.db._log('ERROR', error_msg, 'attendance')
            return False, error_msg, ""
    
    def _get_current_date(self) -> str:
        """Get current date in YYYY-MM-DD format"""
        return datetime.now().strftime('%Y-%m-%d')
    
    def _get_current_time(self) -> str:
        """Get current time in HH:MM:SS format"""
        return datetime.now().strftime('%H:%M:%S')