from flask import jsonify, request
from werkzeug.exceptions import HTTPException
import logging
import traceback

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom API exception class"""
    def __init__(self, message, status_code=500, error_code=None, details=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details

    def to_dict(self):
        error_dict = {
            'message': self.message,
            'status': 'error',
            'status_code': self.status_code
        }
        if self.error_code:
            error_dict['error_code'] = self.error_code
        if self.details:
            error_dict['details'] = self.details
        return error_dict

class ValidationError(APIError):
    """Validation error exception"""
    def __init__(self, message, details=None):
        super().__init__(message, 400, 'validation_error', details)

class AuthenticationError(APIError):
    """Authentication error exception"""
    def __init__(self, message="Authentication failed"):
        super().__init__(message, 401, 'authentication_error')

class AuthorizationError(APIError):
    """Authorization error exception"""
    def __init__(self, message="Insufficient permissions"):
        super().__init__(message, 403, 'authorization_error')

class NotFoundError(APIError):
    """Resource not found exception"""
    def __init__(self, message="Resource not found"):
        super().__init__(message, 404, 'not_found')

class FaceRecognitionError(APIError):
    """Face recognition specific errors"""
    def __init__(self, message="Face recognition failed", details=None):
        super().__init__(message, 422, 'face_recognition_error', details)

def register_error_handlers(app):
    """Register all error handlers with the Flask app"""
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        """Handle custom API errors"""
        logger.warning(f"API Error: {error.message} (Code: {error.status_code})")
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        """Handle HTTP exceptions"""
        logger.warning(f"HTTP Error: {error.description} (Code: {error.code})")
        response = jsonify({
            'message': error.description,
            'status': 'error',
            'status_code': error.code,
            'error_code': 'http_error'
        })
        response.status_code = error.code
        return response

    @app.errorhandler(422)
    def handle_unprocessable_entity(error):
        """Handle 422 errors"""
        logger.warning(f"Unprocessable Entity: {str(error)}")
        response = jsonify({
            'message': 'Unprocessable entity - validation failed',
            'status': 'error',
            'status_code': 422,
            'error_code': 'unprocessable_entity'
        })
        response.status_code = 422
        return response

    @app.errorhandler(500)
    def handle_internal_error(error):
        """Handle 500 internal server errors"""
        logger.error(f"Internal Server Error: {str(error)}")
        logger.error(traceback.format_exc())
        
        # In production, don't expose internal error details
        if app.config.get('DEBUG'):
            details = str(error)
        else:
            details = "An internal server error occurred"
        
        response = jsonify({
            'message': 'Internal server error',
            'status': 'error',
            'status_code': 500,
            'error_code': 'internal_error',
            'details': details
        })
        response.status_code = 500
        return response

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        """Handle any unhandled exceptions"""
        logger.error(f"Unhandled Exception: {str(error)}")
        logger.error(traceback.format_exc())
        
        if app.config.get('DEBUG'):
            details = f"{type(error).__name__}: {str(error)}"
        else:
            details = "An unexpected error occurred"
        
        response = jsonify({
            'message': 'An unexpected error occurred',
            'status': 'error',
            'status_code': 500,
            'error_code': 'unexpected_error',
            'details': details
        })
        response.status_code = 500
        return response

    @app.errorhandler(413)
    def handle_file_too_large(error):
        """Handle file too large errors"""
        logger.warning(f"File too large: {str(error)}")
        response = jsonify({
            'message': 'File size exceeds maximum allowed limit',
            'status': 'error',
            'status_code': 413,
            'error_code': 'file_too_large'
        })
        response.status_code = 413
        return response

def validate_required_fields(data, required_fields):
    """Validate that required fields are present in request data"""
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            details={'missing_fields': missing_fields}
        )

def validate_email_format(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if email and not re.match(pattern, email):
        raise ValidationError("Invalid email format")

def validate_image_file(file):
    """Validate uploaded image file"""
    from app.utils.file_handlers import FileHandler
    if not file:
        raise ValidationError("No file provided")
    
    if not FileHandler.allowed_file(file.filename):
        raise ValidationError(
            "Invalid file type. Allowed types: PNG, JPG, JPEG",
            details={'allowed_extensions': ['png', 'jpg', 'jpeg']}
        )