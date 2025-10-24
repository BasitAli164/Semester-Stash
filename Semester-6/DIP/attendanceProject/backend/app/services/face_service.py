import numpy as np
import logging
from typing import List, Dict, Optional, Tuple
from app import db
from app.models.user import User
from app.models.embedding import Embedding
from app.utils.image_processing import ImageProcessor
from app.utils.file_handlers import FileHandler

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    """Main service for face recognition operations"""
    
    def __init__(self, model_name: str = 'ArcFace', distance_metric: str = 'cosine'):
        self.model_name = model_name
        self.distance_metric = distance_metric
        self.recognition_threshold = 0.4  # Default threshold
    
    def register_user_faces(self, user_id: int, image_paths: List[str]) -> Tuple[bool, str]:
        """
        Register multiple faces for a user and generate embeddings
        """
        try:
            user = User.query.get(user_id)
            if not user:
                return False, "User not found"
            
            successful_embeddings = 0
            
            for image_path in image_paths:
                # Preprocess image
                processed_path = ImageProcessor.preprocess_face(image_path)
                if not processed_path:
                    logger.warning(f"Face preprocessing failed for {image_path}")
                    continue
                
                # Extract embedding
                embedding_array = ImageProcessor.extract_face_embedding(
                    processed_path, 
                    self.model_name
                )
                
                if embedding_array is not None:
                    # Save embedding to database
                    embedding = Embedding(
                        user_id=user_id,
                        model_name=self.model_name,
                        embedding=embedding_array,
                        distance_metric=self.distance_metric
                    )
                    
                    db.session.add(embedding)
                    successful_embeddings += 1
                    
                    logger.info(f"Successfully generated embedding for user {user_id}")
                else:
                    logger.warning(f"Failed to extract embedding from {processed_path}")
            
            if successful_embeddings > 0:
                db.session.commit()
                return True, f"Successfully registered {successful_embeddings} face embeddings"
            else:
                return False, "No valid face embeddings could be generated from the provided images"
                
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error registering user faces: {str(e)}")
            return False, f"Registration failed: {str(e)}"
    
    def recognize_face(self, image_path: str, threshold: float = None) -> Tuple[Optional[User], float, str]:
        """
        Recognize a face from an image
        Returns (user, confidence, message)
        """
        try:
            if threshold is None:
                threshold = self.recognition_threshold
            
            # Extract embedding from input image
            input_embedding = ImageProcessor.extract_face_embedding(image_path, self.model_name)
            if input_embedding is None:
                return None, 0.0, "No face detected or embedding extraction failed"
            
            # Get all embeddings from database
            all_embeddings = Embedding.query.filter_by(model_name=self.model_name).all()
            
            if not all_embeddings:
                return None, 0.0, "No registered faces in database"
            
            best_match = None
            best_distance = float('inf')
            best_user = None
            
            # Compare with all stored embeddings
            for stored_embedding in all_embeddings:
                stored_array = stored_embedding.get_embedding_array()
                if stored_array is None:
                    continue
                
                distance = ImageProcessor.compare_faces(
                    input_embedding, 
                    stored_array, 
                    self.distance_metric
                )
                
                if distance < best_distance:
                    best_distance = distance
                    best_match = stored_embedding
                    best_user = stored_embedding.user
            
            # Convert distance to confidence (0-1 scale, higher is better)
            confidence = max(0.0, 1.0 - best_distance)
            
            if best_distance <= threshold and best_user:
                return best_user, confidence, f"Face recognized with confidence {confidence:.2f}"
            else:
                return None, confidence, f"No match found (best distance: {best_distance:.2f}, threshold: {threshold})"
                
        except Exception as e:
            logger.error(f"Face recognition error: {str(e)}")
            return None, 0.0, f"Recognition failed: {str(e)}"
    
    def verify_face(self, image_path: str, user_id: int, threshold: float = None) -> Tuple[bool, float, str]:
        """
        Verify if a face matches a specific user
        """
        try:
            if threshold is None:
                threshold = self.recognition_threshold
            
            # Extract embedding from input image
            input_embedding = ImageProcessor.extract_face_embedding(image_path, self.model_name)
            if input_embedding is None:
                return False, 0.0, "No face detected or embedding extraction failed"
            
            # Get user's embeddings
            user_embeddings = Embedding.query.filter_by(
                user_id=user_id, 
                model_name=self.model_name
            ).all()
            
            if not user_embeddings:
                return False, 0.0, "No embeddings found for user"
            
            best_distance = float('inf')
            
            # Compare with user's embeddings
            for stored_embedding in user_embeddings:
                stored_array = stored_embedding.get_embedding_array()
                if stored_array is None:
                    continue
                
                distance = ImageProcessor.compare_faces(
                    input_embedding, 
                    stored_array, 
                    self.distance_metric
                )
                
                if distance < best_distance:
                    best_distance = distance
            
            # Convert distance to confidence
            confidence = max(0.0, 1.0 - best_distance)
            
            if best_distance <= threshold:
                return True, confidence, f"Face verified with confidence {confidence:.2f}"
            else:
                return False, confidence, f"Face verification failed (distance: {best_distance:.2f})"
                
        except Exception as e:
            logger.error(f"Face verification error: {str(e)}")
            return False, 0.0, f"Verification failed: {str(e)}"
    
    def get_user_embedding_count(self, user_id: int) -> int:
        """Get number of embeddings for a user"""
        return Embedding.query.filter_by(user_id=user_id).count()
    
    def delete_user_embeddings(self, user_id: int) -> bool:
        """Delete all embeddings for a user"""
        try:
            embeddings_deleted = Embedding.query.filter_by(user_id=user_id).delete()
            db.session.commit()
            logger.info(f"Deleted {embeddings_deleted} embeddings for user {user_id}")
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting embeddings: {str(e)}")
            return False