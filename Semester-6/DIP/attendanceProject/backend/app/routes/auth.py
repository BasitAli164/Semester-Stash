from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.utils.decorators import admin_required
from app.models.user import UserRole

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({
                'message': 'Username and password are required',
                'error': 'missing_credentials'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        
        # Authenticate user
        user, message = AuthService.authenticate_user(username, password)
        
        if not user:
            return jsonify({
                'message': message,
                'error': 'authentication_failed'
            }), 401
        
        # Create access token
        access_token = create_access_token(identity=user)
        
        return jsonify({
            'message': message,
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Login failed',
            'error': str(e)
        }), 500

@auth_bp.route('/register', methods=['POST'])
@admin_required
def register(current_user):
    """Register new user (Admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'username', 'password', 'role']
        if not all(field in data for field in required_fields):
            return jsonify({
                'message': 'Missing required fields',
                'error': 'missing_fields'
            }), 400
        
        # Validate role
        if data['role'] not in [role.value for role in UserRole]:
            return jsonify({
                'message': 'Invalid role',
                'error': 'invalid_role'
            }), 400
        
        # Register user
        user, message = AuthService.register_user(
            name=data['name'],
            username=data['username'],
            password=data['password'],
            role=UserRole(data['role']),
            email=data.get('email'),
            image_dir=data.get('image_dir')
        )
        
        if not user:
            return jsonify({
                'message': message,
                'error': 'registration_failed'
            }), 400
        
        return jsonify({
            'message': message,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'message': 'Registration failed',
            'error': str(e)
        }), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        user_profile, message = AuthService.get_user_profile(current_user_id)
        
        if not user_profile:
            return jsonify({
                'message': message,
                'error': 'profile_not_found'
            }), 404
        
        return jsonify({
            'message': message,
            'user': user_profile
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Failed to retrieve profile',
            'error': str(e)
        }), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Students cannot change their role
        if 'role' in data:
            return jsonify({
                'message': 'Cannot change role',
                'error': 'role_change_not_allowed'
            }), 403
        
        updated_user, message = AuthService.update_user_profile(current_user_id, **data)
        
        if not updated_user:
            return jsonify({
                'message': message,
                'error': 'update_failed'
            }), 400
        
        return jsonify({
            'message': message,
            'user': updated_user
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Profile update failed',
            'error': str(e)
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['current_password', 'new_password']
        if not all(field in data for field in required_fields):
            return jsonify({
                'message': 'Current password and new password are required',
                'error': 'missing_fields'
            }), 400
        
        user = AuthService.get_user_profile(current_user_id)[0]
        if not user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        success, message = AuthService.change_password(
            user=User.query.get(current_user_id),
            current_password=data['current_password'],
            new_password=data['new_password']
        )
        
        if not success:
            return jsonify({
                'message': message,
                'error': 'password_change_failed'
            }), 400
        
        return jsonify({
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Password change failed',
            'error': str(e)
        }), 500

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify JWT token validity"""
    try:
        current_user_id = get_jwt_identity()
        user_profile, message = AuthService.get_user_profile(current_user_id)
        
        return jsonify({
            'message': 'Token is valid',
            'user': user_profile
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Token verification failed',
            'error': str(e)
        }), 401