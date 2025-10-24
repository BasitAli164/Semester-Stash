import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class FileHandler:
    """File handling utilities for image storage"""
    
    @staticmethod
    def allowed_file(filename: str) -> bool:
        """Check if file extension is allowed"""
        allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg'})
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in allowed_extensions
    
    @staticmethod
    def save_uploaded_file(file, user_id: int, subfolder: str = 'training') -> Optional[str]:
        """
        Save uploaded file to user-specific directory
        Returns path to saved file
        """
        try:
            if not file or not FileHandler.allowed_file(file.filename):
                return None
            
            # Generate unique filename
            file_ext = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_ext}"
            
            # Create user directory
            user_dir = os.path.join(
                current_app.config['TRAINING_IMAGES_PATH'], 
                str(user_id), 
                subfolder
            )
            os.makedirs(user_dir, exist_ok=True)
            
            # Save file
            file_path = os.path.join(user_dir, unique_filename)
            file.save(file_path)
            
            logger.info(f"File saved successfully: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"File save error: {str(e)}")
            return None
    
    @staticmethod
    def save_base64_image(base64_string: str, user_id: int, filename: str = 'capture') -> Optional[str]:
        """
        Save base64 encoded image from webcam
        """
        try:
            import base64
            from io import BytesIO
            from PIL import Image
            
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_string)
            image = Image.open(BytesIO(image_data))
            
            # Create user directory
            user_dir = os.path.join(
                current_app.config['TRAINING_IMAGES_PATH'], 
                str(user_id), 
                'captures'
            )
            os.makedirs(user_dir, exist_ok=True)
            
            # Save image
            file_path = os.path.join(user_dir, f"{filename}_{uuid.uuid4().hex}.jpg")
            image.save(file_path, 'JPEG', quality=95)
            
            return file_path
            
        except Exception as e:
            logger.error(f"Base64 image save error: {str(e)}")
            return None
    
    @staticmethod
    def get_user_images(user_id: int) -> List[str]:
        """Get all training images for a user"""
        try:
            user_dir = os.path.join(
                current_app.config['TRAINING_IMAGES_PATH'], 
                str(user_id)
            )
            
            if not os.path.exists(user_dir):
                return []
            
            image_files = []
            for root, dirs, files in os.walk(user_dir):
                for file in files:
                    if FileHandler.allowed_file(file):
                        image_files.append(os.path.join(root, file))
            
            return image_files
            
        except Exception as e:
            logger.error(f"Error getting user images: {str(e)}")
            return []
    
    @staticmethod
    def cleanup_user_files(user_id: int):
        """Clean up all files for a user"""
        try:
            user_dir = os.path.join(
                current_app.config['TRAINING_IMAGES_PATH'], 
                str(user_id)
            )
            
            if os.path.exists(user_dir):
                import shutil
                shutil.rmtree(user_dir)
                logger.info(f"Cleaned up files for user {user_id}")
                
        except Exception as e:
            logger.error(f"Error cleaning up user files: {str(e)}")