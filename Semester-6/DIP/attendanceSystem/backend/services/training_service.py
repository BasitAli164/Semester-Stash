import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from ..models.database import DatabaseManager
from ..utils.file_manager import FileManager
from ..config import config

class TrainingService:
    """Handles face recognition model training operations"""
    
    def __init__(self):
        self.db = DatabaseManager()
        self.file_manager = FileManager()
        self.recognizer = None
    
    def prepare_training_data(self) -> Tuple[List[np.ndarray], List[int], Dict]:
        """Prepare training data from all student face images"""
        try:
            faces = []
            labels = []
            label_map = {}
            current_label = 0
            
            # Get all face images
            face_images = self.file_manager.get_all_face_images()
            
            if not face_images:
                raise ValueError("No face images found for training. Please capture face images for students first.")
            
            # Group images by student and validate
            student_images = {}
            for student_id, image_path in face_images:
                if student_id not in student_images:
                    student_images[student_id] = []
                student_images[student_id].append(image_path)
            
            # Filter students with sufficient images
            valid_students = {}
            for student_id, image_paths in student_images.items():
                if len(image_paths) >= config.MIN_IMAGES_FOR_TRAINING:
                    valid_students[student_id] = image_paths
                else:
                    print(f"Student {student_id} has only {len(image_paths)} images (minimum {config.MIN_IMAGES_FOR_TRAINING} required)")
            
            if not valid_students:
                raise ValueError(f"No students with sufficient face images. Minimum {config.MIN_IMAGES_FOR_TRAINING} images per student required.")
            
            print(f"Training with {len(valid_students)} students...")
            
            # Load images and create labels
            for student_id, image_paths in valid_students.items():
                student = self.db.get_student(student_id)
                if not student:
                    print(f"Student {student_id} not found in database, skipping...")
                    continue
                
                label_map[current_label] = (student_id, student['name'])
                images_loaded = 0
                
                for image_path in image_paths:
                    try:
                        img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
                        if img is not None:
                            # Preprocess the face image
                            img = cv2.resize(img, (200, 200))
                            img = cv2.equalizeHist(img)
                            
                            faces.append(img)
                            labels.append(current_label)
                            images_loaded += 1
                        else:
                            print(f"Failed to load image: {image_path}")
                    except Exception as e:
                        print(f"Error loading image {image_path}: {e}")
                        continue
                
                if images_loaded > 0:
                    print(f"Loaded {images_loaded} images for {student['name']} (ID: {student_id})")
                    current_label += 1
                else:
                    print(f"No valid images loaded for {student_id}, removing from training set")
                    label_map.pop(current_label, None)
            
            if len(faces) == 0:
                raise ValueError("No valid face images could be loaded for training")
            
            print(f"Training data prepared: {len(faces)} images, {len(label_map)} students")
            return faces, labels, label_map
            
        except Exception as e:
            raise ValueError(f"Error preparing training data: {str(e)}")
    
    def train_model(self) -> Tuple[bool, str, Dict]:
        """Train the face recognition model"""
        try:
            # Prepare training data
            faces, labels, label_map = self.prepare_training_data()
            
            # Create and train recognizer
            self.recognizer = cv2.face.LBPHFaceRecognizer_create()
            
            # Train the model
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
            
            # Log training success
            self.db._log('INFO', f'Model trained successfully: {len(faces)} images, {len(label_map)} students', 'training')
            
            return True, f"Model trained successfully with {len(faces)} images of {len(label_map)} students", training_stats
            
        except ValueError as e:
            error_msg = str(e)
            self.db._log('ERROR', f'Training failed: {error_msg}', 'training')
            return False, error_msg, {}
        except Exception as e:
            error_msg = f"Training failed: {str(e)}"
            self.db._log('ERROR', error_msg, 'training')
            return False, error_msg, {}
    
    def get_training_status(self) -> Dict:
        """Get current training readiness status"""
        try:
            face_images = self.file_manager.get_all_face_images()
            
            # Group by student
            student_images = {}
            for student_id, _ in face_images:
                if student_id not in student_images:
                    student_images[student_id] = 0
                student_images[student_id] += 1
            
            # Students with sufficient images
            ready_students = {}
            not_ready_students = {}
            
            for student_id, count in student_images.items():
                student = self.db.get_student(student_id)
                if student:
                    if count >= config.MIN_IMAGES_FOR_TRAINING:
                        ready_students[student_id] = {
                            'name': student['name'],
                            'image_count': count,
                            'status': 'ready'
                        }
                    else:
                        not_ready_students[student_id] = {
                            'name': student['name'],
                            'image_count': count,
                            'status': 'not_ready',
                            'needed': config.MIN_IMAGES_FOR_TRAINING - count
                        }
            
            total_students = len(student_images)
            ready_count = len(ready_students)
            not_ready_count = len(not_ready_students)
            
            return {
                'total_students': total_students,
                'ready_students': ready_count,
                'not_ready_students': not_ready_count,
                'total_images': len(face_images),
                'model_trained': self.file_manager.model_exists(),
                'ready_students_details': ready_students,
                'not_ready_students_details': not_ready_students,
                'min_images_required': config.MIN_IMAGES_FOR_TRAINING,
                'can_train': ready_count >= 1  # Need at least one student with sufficient images
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'total_students': 0,
                'ready_students': 0,
                'not_ready_students': 0,
                'total_images': 0,
                'model_trained': False,
                'can_train': False
            }
    
    def validate_training_data(self) -> Tuple[bool, List[str]]:
        """Validate training data and return issues"""
        issues = []
        
        status = self.get_training_status()
        
        if status['total_students'] == 0:
            issues.append("No students with face images found")
        
        if not status['can_train']:
            issues.append(f"Need at least 1 student with {config.MIN_IMAGES_FOR_TRAINING}+ face images")
        
        if status['ready_students'] == 0:
            issues.append(f"No students have the minimum {config.MIN_IMAGES_FOR_TRAINING} face images required for training")
        
        return len(issues) == 0, issues
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp string"""
        from datetime import datetime
        return datetime.now().isoformat()