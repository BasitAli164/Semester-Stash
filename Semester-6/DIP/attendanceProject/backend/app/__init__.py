from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_class='default'):
    """Enhanced application factory pattern with comprehensive setup"""
    app = Flask(__name__)
    
    # Load configuration
    from app.config import config
    app.config.from_object(config[config_class])
    
    # Setup logging
    from app.utils.logging_config import setup_logging
    setup_logging(app)
    
    # Load environment variables
    from app.utils.config_manager import ConfigManager
    ConfigManager.load_environment()
    
    # Validate configuration
    if not ConfigManager.validate_config(app.config):
        app.logger.error("Configuration validation failed!")
        raise RuntimeError("Invalid application configuration")
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Register error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # JWT configuration and callbacks
    from app.models.user import User
    
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user.id

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.get(identity)
    
    # Register all blueprints
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.student import student_bp
    from app.routes.face_recognition import face_bp
    from app.routes.attendance import attendance_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(face_bp, url_prefix='/api/face')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    
    # Create storage directories and perform startup tasks
    with app.app_context():
        import os
        
        # Create required directories
        os.makedirs(app.config['TRAINING_IMAGES_PATH'], exist_ok=True)
        os.makedirs(app.config['PROCESSED_FACES_PATH'], exist_ok=True)
        os.makedirs(app.config['MODELS_STORAGE_PATH'], exist_ok=True)
        
        # Clean up old temp files on startup
        from app.utils.file_handlers import FileHandler
        FileHandler.cleanup_temp_files()
        
        app.logger.info("Storage directories created and startup tasks completed")
    
    app.logger.info("Flask application initialized successfully with all components")
    return app