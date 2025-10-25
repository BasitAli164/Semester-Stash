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
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            numpy.ndarray: Array of face embeddings or None if no faces detected
        """
        try:
            # Load image
            image = Image.open(image_path).convert('RGB')
            
            # Detect faces in the image
            faces, probs = self.mtcnn(image, return_prob=True)
            
            if faces is not None:
                embeddings_list = []
                
                for i, face in enumerate(faces):
                    if probs[i] > Config.FACE_DETECTION_THRESHOLD:  # Only use high-confidence detections
                        # Calculate embedding
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
        
        Args:
            image (PIL.Image): PIL Image object
            
        Returns:
            numpy.ndarray: Array of face embeddings or None if no faces detected
        """
        try:
            # Detect faces in the image
            faces, probs = self.mtcnn(image, return_prob=True)
            
            if faces is not None:
                embeddings_list = []
                
                for i, face in enumerate(faces):
                    if probs[i] > Config.FACE_DETECTION_THRESHOLD:
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
        
        Args:
            face_embedding (numpy.ndarray): Embedding of face to recognize
            known_embeddings_dict (dict): Dictionary of known embeddings
            
        Returns:
            tuple: (student_id, distance) or (None, None) if no match
        """
        best_match = None
        min_distance = float('inf')
        
        for student_id, data in known_embeddings_dict.items():
            known_embedding = data['embedding']
            
            # Calculate Euclidean distance between embeddings
            distance = np.linalg.norm(face_embedding - known_embedding)
            
            if distance < min_distance and distance < Config.FACE_RECOGNITION_THRESHOLD:
                min_distance = distance
                best_match = student_id
        
        return best_match, min_distance
    
    def process_student_registration(self, image_paths):
        """
        Process multiple images for student registration
        
        Args:
            image_paths (list): List of image file paths
            
        Returns:
            numpy.ndarray: Average face embedding or None if no valid faces
        """
        all_embeddings = []
        
        for image_path in image_paths:
            embeddings = self.extract_face_embeddings(image_path)
            if embeddings is not None:
                all_embeddings.extend(embeddings)
        
        if not all_embeddings:
            return None
        
        # Average the embeddings for better accuracy
        return np.mean(all_embeddings, axis=0)
    
    def process_frame(self, frame, known_embeddings_dict):
        """
        Process a video frame for face recognition
        
        Args:
            frame (numpy.ndarray): OpenCV frame
            known_embeddings_dict (dict): Known face embeddings
            
        Returns:
            dict: Recognition results
        """
        try:
            # Convert frame to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb_frame)
            
            # Detect faces
            faces, probs = self.mtcnn(pil_image, return_prob=True)
            
            results = {
                'faces_detected': 0,
                'recognitions': []
            }
            
            if faces is not None:
                for i, face in enumerate(faces):
                    if probs[i] > Config.FACE_DETECTION_THRESHOLD:
                        # Extract embedding
                        face_embedding = self.resnet(face.unsqueeze(0).to(self.device))
                        embedding_np = face_embedding.detach().cpu().numpy()[0]
                        
                        # Recognize face
                        student_id, distance = self.recognize_face(embedding_np, known_embeddings_dict)
                        
                        recognition_result = {
                            'face_index': i,
                            'confidence': float(probs[i]),
                            'student_id': student_id,
                            'distance': float(distance) if student_id else None,
                            'recognized': student_id is not None
                        }
                        
                        if student_id:
                            recognition_result.update(known_embeddings_dict[student_id])
                        
                        results['recognitions'].append(recognition_result)
                        results['faces_detected'] += 1
            
            return results
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return {'faces_detected': 0, 'recognitions': [], 'error': str(e)}

# Global instance
face_net_service = FaceNetService()