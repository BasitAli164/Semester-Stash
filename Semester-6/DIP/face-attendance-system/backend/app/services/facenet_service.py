import os
import cv2
import torch
import numpy as np
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from app.config import Config

class FaceNetService:
    """Face recognition service using FaceNet"""
    
    def __init__(self):
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Use thresholds from Config with fallback values
        try:
            from app.config import Config
            self.FACE_DETECTION_THRESHOLD = Config.FACE_DETECTION_THRESHOLD
            self.FACE_RECOGNITION_THRESHOLD = Config.FACE_RECOGNITION_THRESHOLD
        except (ImportError, AttributeError):
            # Fallback values if Config is not available
            self.FACE_DETECTION_THRESHOLD = 0.9
            self.FACE_RECOGNITION_THRESHOLD = 0.8
            print("Using fallback threshold values")
        
        # Initialize MTCNN for face detection
        self.mtcnn = MTCNN(
            keep_all=True,
            thresholds=[0.6, 0.7, 0.7],
            min_face_size=20,
            device=self.device
        )
        
        # Initialize FaceNet for face recognition
        self.resnet = InceptionResnetV1(
            pretrained='vggface2',
            classify=False,
            device=self.device
        ).eval()
    
    def extract_face_embeddings(self, image_path):
        """
        Extract face embeddings from an image using FaceNet
        """
        try:
            image = Image.open(image_path).convert('RGB')
            faces, probs = self.mtcnn(image, return_prob=True)
            
            if faces is not None:
                embeddings_list = []
                for i, face in enumerate(faces):
                    if probs[i] > self.FACE_DETECTION_THRESHOLD:
                        face_embedding = self.resnet(face.unsqueeze(0).to(self.device))
                        embeddings_list.append(face_embedding.detach().cpu().numpy())
                
                if embeddings_list:
                    return np.vstack(embeddings_list)
            
            print(f"No face detected in {os.path.basename(image_path)}")
            return None
            
        except Exception as e:
            print(f"Error processing {os.path.basename(image_path)}: {e}")
            return None
    
    def extract_embeddings_from_image(self, image):
        """
        Extract face embeddings from PIL Image object
        """
        try:
            faces, probs = self.mtcnn(image, return_prob=True)
            
            if faces is not None:
                embeddings_list = []
                for i, face in enumerate(faces):
                    if probs[i] > self.FACE_DETECTION_THRESHOLD:
                        face_embedding = self.resnet(face.unsqueeze(0).to(self.device))
                        embeddings_list.append(face_embedding.detach().cpu().numpy())
                
                if embeddings_list:
                    return np.vstack(embeddings_list)
            
            return None
            
        except Exception as e:
            print(f"Error processing image: {e}")
            return None
    
    def recognize_face(self, face_embedding, known_embeddings_dict):
        """
        Recognize a face by comparing with known embeddings
        """
        best_match = None
        min_distance = float('inf')
        
        for student_id, data in known_embeddings_dict.items():
            known_embedding = data['embedding']
            distance = np.linalg.norm(face_embedding - known_embedding)
            
            if distance < min_distance and distance < self.FACE_RECOGNITION_THRESHOLD:
                min_distance = distance
                best_match = student_id
        
        return best_match, min_distance
    
    def process_student_registration(self, image_paths):
        """
        Process multiple images for student registration
        """
        all_embeddings = []
        
        for image_path in image_paths:
            embeddings = self.extract_face_embeddings(image_path)
            if embeddings is not None:
                all_embeddings.extend(embeddings)
        
        if not all_embeddings:
            return None
        
        return np.mean(all_embeddings, axis=0)
    
    def process_frame(self, frame, known_embeddings_dict):
        """
        Process a video frame for face recognition
        Returns Python native types for JSON serialization
        """
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb_frame)
            
            faces, probs = self.mtcnn(pil_image, return_prob=True)
            
            results = {
                'faces_detected': 0,
                'recognitions': []
            }
            
            if faces is not None:
                for i, face in enumerate(faces):
                    if probs[i] > self.FACE_DETECTION_THRESHOLD:
                        face_embedding = self.resnet(face.unsqueeze(0).to(self.device))
                        embedding_np = face_embedding.detach().cpu().numpy()[0]
                        
                        student_id, distance = self.recognize_face(embedding_np, known_embeddings_dict)
                        
                        # Convert all values to Python native types
                        recognition_result = {
                            'face_index': int(i),
                            'confidence': float(probs[i]),  # Convert to float
                            'student_id': student_id,
                            'distance': float(distance) if student_id is not None else None,  # Convert to float
                            'recognized': student_id is not None
                        }
                        
                        if student_id:
                            # Add student info (already strings, no conversion needed)
                            student_info = known_embeddings_dict[student_id]
                            recognition_result.update({
                                'name': student_info['name'],
                                'class': student_info['class']
                            })
                        
                        results['recognitions'].append(recognition_result)
                        results['faces_detected'] += 1
            
            return results
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return {
                'faces_detected': 0, 
                'recognitions': [], 
                'error': str(e)
            }

# Global instance
face_net_service = FaceNetService()