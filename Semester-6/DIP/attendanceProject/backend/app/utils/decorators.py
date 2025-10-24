from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User, UserRole

def role_required(required_role):
    """Decorator to require specific role for access"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                user = User.query.get(user_id)
                
                if not user:
                    return jsonify({'message': 'User not found'}), 404
                
                if user.role.value != required_role and user.role != UserRole.ADMIN:
                    return jsonify({'message': 'Insufficient permissions'}), 403
                
                # Pass the user as first argument
                return f(user, *args, **kwargs)
                
            except Exception as e:
                return jsonify({'message': 'Authentication failed', 'error': str(e)}), 401
        
        # Rename the function to avoid endpoint conflicts
        decorated_function.__name__ = f"role_required_{f.__name__}"
        return decorated_function
    return decorator


def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({'message': 'User not found'}), 404
            
            if user.role != UserRole.ADMIN:
                return jsonify({'message': 'Admin access required'}), 403
            
            # Pass the user as first argument
            return f(user, *args, **kwargs)
            
        except Exception as e:
            return jsonify({'message': 'Authentication failed', 'error': str(e)}), 401
    
    # Rename the function to avoid endpoint conflicts
    decorated_function.__name__ = f"admin_required_{f.__name__}"
    return decorated_function

def student_required(f):
    """Decorator to require student role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({'message': 'User not found'}), 404
            
            if user.role != UserRole.STUDENT:
                return jsonify({'message': 'Student access required'}), 403
            
            # Pass the user as first argument
            return f(user, *args, **kwargs)
            
        except Exception as e:
            return jsonify({'message': 'Authentication failed', 'error': str(e)}), 401
    
    # Rename the function to avoid endpoint conflicts
    decorated_function.__name__ = f"student_required_{f.__name__}"
    return decorated_function

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
    
    decorated_function.__name__ = f"jwt_optional_{f.__name__}"
    return decorated_function