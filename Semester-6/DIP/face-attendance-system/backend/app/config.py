import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'face-attendance-secret-key-2024'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-2024'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Database
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), '../instance/face_attendance.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads')
    STUDENT_IMAGES_FOLDER = os.path.join(UPLOAD_FOLDER, 'student_images')
    TEMP_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'temp')
    
    # Face recognition settings
    FACE_DETECTION_THRESHOLD = 0.9
    FACE_RECOGNITION_THRESHOLD = 0.8
    
    # Allowed extensions
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}