from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_class='default'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    from app.config import config
    app.config.from_object(config[config_class])
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # JWT configuration and callbacks
    from app.models.user import User  # Import User model here
    
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user.id

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.get(identity)
    
    # Register blueprints - ONLY THE ONES WE'VE CREATED SO FAR
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # COMMENT OUT OR REMOVE THESE UNTIL WE CREATE THEM:
    # from app.routes.student import student_bp
    # from app.routes.face_recognition import face_bp  
    # from app.routes.attendance import attendance_bp
    
    # app.register_blueprint(student_bp, url_prefix='/api/student')
    # app.register_blueprint(face_bp, url_prefix='/api/face')
    # app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    
    # Create storage directories
    with app.app_context():
        import os
        os.makedirs(app.config['TRAINING_IMAGES_PATH'], exist_ok=True)
        os.makedirs(app.config['PROCESSED_FACES_PATH'], exist_ok=True)
        os.makedirs(app.config['MODELS_STORAGE_PATH'], exist_ok=True)
    
    return app