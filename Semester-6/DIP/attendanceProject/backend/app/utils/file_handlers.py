import os
import uuid
import shutil
from werkzeug.utils import secure_filename
from flask import current_app
import logging
from typing import List, Optional, Tuple
from app.utils.error_handlers import ValidationError

logger = logging.getLogger(__name__)

class FileHandler:
    """Enhanced file handling utilities with error handling"""
    
    @staticmethod
    def allowed_file(filename: str) -> bool:
        """Check if file extension is allowed"""
        allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg'})
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in allowed_extensions
    
    @staticmethod
    def get_file_extension(filename: str) -> str:
        """Get file extension in lowercase"""
        return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    @staticmethod
    def generate_unique_filename(user_id: int, original_filename: str, subfolder: str = '') -> str:
        """Generate a unique filename for uploaded files"""
        file_ext = FileHandler.get_file_extension(original_filename)
        unique_id = uuid.uuid4().hex
        safe_filename = secure_filename(original_filename.rsplit('.', 1)[0])
        
        if subfolder:
            filename = f"{subfolder}_{user_id}_{safe_filename}_{unique_id}.{file_ext}"
        else:
            filename = f"{user_id}_{safe_filename}_{unique_id}.{file_ext}"
        
        return filename
    
    @staticmethod
    def create_user_directory(user_id: int, directory_type: str = 'training') -> str:
        """Create user-specific directory and return path"""
        base_path = current_app.config.get('TRAINING_IMAGES_PATH', './storage/training_images')
        user_dir = os.path.join(base_path, str(user_id), directory_type)
        
        try:
            os.makedirs(user_dir, exist_ok=True)
            return user_dir
        except Exception as e:
            logger.error(f"Error creating directory {user_dir}: {str(e)}")
            raise ValidationError(f"Could not create user directory: {str(e)}")
    
    @staticmethod
    def save_uploaded_file(file, user_id: int, subfolder: str = 'training') -> Optional[str]:
        """
        Save uploaded file to user-specific directory with enhanced error handling
        Returns path to saved file
        """
        try:
            if not file or not file.filename:
                raise ValidationError("No file provided or invalid filename")
            
            if not FileHandler.allowed_file(file.filename):
                raise ValidationError(
                    f"File type not allowed. Allowed types: {', '.join(current_app.config.get('ALLOWED_EXTENSIONS', {}))}"
                )
            
            # Check file size
            max_size = current_app.config.get('MAX_IMAGE_SIZE', 5 * 1024 * 1024)  # 5MB default
            file.seek(0, 2)  # Seek to end to get size
            file_size = file.tell()
            file.seek(0)  # Reset file pointer
            
            if file_size > max_size:
                raise ValidationError(
                    f"File size {file_size} exceeds maximum allowed {max_size}",
                    details={'max_size': max_size, 'actual_size': file_size}
                )
            
            # Generate unique filename and create directory
            filename = FileHandler.generate_unique_filename(user_id, file.filename, subfolder)
            user_dir = FileHandler.create_user_directory(user_id, subfolder)
            file_path = os.path.join(user_dir, filename)
            
            # Save file
            file.save(file_path)
            
            logger.info(f"File saved successfully: {file_path} (Size: {file_size} bytes)")
            return file_path
            
        except ValidationError:
            raise  # Re-raise validation errors
        except Exception as e:
            logger.error(f"File save error: {str(e)}")
            raise ValidationError(f"Failed to save file: {str(e)}")
    
    @staticmethod
    def save_base64_image(base64_string: str, user_id: int, filename: str = 'capture') -> Optional[str]:
        """
        Save base64 encoded image from webcam with enhanced error handling
        """
        try:
            import base64
            from io import BytesIO
            from PIL import Image
            
            if not base64_string:
                raise ValidationError("No base64 data provided")
            
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Validate base64 string
            try:
                image_data = base64.b64decode(base64_string)
            except Exception as e:
                raise ValidationError("Invalid base64 data")
            
            # Validate image data
            try:
                image = Image.open(BytesIO(image_data))
                image.verify()  # Verify it's a valid image
            except Exception as e:
                raise ValidationError("Invalid image data in base64 string")
            
            # Reset image for actual processing
            image = Image.open(BytesIO(image_data))
            
            # Create user directory
            user_dir = FileHandler.create_user_directory(user_id, 'captures')
            
            # Save image with quality settings
            unique_filename = f"{filename}_{uuid.uuid4().hex}.jpg"
            file_path = os.path.join(user_dir, unique_filename)
            
            # Convert to RGB if necessary and save as JPEG
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            image.save(file_path, 'JPEG', quality=95, optimize=True)
            
            logger.info(f"Base64 image saved successfully: {file_path}")
            return file_path
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Base64 image save error: {str(e)}")
            raise ValidationError(f"Failed to save base64 image: {str(e)}")
    
    @staticmethod
    def get_user_images(user_id: int, subfolder: str = None) -> List[str]:
        """Get all images for a user with optional subfolder filtering"""
        try:
            base_path = current_app.config.get('TRAINING_IMAGES_PATH', './storage/training_images')
            user_dir = os.path.join(base_path, str(user_id))
            
            if not os.path.exists(user_dir):
                return []
            
            image_files = []
            for root, dirs, files in os.walk(user_dir):
                # Skip if subfolder specified and doesn't match
                if subfolder and subfolder not in root:
                    continue
                    
                for file in files:
                    if FileHandler.allowed_file(file):
                        image_files.append(os.path.join(root, file))
            
            return sorted(image_files)  # Sort for consistency
            
        except Exception as e:
            logger.error(f"Error getting user images: {str(e)}")
            return []
    
    @staticmethod
    def get_file_info(file_path: str) -> Optional[dict]:
        """Get information about a file"""
        try:
            if not os.path.exists(file_path):
                return None
            
            stat = os.stat(file_path)
            return {
                'path': file_path,
                'size': stat.st_size,
                'created': stat.st_ctime,
                'modified': stat.st_mtime,
                'filename': os.path.basename(file_path)
            }
        except Exception as e:
            logger.error(f"Error getting file info: {str(e)}")
            return None
    
    @staticmethod
    def cleanup_user_files(user_id: int):
        """Clean up all files for a user with error handling"""
        try:
            base_path = current_app.config.get('TRAINING_IMAGES_PATH', './storage/training_images')
            user_dir = os.path.join(base_path, str(user_id))
            
            if os.path.exists(user_dir):
                shutil.rmtree(user_dir)
                logger.info(f"Successfully cleaned up files for user {user_id}")
            else:
                logger.info(f"No files to clean up for user {user_id}")
                
        except Exception as e:
            logger.error(f"Error cleaning up user files: {str(e)}")
            raise ValidationError(f"Failed to clean up user files: {str(e)}")
    
    @staticmethod
    def cleanup_temp_files(max_age_hours: int = 24):
        """Clean up temporary files older than specified hours"""
        try:
            import time
            base_path = current_app.config.get('TRAINING_IMAGES_PATH', './storage/training_images')
            temp_dir = os.path.join(base_path, 'temp')
            
            if not os.path.exists(temp_dir):
                return
            
            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    file_age = current_time - os.path.getmtime(file_path)
                    
                    if file_age > max_age_seconds:
                        try:
                            os.remove(file_path)
                            logger.info(f"Cleaned up old temp file: {file_path}")
                        except Exception as e:
                            logger.warning(f"Could not remove temp file {file_path}: {str(e)}")
                            
        except Exception as e:
            logger.error(f"Error cleaning up temp files: {str(e)}")