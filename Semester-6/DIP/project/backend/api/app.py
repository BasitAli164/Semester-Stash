from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.config.config import config
from api.models.database import db
from api.routes.auth import auth_bp
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
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'message': 'Internal server error'}), 500
    
    # Health check
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'Facial Attendance API'})
    
    return app