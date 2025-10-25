from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.user import User
from app.services.face_service import FaceRecognitionService
from app.utils.file_handlers import FileHandler
import logging

logger = logging.getLogger(__name__)

student_bp = Blueprint('student', __name__)

@student_bp.route('/register', methods=['POST'])
@jwt_required()
def register_student():
    """Register new student with face images"""
    try:
        # Get form data
        name = request.form.get('name')
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        student_id = request.form.get('student_id')
        
        # Validate required fields
        if not all([name, username, password]):
            return jsonify({
                'message': 'Name, username, and password are required',
                'error': 'missing_fields'
            }), 400
        
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return jsonify({
                'message': 'Username already exists',
                'error': 'username_exists'
            }), 400
        
        # Check if student_id already exists
        if student_id and User.query.filter_by(student_id=student_id).first():
            return jsonify({
                'message': 'Student ID already exists',
                'error': 'student_id_exists'
            }), 400
        
        # Create new student
        student = User(
            name=name,
            username=username,
            email=email,
            student_id=student_id
        )
        student.password = password
        
        db.session.add(student)
        db.session.commit()
        
        # Handle face image uploads for registration
        uploaded_files = request.files.getlist('images')
        saved_paths = []
        
        for file in uploaded_files:
            if file and FileHandler.allowed_file(file.filename):
                saved_path = FileHandler.save_uploaded_file(file, student.id, 'training')
                if saved_path:
                    saved_paths.append(saved_path)
        
        # Register faces if images provided
        face_registration_success = False
        face_message = "No images provided for face registration"
        
        if saved_paths:
            face_service = FaceRecognitionService()
            success, message = face_service.register_user_faces(student.id, saved_paths)
            face_registration_success = success
            face_message = message
        
        return jsonify({
            'message': 'Student registered successfully',
            'student': student.to_dict(),
            'face_registration': {
                'success': face_registration_success,
                'message': face_message,
                'images_processed': len(saved_paths)
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error registering student: {str(e)}")
        return jsonify({
            'message': 'Failed to register student',
            'error': str(e)
        }), 500

@student_bp.route('/list', methods=['GET'])
@jwt_required()
def get_all_students():
    """Get all students with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        query = User.query
        
        if search:
            query = query.filter(
                db.or_(
                    User.name.ilike(f'%{search}%'),
                    User.username.ilike(f'%{search}%'),
                    User.student_id.ilike(f'%{search}%')
                )
            )
        
        students_pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        students_data = {
            'students': [student.to_dict() for student in students_pagination.items],
            'total': students_pagination.total,
            'pages': students_pagination.pages,
            'current_page': page
        }
        
        return jsonify({
            'message': 'Students retrieved successfully',
            'data': students_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting students: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve students',
            'error': str(e)
        }), 500

@student_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    """Get specific student details"""
    try:
        student = User.query.get(student_id)
        if not student:
            return jsonify({
                'message': 'Student not found',
                'error': 'student_not_found'
            }), 404
        
        return jsonify({
            'message': 'Student retrieved successfully',
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting student: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve student',
            'error': str(e)
        }), 500

@student_bp.route('/<int:student_id>/toggle-active', methods=['PUT'])
@jwt_required()
def toggle_student_active(student_id):
    """Toggle student active status"""
    try:
        student = User.query.get(student_id)
        if not student:
            return jsonify({
                'message': 'Student not found',
                'error': 'student_not_found'
            }), 404
        
        student.is_active = not student.is_active
        db.session.commit()
        
        action = "activated" if student.is_active else "deactivated"
        
        return jsonify({
            'message': f'Student {action} successfully',
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating student status: {str(e)}")
        return jsonify({
            'message': 'Failed to update student status',
            'error': str(e)
        }), 500

@student_bp.route('/<int:student_id>/add-faces', methods=['POST'])
@jwt_required()
def add_student_faces(student_id):
    """Add more face images for a student"""
    try:
        student = User.query.get(student_id)
        if not student:
            return jsonify({
                'message': 'Student not found',
                'error': 'student_not_found'
            }), 404
        
        # Handle file uploads
        uploaded_files = request.files.getlist('images')
        saved_paths = []
        
        for file in uploaded_files:
            if file and FileHandler.allowed_file(file.filename):
                saved_path = FileHandler.save_uploaded_file(file, student.id, 'training')
                if saved_path:
                    saved_paths.append(saved_path)
        
        if not saved_paths:
            return jsonify({
                'message': 'No valid images provided',
                'error': 'no_valid_images'
            }), 400
        
        # Register faces
        face_service = FaceRecognitionService()
        success, message = face_service.register_user_faces(student.id, saved_paths)
        
        if success:
            return jsonify({
                'message': message,
                'images_processed': len(saved_paths),
                'total_embeddings': face_service.get_user_embedding_count(student.id)
            }), 200
        else:
            return jsonify({
                'message': message,
                'error': 'face_registration_failed'
            }), 400
            
    except Exception as e:
        logger.error(f"Error adding student faces: {str(e)}")
        return jsonify({
            'message': 'Failed to add face images',
            'error': str(e)
        }), 500

@student_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_student_stats():
    """Get student statistics"""
    try:
        total_students = User.query.count()
        active_students = User.query.filter_by(is_active=True).count()
        students_with_faces = db.session.query(User).join(User.embeddings).distinct().count()
        
        stats = {
            'total_students': total_students,
            'active_students': active_students,
            'students_with_faces': students_with_faces,
            'students_without_faces': total_students - students_with_faces
        }
        
        return jsonify({
            'message': 'Student statistics retrieved successfully',
            'data': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting student stats: {str(e)}")
        return jsonify({
            'message': 'Failed to retrieve student statistics',
            'error': str(e)
        }), 500