from flask import Blueprint, request, jsonify
from app.models.user import User
from app.utils.security import create_token, jwt_required
from app.services.database_service import db_service

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        user = User.find_by_username(username, cursor)
        conn.close()
        
        if user and user.check_password(password):
            token = create_token(identity=user.id)
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_current_user():
    """Get current user info"""
    try:
        from app.utils.security import get_current_user as get_current_user_func
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        user = get_current_user_func(cursor)
        conn.close()
        
        if user:
            return jsonify({'user': user.to_dict()}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Failed to get user: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required
def logout():
    """User logout endpoint"""
    return jsonify({'message': 'Logout successful'}), 200