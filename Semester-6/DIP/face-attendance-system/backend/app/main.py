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
         origins=["http://localhost:3000"], 
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         expose_headers=["Content-Range", "X-Content-Range"]
    )
    
    JWTManager(app)
    
    # Ensure required folders exist
    ensure_folders_exist()
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(recognition_bp, url_prefix='/api/recognition')
    
    # Handle OPTIONS requests for all routes
    @app.before_request
    def handle_options():
        from flask import request
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            headers = response.headers
            headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
            headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            headers['Access-Control-Allow-Credentials'] = 'true'
            return response

    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Face Attendance API is running'}
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    print("✅ Face Attendance Backend initialized successfully!")
    print("📊 Available endpoints:")
    print("   - POST   /api/auth/login")
    print("   - GET    /api/auth/me")
    print("   - POST   /api/auth/logout")
    print("   - GET    /api/students/")
    print("   - POST   /api/students/")
    print("   - GET    /api/attendance/today")
    print("   - POST   /api/attendance/mark")
    print("   - POST   /api/recognition/detect")
    print("   - GET    /api/recognition/status")
    
    return app