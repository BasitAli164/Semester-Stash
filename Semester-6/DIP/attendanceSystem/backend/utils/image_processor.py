# backend/utils/image_processor.py
import base64
import io
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import List, Dict, Tuple, Optional, Any  # Add missing imports

class ImageProcessor:
    """Handles image processing operations for face recognition"""
    
    def __init__(self):
        from config import config
        self.config = config
    
    def validate_image_size(self, image_data: str, max_size: int = None) -> bool:
        """Validate image size"""
        try:
            if max_size is None:
                max_size = self.config.MAX_IMAGE_SIZE
            
            # Calculate approximate size (base64 is about 33% larger than binary)
            if image_data.startswith('data:image'):
                # Remove data URL prefix
                image_data = image_data.split(',')[1]
            
            approximate_size = len(image_data) * 0.75
            return approximate_size <= max_size
            
        except Exception as e:
            print(f"Error validating image size: {e}")
            return False
    
    def base64_to_image(self, image_data: str) -> Image.Image:
        """Convert base64 image data to PIL Image"""
        try:
            # Handle data URL format
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            return image
            
        except Exception as e:
            raise ValueError(f"Failed to decode image: {str(e)}")
    
    def image_to_base64(self, image: Image.Image, format: str = 'JPEG') -> str:
        """Convert PIL Image to base64 string"""
        try:
            buffered = io.BytesIO()
            image.save(buffered, format=format)
            img_str = base64.b64encode(buffered.getvalue()).decode()
            return f"data:image/{format.lower()};base64,{img_str}"
            
        except Exception as e:
            raise ValueError(f"Failed to encode image: {str(e)}")
    
    def enhance_image_quality(self, image: Image.Image) -> Image.Image:
        """Enhance image quality for better face recognition"""
        try:
            # Convert PIL Image to OpenCV format
            cv_image = np.array(image)
            
            # Convert to grayscale for processing
            if len(cv_image.shape) == 3:
                gray = cv2.cvtColor(cv_image, cv2.COLOR_RGB2GRAY)
            else:
                gray = cv_image
            
            # Apply histogram equalization for better contrast
            enhanced = cv2.equalizeHist(gray)
            
            # Apply Gaussian blur to reduce noise
            enhanced = cv2.GaussianBlur(enhanced, (3, 3), 0)
            
            # Convert back to PIL Image
            if len(cv_image.shape) == 3:
                # Convert back to color
                enhanced_color = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2RGB)
                return Image.fromarray(enhanced_color)
            else:
                return Image.fromarray(enhanced)
                
        except Exception as e:
            print(f"Image enhancement failed, using original: {e}")
            return image
    
    def resize_image(self, image: Image.Image, max_width: int = 800, max_height: int = 600) -> Image.Image:
        """Resize image while maintaining aspect ratio"""
        try:
            width, height = image.size
            
            if width <= max_width and height <= max_height:
                return image
            
            # Calculate new dimensions
            ratio = min(max_width / width, max_height / height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            
            return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
        except Exception as e:
            print(f"Image resize failed: {e}")
            return image
    
    def crop_face_region(self, image: Image.Image, face_coordinates: Tuple[int, int, int, int]) -> Image.Image:
        """Crop face region from image"""
        try:
            x, y, w, h = face_coordinates
            
            # Add some padding around the face
            padding = int(min(w, h) * 0.2)
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(image.width, x + w + padding)
            y2 = min(image.height, y + h + padding)
            
            return image.crop((x1, y1, x2, y2))
            
        except Exception as e:
            print(f"Face cropping failed: {e}")
            return image
    
    def preprocess_face_image(self, face_image: Image.Image, target_size: Tuple[int, int] = (200, 200)) -> np.ndarray:
        """Preprocess face image for recognition"""
        try:
            # Convert to grayscale
            if face_image.mode != 'L':
                face_image = face_image.convert('L')
            
            # Resize to target size
            face_image = face_image.resize(target_size, Image.Resampling.LANCZOS)
            
            # Convert to numpy array
            face_array = np.array(face_image, dtype=np.uint8)
            
            # Apply histogram equalization
            face_array = cv2.equalizeHist(face_array)
            
            return face_array
            
        except Exception as e:
            raise ValueError(f"Face preprocessing failed: {str(e)}")
    
    def draw_face_boxes(self, image: Image.Image, faces_data: List[Dict]) -> Image.Image:
        """Draw bounding boxes and labels on detected faces"""
        try:
            # Create a copy of the image to draw on
            draw_image = image.copy()
            draw = ImageDraw.Draw(draw_image)
            
            # Try to load a font, fallback to default if not available
            try:
                font = ImageFont.truetype("arial.ttf", 20)
            except:
                font = ImageFont.load_default()
            
            for face in faces_data:
                if 'bounding_box' not in face:
                    continue
                
                x, y, w, h = face['bounding_box']
                
                # Determine box color based on recognition status
                if face.get('status') == 'recognized':
                    box_color = (0, 255, 0)  # Green for recognized
                    label = f"{face.get('name', 'Unknown')} ({face.get('confidence', 0)}%)"
                else:
                    box_color = (255, 0, 0)  # Red for unknown
                    label = "Unknown"
                
                # Draw bounding box
                draw.rectangle([x, y, x + w, y + h], outline=box_color, width=3)
                
                # Draw label background
                text_bbox = draw.textbbox((x, y - 25), label, font=font)
                draw.rectangle(text_bbox, fill=box_color)
                
                # Draw label text
                draw.text((x, y - 25), label, fill=(255, 255, 255), font=font)
            
            return draw_image
            
        except Exception as e:
            print(f"Error drawing face boxes: {e}")
            return image
    
    def compress_image(self, image: Image.Image, quality: int = 85) -> Image.Image:
        """Compress image while maintaining reasonable quality"""
        try:
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Compress by reducing quality
            buffered = io.BytesIO()
            image.save(buffered, format='JPEG', quality=quality, optimize=True)
            buffered.seek(0)
            
            return Image.open(buffered)
            
        except Exception as e:
            print(f"Image compression failed: {e}")
            return image
    
    def extract_faces(self, image: Image.Image) -> List[Image.Image]:
        """Extract all faces from image using OpenCV"""
        try:
            import cv2
            
            # Convert PIL Image to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            # Load face detector
            face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
            # Detect faces
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            face_images = []
            for (x, y, w, h) in faces:
                # Extract face region
                face_region = image.crop((x, y, x + w, y + h))
                face_images.append(face_region)
            
            return face_images
            
        except Exception as e:
            print(f"Face extraction failed: {e}")
            return []
    
    def get_image_info(self, image: Image.Image) -> Dict[str, Any]:
        """Get basic information about the image"""
        return {
            'size': image.size,
            'mode': image.mode,
            'format': getattr(image, 'format', 'Unknown'),
            'width': image.width,
            'height': image.height
        }