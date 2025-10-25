from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt_identity
from functools import wraps
from app.models.user import User
import sqlite3

def create_token(identity):
    """Create JWT token - convert identity to string if it's an integer"""
    identity_str = str(identity) if isinstance(identity, int) else identity
    return create_access_token(identity=identity_str)

def jwt_required(fn):
    """JWT protection decorator"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception as e:
            print(f"❌ JWT Error: {str(e)}")
            return {'error': 'Invalid or expired token'}, 401
    return wrapper

def get_current_user(cursor):
    """Get current user from JWT token - handle string to int conversion"""
    try:
        user_id_str = get_jwt_identity()
        # Convert string back to integer for database lookup
        user_id = int(user_id_str) if user_id_str and user_id_str.isdigit() else None
        if user_id:
            return User.find_by_id(user_id, cursor)
        return None
    except Exception as e:
        print(f"❌ Error getting current user: {str(e)}")
        return None