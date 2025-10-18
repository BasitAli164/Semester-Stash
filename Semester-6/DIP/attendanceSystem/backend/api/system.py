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