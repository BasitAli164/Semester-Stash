# backend/models/face_model.py
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
            
            print(f"🔄 Loading model from: {self.model_path}")
            print(f"🔄 Loading label map from: {self.label_map_path}")
            
            if os.path.exists(self.model_path):
                self.recognizer = cv2.face.LBPHFaceRecognizer_create()
                self.recognizer.read(str(self.model_path))
                print("✅ Model loaded successfully")
            else:
                self.recognizer = None
                print("❌ Model file not found")
            
            if os.path.exists(self.label_map_path):
                self.label_map = {}
                with open(self.label_map_path, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    next(reader)  # Skip header
                    for row in reader:
                        if len(row) >= 3:
                            try:
                                self.label_map[int(row[0])] = (row[1], row[2])
                                print(f"✅ Loaded label: {row[0]} -> {row[1]} ({row[2]})")
                            except ValueError:
                                continue
                print(f"✅ Label map loaded with {len(self.label_map)} entries")
            else:
                self.label_map = {}
                print("❌ Label map file not found")
            
            model_ready = self.is_model_ready()
            print(f"🔍 Model ready: {model_ready}")
            return model_ready
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
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
            
            print(f"🖼️ Input image shape: {image_array.shape}")
            
            # Convert to grayscale if needed
            if len(image_array.shape) == 3:
                gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
            else:
                gray = image_array
            
            print(f"🔍 Grayscale image shape: {gray.shape}")
            
            # Apply histogram equalization for better contrast
            gray = cv2.equalizeHist(gray)
            
            # Apply Gaussian blur to reduce noise
            gray = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # More lenient face detection parameters for webcam
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            print(f"👤 Faces detected: {len(faces)}")
            
            face_images = []
            face_coordinates = []
            
            for (x, y, w, h) in faces:
                print(f"   Face at: x={x}, y={y}, w={w}, h={h}")
                # Extract face region with padding
                padding = 10
                x1 = max(0, x - padding)
                y1 = max(0, y - padding)
                x2 = min(gray.shape[1], x + w + padding)
                y2 = min(gray.shape[0], y + h + padding)
                
                face_img = gray[y1:y2, x1:x2]
                
                # Resize to standard size for consistency
                if face_img.size > 0:
                    face_img = cv2.resize(face_img, (200, 200))
                    
                    # Apply additional histogram equalization
                    face_img = cv2.equalizeHist(face_img)
                    
                    face_images.append(face_img)
                    face_coordinates.append((int(x), int(y), int(w), int(h)))
            
            return face_images, face_coordinates
            
        except Exception as e:
            print(f"❌ Face detection error: {e}")
            return [], []
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
                    
                    print(f"🔍 Face {i}: label={label}, confidence={confidence}")
                    
                    # Convert confidence to percentage (lower is better in LBPH)
                    confidence_percent = max(0, 100 - min(confidence, 100))
                    
                    # ✅ INCREASED CONFIDENCE THRESHOLD - THIS IS THE FIX
                    confidence_threshold = 150  # Increased from 70 to 150
                    
                    if (confidence < confidence_threshold and 
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
                        print(f"✅ Recognized: {name} (confidence: {confidence}, threshold: {confidence_threshold})")
                    else:
                        results.append({
                            'student_id': 'unknown',
                            'name': 'Unknown',
                            'confidence': round(confidence_percent, 2),
                            'bounding_box': [x, y, w, h],
                            'status': 'unknown',
                            'raw_confidence': confidence
                        })
                        print(f"❌ Unknown face (confidence: {confidence}, threshold: {confidence_threshold})")
                        if label in self.label_map:
                            student_id, name = self.label_map[label]
                            print(f"   Would match: {name} but confidence too low")
                        
                except Exception as e:
                    print(f"Error recognizing face {i}: {e}")
                    continue
            
            return results
            
        except Exception as e:
            raise ValueError(f"Face recognition failed: {str(e)}")
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
    # Add this debug method to your FaceRecognizer class
    def debug_model_info(self):
        print("🔍 Model Debug Info:")
        print(f"Model loaded: {self.recognizer is not None}")
        print(f"Label map entries: {len(self.label_map)}")
        print("Label map contents:")
        for label_id, (student_id, name) in self.label_map.items():
            print(f"  Label {label_id}: {name} ({student_id})")