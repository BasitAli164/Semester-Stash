# my code
from flask import Blueprint, request, jsonify
import os
import sys

# Add the backend directory to Python path
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, current_dir)

from services.training_service import TrainingService
from services.attendance_service import AttendanceService
from utils.file_manager import FileManager
from models.database import DatabaseManager

# Create blueprint
system_bp = Blueprint('system', __name__)
training_service = TrainingService()
attendance_service = AttendanceService()
file_manager = FileManager()
db_manager = DatabaseManager()

@system_bp.route('/system/health', methods=['GET'])
def health_check():
    """System health check"""
    try:
        # Check database connection
        db_status = "healthy"
        try:
            db_manager.get_students_count()
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
        
        # Check file system
        fs_status = "healthy"
        try:
            file_manager.get_storage_stats()
        except Exception as e:
            fs_status = f"unhealthy: {str(e)}"
        
        # Check model status
        model_status = "ready" if attendance_service.is_model_ready() else "not trained"
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': __import__('datetime').datetime.now().isoformat(),
            'components': {
                'database': db_status,
                'file_system': fs_status,
                'face_model': model_status
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
        success, message, stats = training_service.train_model()
        
        if success:
            # Reload the model in attendance service
            attendance_service.face_recognizer.load_model()
        
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
        training_status = training_service.get_training_status()
        storage_stats = file_manager.get_storage_stats()
        model_ready = attendance_service.is_model_ready()
        
        status = {
            'training': training_status,
            'storage': storage_stats,
            'attendance': {
                'model_ready': model_ready
            },
            'database': {
                'students_count': training_service.db.get_students_count()
            },
            'system': {
                'min_images_for_training': training_service.db.config.MIN_IMAGES_FOR_TRAINING,
                'recognition_confidence_threshold': training_service.db.config.RECOGNITION_CONFIDENCE_THRESHOLD
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


# Your code
from flask import Blueprint, request, jsonify

# Create blueprint
system_bp = Blueprint('system', __name__)

@system_bp.route('/system/health', methods=['GET'])
def health_check():
    """System health check"""
    try:
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': __import__('datetime').datetime.now().isoformat()
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
        from services.attendance_service import AttendanceService
        from utils.file_manager import FileManager
        
        training_service = TrainingService()
        attendance_service = AttendanceService()
        file_manager = FileManager()
        
        training_status = training_service.get_training_status()
        storage_stats = file_manager.get_storage_stats()
        model_ready = attendance_service.is_model_ready()
        
        status = {
            'training': training_status,
            'storage': storage_stats,
            'attendance': {
                'model_ready': model_ready
            },
            'database': {
                'students_count': training_service.db.get_students_count()
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