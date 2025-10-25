from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import config
from app.routes.auth import auth_bp
from app.routes.students import students_bp
from app.routes.attendance import attendance_bp
from app.routes.face_recognition import recognition_bp
from app.utils.helpers import ensure_folders_exist

def create_app(config_name='default'):
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions with proper CORS configuration
    CORS(app, 
         origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    JWTManager(app)
    
    # Ensure required folders exist
    ensure_folders_exist()
    
    # Register blueprints (NO TRAILING SLASHES in url_prefix)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(recognition_bp, url_prefix='/api/recognition')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Face Attendance API is running'}
    
    # Test endpoint
    @app.route('/api/test')
    def test_endpoint():
        return {
            'status': 'backend is working', 
            'timestamp': '2024-01-01T00:00:00Z',
            'cors': 'enabled'
        }
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    print("✅ Face Attendance Backend initialized successfully!")
    print("📊 Available endpoints:")
    print("   - GET    /api/health")
    print("   - GET    /api/test")
    print("   - POST   /api/auth/login")
    print("   - GET    /api/auth/me")
    print("   - POST   /api/auth/logout")
    print("   - GET    /api/students")
    print("   - POST   /api/students")
    print("   - GET    /api/attendance/today")
    print("   - POST   /api/attendance/mark")
    print("   - POST   /api/recognition/detect")
    print("   - GET    /api/recognition/status")
    
    return app