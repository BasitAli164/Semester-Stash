# backend/services/training_service.py
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import os
from pathlib import Path

class TrainingService:
    """Handles face recognition model training operations"""
    
    def __init__(self):
        from models.database import DatabaseManager
        from utils.file_manager import FileManager
        from config import config
        
        self.db = DatabaseManager()
        self.file_manager = FileManager()
        self.config = config
        self.recognizer = None
    
    def get_training_status(self) -> Dict:
        """Get current training readiness status"""
        try:
            print("🔍 Checking training status...")
            
            # Get ALL active students from database
            all_students = self.db.get_all_students(active_only=True)
            print(f"📊 Found {len(all_students)} active students in database")
            
            # Check for face images for each student
            ready_students = {}
            not_ready_students = {}
            total_images = 0
            
            for student in all_students:
                student_id = student['student_id']
                student_name = student['name']
                
                # Count images for this student
                image_count = self._count_student_images(student_id)
                total_images += image_count
                
                print(f"   👤 {student_name} ({student_id}): {image_count} images")
                
                if image_count >= self.config.MIN_IMAGES_FOR_TRAINING:
                    ready_students[student_id] = {
                        'name': student_name,
                        'image_count': image_count,
                        'status': 'ready'
                    }
                else:
                    not_ready_students[student_id] = {
                        'name': student_name,
                        'image_count': image_count,
                        'status': 'not_ready',
                        'needed': self.config.MIN_IMAGES_FOR_TRAINING - image_count
                    }
            
            ready_count = len(ready_students)
            total_students = len(all_students)
            
            # Can train if we have at least 1 student with sufficient images
            can_train = ready_count >= 1
            
            print(f"📈 Training Status Summary:")
            print(f"   Total Students: {total_students}")
            print(f"   Ready Students: {ready_count}")
            print(f"   Total Images: {total_images}")
            print(f"   Can Train: {can_train}")
            print(f"   Model Exists: {self.file_manager.model_exists()}")
            
            return {
                'total_students': total_students,
                'ready_students': ready_count,
                'not_ready_students': len(not_ready_students),
                'total_images': total_images,
                'model_trained': self.file_manager.model_exists(),
                'ready_students_details': ready_students,
                'not_ready_students_details': not_ready_students,
                'min_images_required': self.config.MIN_IMAGES_FOR_TRAINING,
                'can_train': can_train
            }
            
        except Exception as e:
            print(f"❌ Error in get_training_status: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return {
                'error': str(e),
                'total_students': 0,
                'ready_students': 0,
                'not_ready_students': 0,
                'total_images': 0,
                'model_trained': False,
                'can_train': False
            }
    
    def _count_student_images(self, student_id: str) -> int:
        """Count face images for a specific student"""
        try:
            # Method 1: Check the faces directory structure
            faces_dir = Path(self.config.FACES_DIR)
            student_dir = faces_dir / student_id
            
            if student_dir.exists() and student_dir.is_dir():
                # Count image files
                image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
                image_files = [
                    f for f in student_dir.iterdir() 
                    if f.is_file() and f.suffix.lower() in image_extensions
                ]
                return len(image_files)
            
            # Method 2: Check if using a different structure (flat files)
            pattern = f"{student_id}_*.jpg"
            flat_images = list(faces_dir.glob(pattern))
            if flat_images:
                return len(flat_images)
            
            # Method 3: Check database if you store image metadata
            try:
                # If you have a student_images table
                with self.db._get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute('SELECT COUNT(*) FROM student_images WHERE student_id = ?', (student_id,))
                    result = cursor.fetchone()
                    return result[0] if result else 0
            except:
                pass
            
            return 0
            
        except Exception as e:
            print(f"Error counting images for {student_id}: {e}")
            return 0
    
    def prepare_training_data(self) -> Tuple[List, List, Dict]:
        """Prepare training data from all student face images"""
        try:
            import cv2
            import numpy as np
            
            faces = []
            labels = []
            label_map = {}
            current_label = 0
            
            print("🔄 Preparing training data...")
            
            # Get training status to find ready students
            status = self.get_training_status()
            ready_students = status.get('ready_students_details', {})
            
            if not ready_students:
                raise ValueError("No students with sufficient face images found for training.")
            
            print(f"🎯 Training with {len(ready_students)} ready students...")
            
            # Load images for each ready student
            for student_id, student_info in ready_students.items():
                student = self.db.get_student(student_id)
                if not student:
                    print(f"⚠️ Student {student_id} not found in database, skipping...")
                    continue
                
                # Get all images for this student
                student_images = self._get_student_images(student_id)
                if not student_images:
                    print(f"⚠️ No images found for student {student_id}, skipping...")
                    continue
                
                label_map[current_label] = (student_id, student['name'])
                images_loaded = 0
                
                print(f"   👤 Processing {student['name']}: {len(student_images)} images")
                
                for image_path in student_images:
                    try:
                        # Load and preprocess image
                        img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
                        if img is not None:
                            # Resize and enhance
                            img = cv2.resize(img, (200, 200))
                            img = cv2.equalizeHist(img)
                            
                            faces.append(img)
                            labels.append(current_label)
                            images_loaded += 1
                        else:
                            print(f"      ❌ Failed to load: {image_path}")
                    except Exception as e:
                        print(f"      ❌ Error loading {image_path}: {e}")
                        continue
                
                if images_loaded > 0:
                    print(f"      ✅ Loaded {images_loaded} images")
                    current_label += 1
                else:
                    print(f"      ❌ No valid images for {student_id}")
                    label_map.pop(current_label, None)
            
            if len(faces) == 0:
                raise ValueError("No valid face images could be loaded for training")
            
            print(f"✅ Training data prepared: {len(faces)} images, {len(label_map)} students")
            return faces, labels, label_map
            
        except Exception as e:
            print(f"❌ Error preparing training data: {str(e)}")
            raise
    
    def _get_student_images(self, student_id: str) -> List[Path]:
        """Get all image paths for a student"""
        try:
            images = []
            faces_dir = Path(self.config.FACES_DIR)
            
            # Check student directory
            student_dir = faces_dir / student_id
            if student_dir.exists() and student_dir.is_dir():
                image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
                for ext in image_extensions:
                    images.extend(student_dir.glob(f"*{ext}"))
                    images.extend(student_dir.glob(f"*{ext.upper()}"))
            
            # Check flat structure
            pattern = f"{student_id}_*.jpg"
            images.extend(faces_dir.glob(pattern))
            
            return images
            
        except Exception as e:
            print(f"Error getting images for {student_id}: {e}")
            return []
    
    def train_model(self) -> Tuple[bool, str, Dict]:
        """Train the face recognition model"""
        try:
            import cv2
            import numpy as np
            
            print("🚀 Starting model training...")
            
            # Prepare training data
            faces, labels, label_map = self.prepare_training_data()
            
            # Create and train recognizer
            self.recognizer = cv2.face.LBPHFaceRecognizer_create()
            
            print("🧠 Training model...")
            self.recognizer.train(faces, np.array(labels))
            
            # Save model
            success, message = self.file_manager.save_trained_model(self.recognizer, label_map)
            if not success:
                return False, message, {}
            
            # Training statistics
            training_stats = {
                'total_images': len(faces),
                'total_students': len(label_map),
                'students_trained': list(label_map.values()),
                'model_type': 'LBPH',
                'timestamp': self._get_current_timestamp()
            }
            
            print(f"✅ Model trained successfully: {len(faces)} images, {len(label_map)} students")
            self.db._log('INFO', f'Model trained successfully: {len(faces)} images, {len(label_map)} students', 'training')
            
            return True, f"Model trained successfully with {len(faces)} images of {len(label_map)} students", training_stats
            
        except Exception as e:
            error_msg = f"Training failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.db._log('ERROR', error_msg, 'training')
            return False, error_msg, {}
    
    def validate_training_data(self) -> Tuple[bool, List[str]]:
        """Validate training data and return issues"""
        issues = []
        
        status = self.get_training_status()
        
        if status['total_students'] == 0:
            issues.append("No students registered in the system")
        
        if status['total_images'] == 0:
            issues.append("No face images found for any students")
        
        if not status['can_train']:
            issues.append(f"Need at least 1 student with {self.config.MIN_IMAGES_FOR_TRAINING}+ face images")
        
        return len(issues) == 0, issues
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp string"""
        return datetime.now().isoformat()