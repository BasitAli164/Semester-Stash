# backend/config/__init__.py (create this file if it doesn't exist)
import os
from pathlib import Path

class Config:
    """Application configuration"""
    
    # Base paths
    BASE_DIR = Path(__file__).parent.parent
    DATA_DIR = BASE_DIR / "data"
    
    # Database
    DATABASE_PATH = DATA_DIR / "attendance.db"
    
    # File paths
    FACES_DIR = DATA_DIR / "faces"
    MODELS_DIR = DATA_DIR / "models"
    ATTENDANCE_DIR = DATA_DIR / "attendance"
    TEMP_DIR = DATA_DIR / "temp"
    
    # Model files
    MODEL_FILE = MODELS_DIR / "face_model.yml"
    LABEL_MAP_FILE = MODELS_DIR / "label_map.csv"
    
    # Face detection settings
    FACE_DETECTION_SCALE_FACTOR = 1.1
    FACE_DETECTION_MIN_NEIGHBORS = 5
    FACE_DETECTION_MIN_SIZE = (100, 100)
    
    # Recognition settings
    RECOGNITION_CONFIDENCE_THRESHOLD = 85
    TRAINING_IMAGES_PER_STUDENT = 20
    MIN_IMAGES_FOR_TRAINING = 5
    
    # API settings
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Server settings
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

config = Config()