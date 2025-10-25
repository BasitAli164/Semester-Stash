from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({
                'message': 'Username and password are required',
                'error': 'missing_credentials'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        
        # Only allow admin login (you can hardcode admin credentials or set in env)
        if username != 'admin' or password != 'admin123':  # Change this in production
            return jsonify({
                'message': 'Invalid credentials',
                'error': 'authentication_failed'
            }), 401
        
        # Create admin user object for token
        admin_user = type('Obj', (object,), {'id': 1, 'username': 'admin'})()
        
        # Create access token
        access_token = create_access_token(identity=admin_user)
        
        return jsonify({
            'message': 'Admin login successful',
            'access_token': access_token,
            'user': {
                'id': 1,
                'username': 'admin',
                'name': 'System Administrator',
                'role': 'admin'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Login failed',
            'error': str(e)
        }), 500

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify JWT token validity"""
    try:
        current_user_id = get_jwt_identity()
        
        return jsonify({
            'message': 'Token is valid',
            'user': {
                'id': 1,
                'username': 'admin',
                'name': 'System Administrator',
                'role': 'admin'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Token verification failed',
            'error': str(e)
        }), 401