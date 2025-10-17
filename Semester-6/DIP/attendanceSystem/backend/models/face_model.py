import os
import csv
from pathlib import Path
from typing import List, Dict, Tuple, Optional

class FaceRecognizer:
    """Face recognition model using OpenCV's LBPH recognizer"""
    
    def __init__(self, model_path: str = None, label_map_path: str = None):
        from config import config
        self.config = config
        self.model_path = model_path or self.config.MODEL_FILE
        self.label_map_path = label_map_path or self.config.LABEL_MAP_FILE
        self.recognizer = None
        self.label_map = {}
        self.face_cascade = None
        self._ensure_cascade_loaded()
        self.load_model()
    
    def _ensure_cascade_loaded(self):
        """Ensure face cascade classifier is loaded properly"""
        try:
            import cv2
            
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
            if self.face_cascade.empty():
                # Try alternative path
                alt_path = '/usr/share/opencv4/haarcascades/haarcascade_frontalface_default.xml'
                if os.path.exists(alt_path):
                    self.face_cascade = cv2.CascadeClassifier(alt_path)
                else:
                    raise RuntimeError("Failed to load face detection cascade classifier")
        except Exception as e:
            print(f"Error loading cascade classifier: {e}")
            raise RuntimeError("Failed to load face detection cascade classifier")
    
    def load_model(self) -> bool:
        """Load trained model and label mapping"""
        try:
            import cv2
            
            if os.path.exists(self.model_path):
                self.recognizer = cv2.face.LBPHFaceRecognizer_create()
                self.recognizer.read(str(self.model_path))
            else:
                self.recognizer = None
            
            if os.path.exists(self.label_map_path):
                self.label_map = {}
                with open(self.label_map_path, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    next(reader)  # Skip header
                    for row in reader:
                        if len(row) >= 3:
                            try:
                                self.label_map[int(row[0])] = (row[1], row[2])
                            except ValueError:
                                continue
            else:
                self.label_map = {}
            
            return self.is_model_ready()
            
        except Exception as e:
            print(f"Error loading model: {e}")
            self.recognizer = None
            self.label_map = {}
            return False
    
    def is_model_ready(self) -> bool:
        """Check if model is loaded and ready for recognition"""
        return self.recognizer is not None and len(self.label_map) > 0
    
    def detect_faces(self, image_array) -> Tuple[List, List]:
        """Detect faces in image and return face images and coordinates"""
        try:
            import cv2
            
            # Convert to grayscale if needed
            if len(image_array.shape) == 3:
                gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
            else:
                gray = image_array
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=self.config.FACE_DETECTION_SCALE_FACTOR,
                minNeighbors=self.config.FACE_DETECTION_MIN_NEIGHBORS,
                minSize=self.config.FACE_DETECTION_MIN_SIZE
            )
            
            face_images = []
            face_coordinates = []
            
            for (x, y, w, h) in faces:
                # Extract face region
                face_img = gray[y:y+h, x:x+w]
                
                # Resize to standard size for consistency
                face_img = cv2.resize(face_img, (200, 200))
                
                # Apply histogram equalization for better contrast
                face_img = cv2.equalizeHist(face_img)
                
                face_images.append(face_img)
                face_coordinates.append((int(x), int(y), int(w), int(h)))
            
            return face_images, face_coordinates
            
        except Exception as e:
            raise ValueError(f"Face detection failed: {str(e)}")
    
    def recognize_faces(self, image_array) -> List[Dict]:
        """Recognize faces in image and return recognition results"""
        if not self.is_model_ready():
            raise RuntimeError("Model not trained. Please train the model first.")
        
        try:
            # Detect faces first
            face_images, face_coords = self.detect_faces(image_array)
            
            if not face_images:
                return []
            
            results = []
            
            for i, (face_img, (x, y, w, h)) in enumerate(zip(face_images, face_coords)):
                try:
                    # Predict using the recognizer
                    label, confidence = self.recognizer.predict(face_img)
                    
                    # Convert confidence to percentage (lower is better in LBPH)
                    confidence_percent = max(0, 100 - confidence)
                    
                    if (confidence < self.config.RECOGNITION_CONFIDENCE_THRESHOLD and 
                        label in self.label_map):
                        student_id, name = self.label_map[label]
                        results.append({
                            'student_id': student_id,
                            'name': name,
                            'confidence': round(confidence_percent, 2),
                            'bounding_box': [x, y, w, h],
                            'status': 'recognized',
                            'raw_confidence': confidence
                        })
                    else:
                        results.append({
                            'student_id': 'unknown',
                            'name': 'Unknown',
                            'confidence': round(confidence_percent, 2),
                            'bounding_box': [x, y, w, h],
                            'status': 'unknown',
                            'raw_confidence': confidence
                        })
                        
                except Exception as e:
                    print(f"Error recognizing face {i}: {e}")
                    continue
            
            return results
            
        except Exception as e:
            raise ValueError(f"Face recognition failed: {str(e)}")
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        return {
            'model_loaded': self.recognizer is not None,
            'students_trained': len(self.label_map),
            'label_map': self.label_map,
            'model_path': str(self.model_path),
            'label_map_path': str(self.label_map_path)
        }