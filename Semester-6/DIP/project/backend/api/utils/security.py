from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
import os
from werkzeug.utils import secure_filename

def role_required(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user = get_jwt_identity()
                if current_user.get('role') != required_role:
                    return jsonify({'message': 'Insufficient permissions'}), 403
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({'message': 'Invalid token'}), 401
        return decorated_function
    return decorator

def allowed_file(filename):
    allowed_extensions = set(os.environ.get('ALLOWED_EXTENSIONS', 'jpg,jpeg,png').split(','))
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def secure_filename_custom(filename):
    # Remove any path components and secure the filename
    filename = secure_filename(filename)
    return filename