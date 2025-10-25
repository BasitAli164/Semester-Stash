from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt_identity
from functools import wraps
from app.models.user import User
import sqlite3

def create_token(identity):
    """Create JWT token"""
    return create_access_token(identity=identity)

def jwt_required(fn):
    """JWT protection decorator"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception as e:
            return {'error': 'Invalid or expired token'}, 401
    return wrapper

def get_current_user(cursor):
    """Get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        return User.find_by_id(user_id, cursor)
    except:
        return None