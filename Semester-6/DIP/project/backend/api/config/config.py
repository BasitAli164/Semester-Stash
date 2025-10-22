import os
from datetime import timedelta

class Config:
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.environ.get('FLASK_DEBUG', False)
    
    # Database Configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or \
        'sqlite:///' + os.path.join(basedir, '..', '..', 'instance', 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_IMAGE_SIZE', 5000000))
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'storage/images')
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}
    
    # DeepFace Configuration
    DEEPFACE_MODEL = os.environ.get('DEEPFACE_MODEL', 'ArcFace')
    DEEPFACE_DETECTOR = os.environ.get('DEEPFACE_DETECTOR_BACKEND', 'retinaface')
    RECOGNITION_THRESHOLD = float(os.environ.get('RECOGNITION_THRESHOLD', 0.4))

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}