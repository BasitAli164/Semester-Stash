import os
import numpy as np
from deepface import DeepFace
from deepface.commons import functions
import cv2
from api.config.config import Config

class FaceRecognition:
    def __init__(self):
        self.model_name = Config.DEEPFACE_MODEL
        self.detector_backend = Config.DEEPFACE_DETECTOR
        self.threshold = Config.RECOGNITION_THRESHOLD
    
    def preprocess_image(self, image_path):
        """Preprocess image for face recognition"""
        try:
            # Read and validate image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")
            
            # Detect faces using DeepFace
            faces = DeepFace.extract_faces(
                img_path=image_path,
                detector_backend=self.detector_backend,
                enforce_detection=False
            )
            
            if not faces or len(faces) == 0:
                raise ValueError("No faces detected in the image")
            
            # Return the first detected face region
            face_region = faces[0]['facial_area']
            face_img = img[face_region['y']:face_region['y']+face_region['h'],
                          face_region['x']:face_region['x']+face_region['w']]
            
            # Resize to standard size
            face_img = cv2.resize(face_img, (224, 224))
            
            return face_img
            
        except Exception as e:
            raise Exception(f"Image preprocessing failed: {str(e)}")
    
    def generate_embedding(self, image_path):
        """Generate face embedding from image"""
        try:
            # Use DeepFace to represent face
            embedding_objs = DeepFace.represent(
                img_path=image_path,
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                enforce_detection=True
            )
            
            if not embedding_objs:
                raise ValueError("Could not generate embedding")
            
            embedding = embedding_objs[0]['embedding']
            return np.array(embedding)
            
        except Exception as e:
            raise Exception(f"Embedding generation failed: {str(e)}")
    
    def verify_face(self, live_image_path, stored_embedding):
        """Verify face against stored embedding"""
        try:
            # Generate embedding for live image
            live_embedding = self.generate_embedding(live_image_path)
            
            # Convert stored embedding to numpy array
            if isinstance(stored_embedding, str):
                import json
                stored_embedding = np.array(json.loads(stored_embedding))
            elif isinstance(stored_embedding, list):
                stored_embedding = np.array(stored_embedding)
            
            # Calculate cosine similarity
            similarity = self.cosine_similarity(live_embedding, stored_embedding)
            
            # Convert similarity to distance (cosine distance = 1 - similarity)
            distance = 1 - similarity
            
            return distance <= self.threshold, distance, similarity
            
        except Exception as e:
            raise Exception(f"Face verification failed: {str(e)}")
    
    def cosine_similarity(self, a, b):
        """Calculate cosine similarity between two vectors"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def find_best_match(self, live_image_path, embeddings_dict):
        """Find best match from multiple stored embeddings"""
        try:
            live_embedding = self.generate_embedding(live_image_path)
            best_match = None
            best_similarity = -1
            best_distance = float('inf')
            
            for student_id, stored_embedding in embeddings_dict.items():
                if isinstance(stored_embedding, str):
                    import json
                    stored_embedding = np.array(json.loads(stored_embedding))
                
                similarity = self.cosine_similarity(live_embedding, stored_embedding)
                distance = 1 - similarity
                
                if similarity > best_similarity and distance <= self.threshold:
                    best_similarity = similarity
                    best_distance = distance
                    best_match = student_id
            
            return best_match, best_distance, best_similarity
            
        except Exception as e:
            raise Exception(f"Face matching failed: {str(e)}")