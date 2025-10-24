from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.models.user import User, UserRole

def role_required(required_role):
    """Decorator to require specific role for access"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                current_user = User.query.get(current_user_id)
                
                if not current_user:
                    return jsonify({'message': 'User not found'}), 404
                
                if current_user.role.value != required_role and current_user.role.value != UserRole.ADMIN.value:
                    return jsonify({'message': 'Insufficient permissions'}), 403
                
                # Add user to kwargs for access in route
                kwargs['current_user'] = current_user
                return f(*args, **kwargs)
                
            except Exception as e:
                return jsonify({'message': 'Invalid token or access denied', 'error': str(e)}), 401
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator to require admin role"""
    return role_required(UserRole.ADMIN.value)(f)

def student_required(f):
    """Decorator to require student role"""
    return role_required(UserRole.STUDENT.value)(f)

def jwt_required_optional(f):
    """Decorator that verifies JWT but doesn't require it"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
            current_user_id = get_jwt_identity()
            if current_user_id:
                current_user = User.query.get(current_user_id)
                kwargs['current_user'] = current_user
            else:
                kwargs['current_user'] = None
        except Exception:
            kwargs['current_user'] = None
        
        return f(*args, **kwargs)
    return decorated_function