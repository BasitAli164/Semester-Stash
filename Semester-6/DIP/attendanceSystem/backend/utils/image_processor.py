# backend/utils/image_processor.py
import numpy as np
from PIL import Image, ImageOps
import io
import base64
from typing import List, Tuple, Optional

class ImageProcessor:
    """Handles all image processing operations for the attendance system"""
    
    def __init__(self):
        from config import config
        self.config = config
    
    def base64_to_image(self, base64_string: str) -> Image.Image:
        """Convert base64 string to PIL Image"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_string)
            
            # Open image with PIL
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            return image
            
        except Exception as e:
            raise ValueError(f"Error decoding base64 image: {str(e)}")
    
    def image_to_base64(self, image: Image.Image, format: str = 'JPEG', quality: int = 85) -> str:
        """Convert PIL Image to base64 string"""
        try:
            buffer = io.BytesIO()
            image.save(buffer, format=format, quality=quality, optimize=True)
            image_data = buffer.getvalue()
            base64_encoded = base64.b64encode(image_data).decode('utf-8')
            return f"data:image/{format.lower()};base64,{base64_encoded}"
        except Exception as e:
            raise ValueError(f"Error encoding image to base64: {str(e)}")
    
    def detect_faces(self, image: Image.Image) -> Tuple[List[np.ndarray], List[Tuple[int, int, int, int]]]:
        """Detect faces in image and return face images and coordinates"""
        try:
            import cv2
            
            # Convert PIL Image to numpy array
            image_array = np.array(image)
            
            # Convert to grayscale for face detection
            if len(image_array.shape) == 3:
                gray_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            else:
                gray_array = image_array
            
            # Load face cascade classifier
            face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
            if face_cascade.empty():
                raise ValueError("Failed to load face detection classifier")
            
            # Detect faces
            faces = face_cascade.detectMultiScale(
                gray_array,
                scaleFactor=self.config.FACE_DETECTION_SCALE_FACTOR,
                minNeighbors=self.config.FACE_DETECTION_MIN_NEIGHBORS,
                minSize=self.config.FACE_DETECTION_MIN_SIZE
            )
            
            face_images = []
            face_coordinates = []
            
            for (x, y, w, h) in faces:
                # Extract face region
                face_img = gray_array[y:y+h, x:x+w]
                
                # Resize to standard size for better recognition
                face_img = cv2.resize(face_img, (200, 200))
                
                # Apply histogram equalization for better contrast
                face_img = cv2.equalizeHist(face_img)
                
                face_images.append(face_img)
                face_coordinates.append((int(x), int(y), int(w), int(h)))
            
            return face_images, face_coordinates
            
        except Exception as e:
            raise ValueError(f"Face detection failed: {str(e)}")
    
    def preprocess_face_image(self, face_image: np.ndarray, target_size: Tuple[int, int] = (200, 200)) -> np.ndarray:
        """Preprocess face image for training or recognition"""
        try:
            import cv2
            
            # Resize to target size
            face_image = cv2.resize(face_image, target_size)
            
            # Apply histogram equalization for better contrast
            face_image = cv2.equalizeHist(face_image)
            
            # Normalize pixel values
            face_image = face_image.astype(np.float32) / 255.0
            
            return face_image
            
        except Exception as e:
            raise ValueError(f"Face preprocessing failed: {str(e)}")
    
    def draw_face_boxes(self, image: Image.Image, faces_data: List[Dict]) -> Image.Image:
        """Draw bounding boxes and labels on image for visualization"""
        try:
            import cv2
            
            # Convert PIL Image to OpenCV format (BGR)
            image_cv = np.array(image)
            if image_cv.shape[2] == 3:  # RGB
                image_cv = cv2.cvtColor(image_cv, cv2.COLOR_RGB2BGR)
            elif image_cv.shape[2] == 4:  # RGBA
                image_cv = cv2.cvtColor(image_cv, cv2.COLOR_RGBA2BGR)
            
            for face in faces_data:
                x, y, w, h = face['bounding_box']
                
                if face.get('status') == 'recognized':
                    # Known face - green box
                    color = (0, 255, 0)
                    label = f"{face['name']} ({face['confidence']}%)"
                else:
                    # Unknown face - red box
                    color = (0, 0, 255)
                    label = "Unknown"
                
                # Draw bounding box
                cv2.rectangle(image_cv, (x, y), (x+w, y+h), color, 2)
                
                # Draw label background
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.6
                thickness = 2
                
                label_size = cv2.getTextSize(label, font, font_scale, thickness)[0]
                label_bg_top = max(y - label_size[1] - 10, 0)
                label_bg_bottom = y
                label_bg_right = x + label_size[0]
                
                cv2.rectangle(image_cv, 
                            (x, label_bg_top), 
                            (label_bg_right, label_bg_bottom), 
                            color, -1)
                
                # Draw label text
                cv2.putText(image_cv, label, (x, y-5), 
                          font, font_scale, (255, 255, 255), thickness)
            
            # Convert back to PIL Image (RGB)
            image_rgb = cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB)
            return Image.fromarray(image_rgb)
            
        except Exception as e:
            raise ValueError(f"Error drawing face boxes: {str(e)}")
    
    def validate_image_size(self, base64_string: str, max_size: int = None) -> bool:
        """Validate image size against maximum allowed size"""
        if max_size is None:
            max_size = self.config.MAX_IMAGE_SIZE
        
        try:
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Calculate approximate size (base64 is about 4/3 of original size)
            image_size = (len(base64_string) * 3) // 4
            
            return image_size <= max_size
            
        except Exception:
            return False
    
    def compress_image(self, image: Image.Image, max_size: Tuple[int, int] = (800, 600), 
                      quality: int = 85) -> Image.Image:
        """Compress image to reduce size while maintaining quality"""
        try:
            # Calculate scaling factor to fit within max_size while maintaining aspect ratio
            width, height = image.size
            max_width, max_height = max_size
            
            if width > max_width or height > max_height:
                # Calculate scaling factor
                scale = min(max_width/width, max_height/height)
                new_width = int(width * scale)
                new_height = int(height * scale)
                
                # Resize image
                image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            return image
            
        except Exception as e:
            raise ValueError(f"Image compression failed: {str(e)}")
    
    def enhance_image_quality(self, image: Image.Image) -> Image.Image:
        """Enhance image quality for better face detection"""
        try:
            import cv2
            
            # Convert to numpy array for OpenCV processing
            image_array = np.array(image)
            
            # Convert to different color spaces for enhancement
            if len(image_array.shape) == 3:
                # Convert to LAB color space
                lab = cv2.cvtColor(image_array, cv2.COLOR_RGB2LAB)
                
                # Apply CLAHE to L channel for contrast enhancement
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                lab[:,:,0] = clahe.apply(lab[:,:,0])
                
                # Convert back to RGB
                enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
                
                return Image.fromarray(enhanced)
            else:
                # For grayscale images, just apply CLAHE
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                enhanced = clahe.apply(image_array)
                return Image.fromarray(enhanced)
                
        except Exception as e:
            print(f"Image enhancement failed, using original: {e}")
            return image  # Return original if enhancement fails