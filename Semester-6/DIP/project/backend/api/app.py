from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.config.config import config
from api.models.database import db
from api.routes.auth import auth_bp
from api.routes.students import students_bp
from api.routes.attendance import attendance_bp
from api.routes.admin import admin_bp
import os

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(students_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(admin_bp)
    
    # Create tables and necessary directories
    with app.app_context():
        db.create_all()
        # Create necessary directories
        os.makedirs('storage/images', exist_ok=True)
        os.makedirs('storage/images/temp', exist_ok=True)
        os.makedirs('storage/embeddings', exist_ok=True)
        os.makedirs('instance', exist_ok=True)
    
    # JWT configuration
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has expired'}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Invalid token'}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'message': 'Authorization token is missing'}), 401
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'message': 'Internal server error'}), 500
    
    @app.errorhandler(413)
    def too_large(error):
        return jsonify({'message': 'File size too large'}), 413
    
    # Health check
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy', 
            'service': 'Facial Attendance API',
            'version': '1.0.0'
        })
    
    return app