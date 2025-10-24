import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI', 'sqlite:///instance/attendance_system.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
    
    # File Storage
    TRAINING_IMAGES_PATH = os.environ.get('TRAINING_IMAGES_PATH', './storage/training_images')
    PROCESSED_FACES_PATH = os.environ.get('PROCESSED_FACES_PATH', './storage/processed_faces')
    MODELS_STORAGE_PATH = os.environ.get('MODELS_STORAGE_PATH', './storage/models')
    
    # DeepFace
    DEEPFACE_MODEL = os.environ.get('DEEPFACE_MODEL', 'ArcFace')
    DEEPFACE_DETECTOR_BACKEND = os.environ.get('DEEPFACE_DETECTOR_BACKEND', 'opencv')
    DEEPFACE_DISTANCE_METRIC = os.environ.get('DEEPFACE_DISTANCE_METRIC', 'cosine')
    RECOGNITION_THRESHOLD = float(os.environ.get('RECOGNITION_THRESHOLD', 0.4))
    
    # Application
    MAX_IMAGE_SIZE = int(os.environ.get('MAX_IMAGE_SIZE', 5)) * 1024 * 1024  # Convert to bytes
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}