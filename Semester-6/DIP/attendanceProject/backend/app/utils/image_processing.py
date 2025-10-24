import cv2
import numpy as np
import os
from PIL import Image, ImageEnhance
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Image processing utilities for face recognition"""
    
    @staticmethod
    def detect_faces(image_path: str, detector_backend: str = 'opencv') -> List[dict]:
        """
        Detect faces in an image using OpenCV
        Returns list of face regions with coordinates
        """
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not read image from {image_path}")
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Load face detector based on backend
            if detector_backend == 'opencv':
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                faces = face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(30, 30)
                )
            else:
                # For other backends, we'll use DeepFace's detection
                from deepface import DeepFace
                result = DeepFace.detectFace(img_path=image_path, detector_backend=detector_backend, enforce_detection=False)
                faces = []  # DeepFace handles detection internally
                logger.info(f"Using DeepFace detector: {detector_backend}")
            
            face_regions = []
            for (x, y, w, h) in faces:
                face_regions.append({
                    'x': int(x),
                    'y': int(y),
                    'width': int(w),
                    'height': int(h),
                    'confidence': 1.0  # OpenCV doesn't provide confidence scores
                })
            
            return face_regions
            
        except Exception as e:
            logger.error(f"Face detection error: {str(e)}")
            return []
    
    @staticmethod
    def preprocess_face(image_path: str, output_size: Tuple[int, int] = (224, 224)) -> Optional[str]:
        """
        Preprocess face image: detect, align, crop, and enhance
        Returns path to processed image
        """
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                return None
            
            # Detect faces
            faces = ImageProcessor.detect_faces(image_path)
            if not faces:
                logger.warning(f"No faces detected in {image_path}")
                return None
            
            # Use the first detected face
            face = faces[0]
            x, y, w, h = face['x'], face['y'], face['width'], face['height']
            
            # Extract face region with padding
            padding = 20
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(img.shape[1], x + w + padding)
            y2 = min(img.shape[0], y + h + padding)
            
            face_region = img[y1:y2, x1:x2]
            
            if face_region.size == 0:
                return None
            
            # Resize to target size
            face_resized = cv2.resize(face_region, output_size)
            
            # Enhance image quality
            face_enhanced = ImageProcessor.enhance_image(face_resized)
            
            # Save processed image
            processed_path = image_path.replace('.', '_processed.')
            cv2.imwrite(processed_path, face_enhanced)
            
            return processed_path
            
        except Exception as e:
            logger.error(f"Face preprocessing error: {str(e)}")
            return None
    
    @staticmethod
    def enhance_image(image: np.ndarray) -> np.ndarray:
        """Enhance image quality for better recognition"""
        try:
            # Convert to PIL Image for enhancement
            pil_img = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(pil_img)
            pil_img = enhancer.enhance(1.3)
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(pil_img)
            pil_img = enhancer.enhance(1.2)
            
            # Enhance brightness
            enhancer = ImageEnhance.Brightness(pil_img)
            pil_img = enhancer.enhance(1.1)
            
            # Convert back to OpenCV format
            enhanced_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            
            return enhanced_img
            
        except Exception as e:
            logger.error(f"Image enhancement error: {str(e)}")
            return image
    
    @staticmethod
    def validate_image_quality(image_path: str, min_face_size: int = 100) -> dict:
        """
        Validate image quality for face recognition
        Returns quality assessment
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                return {'valid': False, 'reason': 'Cannot read image'}
            
            # Check image dimensions
            height, width = img.shape[:2]
            if height < 100 or width < 100:
                return {'valid': False, 'reason': 'Image too small'}
            
            # Check for faces
            faces = ImageProcessor.detect_faces(image_path)
            if not faces:
                return {'valid': False, 'reason': 'No face detected'}
            
            # Check face size
            face = faces[0]
            if face['width'] < min_face_size or face['height'] < min_face_size:
                return {'valid': False, 'reason': 'Face too small'}
            
            # Check image brightness
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            if brightness < 50:
                return {'valid': False, 'reason': 'Image too dark'}
            if brightness > 200:
                return {'valid': False, 'reason': 'Image too bright'}
            
            # Check image blurriness
            blur_value = cv2.Laplacian(gray, cv2.CV_64F).var()
            if blur_value < 100:
                return {'valid': False, 'reason': 'Image too blurry'}
            
            return {
                'valid': True,
                'face_count': len(faces),
                'face_size': f"{face['width']}x{face['height']}",
                'brightness': brightness,
                'sharpness': blur_value
            }
            
        except Exception as e:
            return {'valid': False, 'reason': f'Validation error: {str(e)}'}
    
    @staticmethod
    def extract_face_embedding(image_path: str, model_name: str = 'ArcFace') -> Optional[np.ndarray]:
        """
        Extract face embedding using DeepFace
        Returns numpy array of embeddings
        """
        try:
            from deepface import DeepFace
            
            # Verify the image contains a face first
            validation = ImageProcessor.validate_image_quality(image_path)
            if not validation['valid']:
                logger.warning(f"Image quality validation failed: {validation['reason']}")
                return None
            
            # Extract embedding using DeepFace
            embedding_objs = DeepFace.represent(
                img_path=image_path,
                model_name=model_name,
                enforce_detection=True,
                detector_backend='opencv',
                align=True
            )
            
            if not embedding_objs:
                return None
            
            # Get the first face embedding
            embedding = embedding_objs[0]['embedding']
            
            return np.array(embedding, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"Embedding extraction error: {str(e)}")
            return None
    
    @staticmethod
    def compare_faces(embedding1: np.ndarray, embedding2: np.ndarray, metric: str = 'cosine') -> float:
        """
        Compare two face embeddings and return similarity score
        Lower score means more similar
        """
        try:
            from deepface.commons import distance as dst
            
            if metric == 'cosine':
                return dst.findCosineDistance(embedding1, embedding2)
            elif metric == 'euclidean':
                return dst.findEuclideanDistance(embedding1, embedding2)
            elif metric == 'euclidean_l2':
                return dst.findEuclideanDistance(dst.l2_normalize(embedding1), dst.l2_normalize(embedding2))
            else:
                return dst.findCosineDistance(embedding1, embedding2)
                
        except Exception as e:
            logger.error(f"Face comparison error: {str(e)}")
            return float('inf')