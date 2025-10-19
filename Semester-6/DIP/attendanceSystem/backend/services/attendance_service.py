# backend/services/attendance_service.py
import os
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
    
    def is_model_ready(self):
        """Check if face recognition model is ready"""
        return self.face_recognizer.is_model_ready()
    
    def recognize_faces(self, image_data):
        """Recognize faces in image and return results"""
        try:
            import numpy as np
            import cv2
            
            if not self.is_model_ready():
                return False, "Face recognition model is not trained. Please train the model first.", []
            
            # Validate image size
            if not self.image_processor.validate_image_size(image_data):
                return False, "Image size too large. Maximum size is 5MB.", []
            
            # Convert base64 to image
            image = self.image_processor.base64_to_image(image_data)
            
            # Convert to numpy array
            image_array = np.array(image)
            
            # Convert BGR to RGB if needed
            if len(image_array.shape) == 3 and image_array.shape[2] == 3:
                image_array = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
            
            print(f"🖼️ Image shape: {image_array.shape}")
            
            # Try face recognition
            results = self.face_recognizer.recognize_faces(image_array)
            
            if not results:
                print("🔍 No faces detected, trying alternative detection...")
                # Try alternative detection with different parameters
                results = self._try_alternative_detection(image_array)
            
            if not results:
                return False, "No faces detected in the image. Please ensure your face is clearly visible and well-lit.", []
            
            # Count recognized vs unknown faces
            recognized_faces = [r for r in results if r['status'] == 'recognized']
            unknown_faces = [r for r in results if r['status'] == 'unknown']
            
            message = f"Detected {len(results)} faces: {len(recognized_faces)} recognized, {len(unknown_faces)} unknown"
            print(f"✅ {message}")
            
            return True, message, results
            
        except Exception as e:
            error_msg = f"Face recognition failed: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg, []

    def _try_alternative_detection(self, image_array):
        """Try alternative face detection methods"""
        try:
            import cv2
            
            # Convert to grayscale
            if len(image_array.shape) == 3:
                gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = image_array
            
            # Try different cascade classifiers
            cascades = [
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml',
                cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml',
                cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml',
            ]
            
            for cascade_path in cascades:
                if not os.path.exists(cascade_path):
                    continue
                    
                cascade = cv2.CascadeClassifier(cascade_path)
                if cascade.empty():
                    continue
                
                faces = cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=3,
                    minSize=(30, 30)
                )
                
                if len(faces) > 0:
                    results = []
                    for (x, y, w, h) in faces:
                        results.append({
                            'student_id': 'unknown',
                            'name': 'Unknown',
                            'confidence': 0.0,
                            'bounding_box': [int(x), int(y), int(w), int(h)],
                            'status': 'unknown',
                            'raw_confidence': 100.0
                        })
                    return results
                    
            return []
            
        except Exception as e:
            print(f"Alternative detection failed: {e}")
            return []
    
    def mark_attendance_from_recognition(self, recognition_results):
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
    
    def mark_manual_attendance(self, student_id, status="present", notes=None):
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
    
    def get_attendance_report(self, date=None):
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
    
    def get_attendance_range_report(self, start_date, end_date):
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
    
    def get_attendance_stats(self, date=None):
        """Get attendance statistics"""
        return self.db.get_attendance_stats(date)
    
    def export_attendance(self, date=None):
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
    
    def _get_current_date(self):
        """Get current date in YYYY-MM-DD format"""
        return datetime.now().strftime('%Y-%m-%d')
    
    def _get_current_time(self):
        """Get current time in HH:MM:SS format"""
        return datetime.now().strftime('%H:%M:%S')
    
    def mark_manual_attendance(self, student_id, status="present", notes=None):
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
    
    def get_attendance_report(self, date=None):
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
    
    def get_attendance_range_report(self, start_date, end_date):
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
    
    def get_attendance_stats(self, date=None):
        """Get attendance statistics"""
        return self.db.get_attendance_stats(date)
    
    def export_attendance(self, date=None):
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
    
    def _get_current_date(self):
        """Get current date in YYYY-MM-DD format"""
        return datetime.now().strftime('%Y-%m-%d')
    
    def _get_current_time(self):
        """Get current time in HH:MM:SS format"""
        return datetime.now().strftime('%H:%M:%S')