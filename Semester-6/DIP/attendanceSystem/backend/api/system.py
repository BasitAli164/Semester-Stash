# backend/api/system.py
from flask import Blueprint, request, jsonify
from datetime import datetime

# Create blueprint
system_bp = Blueprint('system', __name__)

@system_bp.route('/system/health', methods=['GET'])
def health_check():
    """System health check"""
    try:
        # For now, return mock health status
        # In production, this would check actual services
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'components': {
                'database': 'healthy',
                'file_system': 'healthy',
                'face_model': 'ready'
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'message': str(e)
        }), 500

@system_bp.route('/system/train', methods=['POST'])
def train_model():
    """Train the face recognition model"""
    try:
        # Import here to avoid circular imports
        from services.training_service import TrainingService
        
        training_service = TrainingService()
        success, message, stats = training_service.train_model()
        
        return jsonify({
            'success': success,
            'message': message,
            'stats': stats
        }), 200 if success else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Training error: {str(e)}'
        }), 500

@system_bp.route('/system/status', methods=['GET'])
def system_status():
    """Get complete system status"""
    try:
        from services.training_service import TrainingService
        from utils.file_manager import FileManager
        
        training_service = TrainingService()
        file_manager = FileManager()
        
        training_status = training_service.get_training_status()
        storage_stats = file_manager.get_storage_stats()
        
        status = {
            'training': training_status,
            'storage': storage_stats,
            'attendance': {
                'model_ready': training_service.file_manager.model_exists()
            },
            'database': {
                'students_count': training_service.db.get_students_count()
            },
            'system': {
                'min_images_for_training': training_service.config.MIN_IMAGES_FOR_TRAINING,
                'recognition_confidence_threshold': training_service.config.RECOGNITION_CONFIDENCE_THRESHOLD
            }
        }
        
        return jsonify({
            'success': True,
            'status': status
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting system status: {str(e)}'
        }), 500

@system_bp.route('/system/training/status', methods=['GET'])
def training_status():
    """Get training status"""
    try:
        from services.training_service import TrainingService
        training_service = TrainingService()
        
        status = training_service.get_training_status()
        
        return jsonify({
            'success': True,
            'status': status
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting training status: {str(e)}'
        }), 500

@system_bp.route('/system/training/validate', methods=['GET'])
def validate_training_data():
    """Validate training data readiness"""
    try:
        from services.training_service import TrainingService
        training_service = TrainingService()
        
        can_train, issues = training_service.validate_training_data()
        
        return jsonify({
            'success': True,
            'can_train': can_train,
            'issues': issues
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error validating training data: {str(e)}'
        }), 500

@system_bp.route('/system/storage', methods=['GET'])
def storage_info():
    """Get storage information"""
    try:
        from utils.file_manager import FileManager
        file_manager = FileManager()
        
        stats = file_manager.get_storage_stats()
        
        return jsonify({
            'success': True,
            'storage': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting storage info: {str(e)}'
        }), 500

@system_bp.route('/system/logs', methods=['GET'])
def system_logs():
    """Get system logs"""
    try:
        from models.database import DatabaseManager
        db_manager = DatabaseManager()
        
        limit = request.args.get('limit', 100, type=int)
        logs = db_manager.get_system_logs(limit)
        
        return jsonify({
            'success': True,
            'logs': logs
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting system logs: {str(e)}'
        }), 500

@system_bp.route('/system/cleanup', methods=['POST'])
def cleanup_system():
    """Clean up temporary files"""
    try:
        from utils.file_manager import FileManager
        file_manager = FileManager()
        
        file_manager.cleanup_temp_files()
        
        return jsonify({
            'success': True,
            'message': 'System cleanup completed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error during system cleanup: {str(e)}'
        }), 500
    
@system_bp.route('/system/debug/students', methods=['GET'])
def debug_students():
    """Debug endpoint to check student registration and images"""
    try:
        from models.database import DatabaseManager
        from config import config
        import os
        from pathlib import Path
        
        db = DatabaseManager()
        
        # Get all students
        students = db.get_all_students(active_only=True)
        
        student_details = []
        faces_dir = Path(config.FACES_DIR)
        
        print(f"🔍 Debug: Checking {len(students)} students")
        print(f"📁 Faces directory: {faces_dir}")
        print(f"📁 Directory exists: {faces_dir.exists()}")
        
        if faces_dir.exists():
            print(f"📁 Directory contents: {list(faces_dir.iterdir())}")
        
        for student in students:
            student_id = student['student_id']
            student_name = student['name']
            
            # Check different possible image locations
            image_locations = []
            
            # Location 1: Student subdirectory
            student_dir = faces_dir / student_id
            dir_exists = student_dir.exists()
            
            # Location 2: Flat files
            pattern = f"{student_id}_*.jpg"
            flat_files = list(faces_dir.glob(pattern))
            
            # Count images
            image_count = 0
            if dir_exists:
                image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
                for ext in image_extensions:
                    image_count += len(list(student_dir.glob(f"*{ext}")))
                    image_count += len(list(student_dir.glob(f"*{ext.upper()}")))
            else:
                image_count = len(flat_files)
            
            student_details.append({
                'student_id': student_id,
                'name': student_name,
                'images_count': image_count,
                'faces_dir_exists': dir_exists,
                'flat_files_count': len(flat_files),
                'registration_date': student.get('registration_date', 'unknown')
            })
        
        return jsonify({
            'success': True,
            'total_students': len(students),
            'faces_directory': str(faces_dir),
            'faces_directory_exists': faces_dir.exists(),
            'students': student_details
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
@system_bp.route('/system/debug/images', methods=['GET'])
def debug_images():
    """Debug endpoint to check image loading issues"""
    try:
        from services.training_service import TrainingService
        
        training_service = TrainingService()
        training_service.debug_image_loading()
        
        return jsonify({
            'success': True,
            'message': 'Debug completed - check server console for details'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Debug error: {str(e)}'
        }), 500
@system_bp.route('/system/debug/model', methods=['GET'])
def debug_model():
    """Debug the trained model and label mapping"""
    try:
        from services.training_service import TrainingService
        from utils.file_manager import FileManager
        import os
        from pathlib import Path
        
        training_service = TrainingService()
        file_manager = FileManager()
        
        # Check model file
        model_path = Path(training_service.config.MODEL_FILE)
        model_exists = model_path.exists()
        model_size = model_path.stat().st_size if model_exists else 0
        
        # Check label mapping
        label_map_path = Path(training_service.config.LABEL_MAP_FILE)
        label_map_exists = label_map_path.exists()
        
        # Check faces directory
        faces_dir = Path(training_service.config.FACES_DIR)
        faces_exist = faces_dir.exists()
        
        # Count actual images
        image_count = 0
        student_dirs = []
        if faces_exist:
            for item in faces_dir.iterdir():
                if item.is_dir():
                    student_dirs.append(item.name)
                    images = list(item.glob('*.jpg')) + list(item.glob('*.png'))
                    image_count += len(images)
        
        return jsonify({
            'success': True,
            'model': {
                'path': str(model_path),
                'exists': model_exists,
                'size_bytes': model_size
            },
            'label_map': {
                'path': str(label_map_path),
                'exists': label_map_exists
            },
            'faces_directory': {
                'path': str(faces_dir),
                'exists': faces_exist,
                'total_images': image_count,
                'student_directories': student_dirs
            },
            'training_status': training_service.get_training_status()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@system_bp.route('/system/debug/recognition', methods=['POST'])
def debug_recognition():
    """Debug face recognition process"""
    try:
        from services.recognition_service import RecognitionService
        import cv2
        import numpy as np
        from flask import request
        
        # Get image from request
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        image_data = image_file.read()
        
        # Convert to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'success': False, 'error': 'Could not decode image'}), 400
        
        recognition_service = RecognitionService()
        
        # Test face detection
        faces_detected = recognition_service.detect_faces(image)
        
        # Test recognition
        recognition_results = []
        if faces_detected:
            for face in faces_detected:
                result = recognition_service.recognize_face(face)
                recognition_results.append(result)
        
        return jsonify({
            'success': True,
            'image_info': {
                'shape': image.shape,
                'dtype': str(image.dtype)
            },
            'face_detection': {
                'faces_detected': len(faces_detected),
                'details': [{'x': f[0], 'y': f[1], 'w': f[2], 'h': f[3]} for f in faces_detected]
            },
            'recognition_results': recognition_results
        }), 200
        
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500