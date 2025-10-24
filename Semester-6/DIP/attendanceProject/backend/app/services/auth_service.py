from app import db, jwt
from app.models.user import User
from flask import current_app
from datetime import datetime

@jwt.user_identity_loader
def user_identity_lookup(user):
    """Register callback for user identity"""
    return user.id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Register callback for user lookup"""
    identity = jwt_data["sub"]
    return User.query.get(identity)

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    """Handle expired tokens"""
    return {
        'message': 'Token has expired',
        'error': 'token_expired'
    }, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    """Handle invalid tokens"""
    return {
        'message': 'Invalid token',
        'error': 'token_invalid'
    }, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    """Handle missing tokens"""
    return {
        'message': 'Request does not contain valid token',
        'error': 'token_missing'
    }, 401

class AuthService:
    """Service class for authentication operations"""
    
    @staticmethod
    def register_user(name, username, password, email=None, image_dir=None):
        """Register a new user"""
        try:
            # Check if user already exists
            if User.query.filter_by(username=username).first():
                return None, "Username already exists"
            
            if email and User.query.filter_by(email=email).first():
                return None, "Email already exists"
            
            # Create new user
            user = User(
                name=name,
                username=username,
                email=email,
                image_dir=image_dir
            )
            user.password = password  # This hashes the password
            
            db.session.add(user)
            db.session.commit()
            
            return user, "User registered successfully"
            
        except Exception as e:
            db.session.rollback()
            return None, f"Registration failed: {str(e)}"
    
    @staticmethod
    def authenticate_user(username, password):
        """Authenticate user and return user object if valid"""
        try:
            user = User.query.filter_by(username=username, is_active=True).first()
            
            if user and user.verify_password(password):
                return user, "Authentication successful"
            
            return None, "Invalid username or password"
            
        except Exception as e:
            return None, f"Authentication error: {str(e)}"
    
    @staticmethod
    def change_password(user_id, current_password, new_password):
        """Change user password"""
        try:
            user = User.query.get(user_id)
            if not user:
                return False, "User not found"
            
            if not user.verify_password(current_password):
                return False, "Current password is incorrect"
            
            user.password = new_password
            db.session.commit()
            
            return True, "Password changed successfully"
            
        except Exception as e:
            db.session.rollback()
            return False, f"Password change failed: {str(e)}"
    
    @staticmethod
    def get_user_profile(user_id):
        """Get user profile by ID"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None, "User not found"
            
            return user.to_dict(), "Profile retrieved successfully"
            
        except Exception as e:
            return None, f"Error retrieving profile: {str(e)}"
    
    @staticmethod
    def update_user_profile(user_id, **kwargs):
        """Update user profile"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None, "User not found"
            
            allowed_fields = ['name', 'email', 'image_dir']
            for field, value in kwargs.items():
                if field in allowed_fields and value is not None:
                    setattr(user, field, value)
            
            user.updated_at = datetime.utcnow()
            db.session.commit()
            
            return user.to_dict(), "Profile updated successfully"
            
        except Exception as e:
            db.session.rollback()
            return None, f"Profile update failed: {str(e)}"