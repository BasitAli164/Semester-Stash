from flask import Blueprint, request, jsonify
import os
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.face_service import FaceRecognitionService
from app.utils.file_handlers import FileHandler
from app.models.user import User

face_bp = Blueprint('face_recognition', __name__)

@face_bp.route('/register', methods=['POST'])
@jwt_required()
def register_faces():
    """Register faces for the current user"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user:
            return jsonify({
                'message': 'User not found',
                'error': 'user_not_found'
            }), 404
        
        # Handle file uploads
        uploaded_files = request.files.getlist('images')
        saved_paths = []
        
        for file in uploaded_files:
            if file and FileHandler.allowed_file(file.filename):
                saved_path = FileHandler.save_uploaded_file(file, user_id, 'training')
                if saved_path:
                    saved_paths.append(saved_path)
        
        if not saved_paths:
            return jsonify({
                'message': 'No valid images provided',
                'error': 'no_valid_images'
            }), 400
        
        # Register faces
        face_service = FaceRecognitionService()
        success, message = face_service.register_user_faces(user_id, saved_paths)
        
        if success:
            return jsonify({
                'message': message,
                'images_processed': len(saved_paths),
                'embeddings_created': face_service.get_user_embedding_count(user_id)
            }), 200
        else:
            return jsonify({
                'message': message,
                'error': 'registration_failed'
            }), 400
            
    except Exception as e:
        return jsonify({
            'message': 'Face registration failed',
            'error': str(e)
        }), 500

@face_bp.route('/recognize', methods=['POST'])
@jwt_required()
def recognize_face():
    """Recognize a face from uploaded image"""
    try:
        # Check if image is provided
        if 'image' not in request.files and 'image_data' not in request.json:
            return jsonify({
                'message': 'No image provided',
                'error': 'missing_image'
            }), 400
        
        image_path = None
        
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            if file and FileHandler.allowed_file(file.filename):
                image_path = FileHandler.save_uploaded_file(file, 'temp', 'recognition')
        
        # Handle base64 image data (from webcam)
        elif 'image_data' in request.json:
            base64_data = request.json['image_data']
            image_path = FileHandler.save_base64_image(base64_data, 'temp', 'recognition')
        
        if not image_path:
            return jsonify({
                'message': 'Invalid image format',
                'error': 'invalid_image'
            }), 400
        
        # Recognize face
        face_service = FaceRecognitionService()
        threshold = request.json.get('threshold', 0.4)
        
        recognized_user, confidence, message = face_service.recognize_face(image_path, threshold)
        
        # Clean up temporary file
        try:
            if os.path.exists(image_path):
                os.remove(image_path)
        except:
            pass
        
        if recognized_user:
            return jsonify({
                'message': message,
                'recognized': True,
                'user': recognized_user.to_dict(),
                'confidence': confidence
            }), 200
        else:
            return jsonify({
                'message': message,
                'recognized': False,
                'confidence': confidence
            }), 200
            
    except Exception as e:
        return jsonify({
            'message': 'Face recognition failed',
            'error': str(e)
        }), 500

@face_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_face():
    """Verify if face matches current user"""
    try:
        if 'image' not in request.files and 'image_data' not in request.json:
            return jsonify({
                'message': 'No image provided',
                'error': 'missing_image'
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
        
        # Verify face - need user_id from JWT token
        user_id = get_jwt_identity()
        
        face_service = FaceRecognitionService()
        threshold = request.json.get('threshold', 0.4)
        
        verified, confidence, message = face_service.verify_face(
            image_path, 
            user_id,
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

@face_bp.route('/embeddings', methods=['GET'])
@jwt_required()
def get_user_embeddings():
    """Get embedding count for current user"""
    try:
        user_id = get_jwt_identity()
        face_service = FaceRecognitionService()
        count = face_service.get_user_embedding_count(user_id)
        
        return jsonify({
            'user_id': user_id,
            'embedding_count': count
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Failed to get embedding count',
            'error': str(e)
        }), 500

@face_bp.route('/test', methods=['GET'])
def test_face_service():
    """Test endpoint for face recognition service"""
    return jsonify({
        'message': 'Face recognition routes are working',
        'status': 'active'
    }), 200