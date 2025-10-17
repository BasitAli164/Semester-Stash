import os
import csv
import shutil
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from ..config import config

class FileManager:
    """Manages file system operations for the attendance system"""
    
    def __init__(self):
        self._setup_directories()
    
    def _setup_directories(self):
        """Create necessary directories for the application"""
        directories = [
            config.FACES_DIR,
            config.MODELS_DIR, 
            config.ATTENDANCE_DIR,
            config.TEMP_DIR
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def get_student_faces_dir(self, student_id: str) -> Path:
        """Get directory path for student's face images"""
        return config.FACES_DIR / student_id
    
    def create_student_directory(self, student_id: str) -> Path:
        """Create directory for student's face images"""
        faces_dir = self.get_student_faces_dir(student_id)
        faces_dir.mkdir(parents=True, exist_ok=True)
        return faces_dir
    
    def save_face_image(self, student_id: str, face_image, image_index: int) -> Tuple[bool, str]:
        """Save face image to student's directory"""
        try:
            faces_dir = self.create_student_directory(student_id)
            image_path = faces_dir / f"face_{image_index:03d}.jpg"
            
            # Ensure the image is in the correct format
            if isinstance(face_image, np.ndarray):
                success = cv2.imwrite(str(image_path), face_image)
            else:
                # Assume it's a PIL Image
                face_image.save(str(image_path), 'JPEG', quality=95)
                success = True
            
            if success:
                return True, str(image_path)
            else:
                return False, "Failed to save image file"
                
        except Exception as e:
            return False, f"Error saving face image: {str(e)}"
    
    def get_student_face_images(self, student_id: str) -> List[Path]:
        """Get all face images for a student"""
        faces_dir = self.get_student_faces_dir(student_id)
        if faces_dir.exists():
            return sorted(faces_dir.glob("face_*.jpg"))
        return []
    
    def count_student_images(self, student_id: str) -> int:
        """Count number of face images for a student"""
        return len(self.get_student_face_images(student_id))
    
    def get_all_face_images(self) -> List[Tuple[str, Path]]:
        """Get all face images from all students with student IDs"""
        images = []
        
        if not config.FACES_DIR.exists():
            return images
        
        for student_dir in config.FACES_DIR.iterdir():
            if student_dir.is_dir():
                student_id = student_dir.name
                for image_path in student_dir.glob("face_*.jpg"):
                    images.append((student_id, image_path))
        
        return images
    
    def save_trained_model(self, recognizer, label_map: Dict) -> Tuple[bool, str]:
        """Save trained model and label mapping"""
        try:
            # Ensure models directory exists
            config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
            
            # Save model
            recognizer.save(str(config.MODEL_FILE))
            
            # Save label mapping
            with open(config.LABEL_MAP_FILE, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['label', 'student_id', 'name'])
                for label, (student_id, name) in label_map.items():
                    writer.writerow([label, student_id, name])
            
            return True, "Model saved successfully"
            
        except Exception as e:
            return False, f"Error saving model: {str(e)}"
    
    def model_exists(self) -> bool:
        """Check if trained model exists"""
        return config.MODEL_FILE.exists() and config.LABEL_MAP_FILE.exists()
    
    def get_model_files(self) -> Tuple[Path, Path]:
        """Get model file paths"""
        return config.MODEL_FILE, config.LABEL_MAP_FILE
    
    def cleanup_student_data(self, student_id: str) -> bool:
        """Remove all face data for a student"""
        try:
            faces_dir = self.get_student_faces_dir(student_id)
            if faces_dir.exists():
                shutil.rmtree(faces_dir)
            return True
        except Exception as e:
            print(f"Error cleaning up student data: {e}")
            return False
    
    def get_storage_stats(self) -> Dict:
        """Get storage statistics"""
        total_images = 0
        total_size = 0
        students_with_faces = 0
        
        if config.FACES_DIR.exists():
            for student_dir in config.FACES_DIR.iterdir():
                if student_dir.is_dir():
                    students_with_faces += 1
                    for image_path in student_dir.glob("*.jpg"):
                        total_images += 1
                        if image_path.exists():
                            total_size += image_path.stat().st_size
        
        # Model size
        model_size = 0
        if config.MODEL_FILE.exists():
            model_size = config.MODEL_FILE.stat().st_size
        
        return {
            'total_images': total_images,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'students_with_faces': students_with_faces,
            'model_size_bytes': model_size,
            'model_size_mb': round(model_size / (1024 * 1024), 2)
        }
    
    def cleanup_temp_files(self):
        """Clean up temporary files"""
        try:
            if config.TEMP_DIR.exists():
                shutil.rmtree(config.TEMP_DIR)
            config.TEMP_DIR.mkdir(exist_ok=True)
        except Exception as e:
            print(f"Error cleaning temp files: {e}")
    
    def export_attendance_csv(self, attendance_data: List[Dict], filename: str) -> str:
        """Export attendance data to CSV file"""
        try:
            filepath = config.ATTENDANCE_DIR / filename
            
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['Date', 'Student ID', 'Name', 'Time', 'Status', 'Department'])
                
                for record in attendance_data:
                    writer.writerow([
                        record.get('date', ''),
                        record.get('student_id', ''),
                        record.get('name', ''),
                        record.get('time', ''),
                        record.get('status', ''),
                        record.get('department', '')
                    ])
            
            return str(filepath)
            
        except Exception as e:
            raise ValueError(f"Error exporting CSV: {str(e)}")
    
    def get_exported_files(self) -> List[Dict]:
        """Get list of exported attendance files"""
        files = []
        
        if config.ATTENDANCE_DIR.exists():
            for file_path in config.ATTENDANCE_DIR.glob("*.csv"):
                stat = file_path.stat()
                files.append({
                    'filename': file_path.name,
                    'filepath': str(file_path),
                    'size_bytes': stat.st_size,
                    'size_mb': round(stat.st_size / (1024 * 1024), 2),
                    'created_at': stat.st_ctime
                })
        
        return sorted(files, key=lambda x: x['created_at'], reverse=True)