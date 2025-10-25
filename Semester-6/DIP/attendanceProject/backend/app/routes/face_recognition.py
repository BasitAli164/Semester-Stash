from flask import Blueprint, request, jsonify
import os
from flask_jwt_extended import jwt_required
from app.services.face_service import FaceRecognitionService
from app.utils.file_handlers import FileHandler

face_bp = Blueprint('face_recognition', __name__)

@face_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_face():
    """Verify if face matches a specific student"""
    try:
        if 'image' not in request.files and 'image_data' not in request.json:
            return jsonify({
                'message': 'No image provided',
                'error': 'missing_image'
            }), 400
        
        student_id = request.json.get('student_id')
        if not student_id:
            return jsonify({
                'message': 'Student ID is required',
                'error': 'missing_student_id'
            }), 400
        
        image_path = None
        
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            if file and FileHandler.allowed_file(file.filename):
                image_path = FileHandler.save_uploaded_file(file, 'temp', 'verification')
        
        # Handle base64 image data
        elif 'image_data' in request.json:
            base64_data = request.json['image_data']
            image_path = FileHandler.save_base64_image(base64_data, 'temp', 'verification')
        
        if not image_path:
            return jsonify({
                'message': 'Invalid image format',
                'error': 'invalid_image'
            }), 400
        
        # Verify face
        face_service = FaceRecognitionService()
        threshold = request.json.get('threshold', 0.4)
        
        verified, confidence, message = face_service.verify_face(
            image_path, 
            student_id,
            threshold
        )
        
        # Clean up temporary file
        try:
            if os.path.exists(image_path):
                os.remove(image_path)
        except:
            pass
        
        return jsonify({
            'message': message,
            'verified': verified,
            'confidence': confidence
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Face verification failed',
            'error': str(e)
        }), 500

@face_bp.route('/test', methods=['GET'])
def test_face_service():
    """Test endpoint for face recognition service"""
    return jsonify({
        'message': 'Face recognition routes are working',
        'status': 'active'
    }), 200