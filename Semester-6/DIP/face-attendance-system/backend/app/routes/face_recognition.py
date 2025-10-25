import base64
import cv2
import numpy as np
from flask import Blueprint, request, jsonify
from app.utils.security import jwt_required
from app.services.database_service import db_service
from app.services.facenet_service import face_net_service
from app.models.student import Student
from app.config import Config

recognition_bp = Blueprint('recognition', __name__)

def convert_numpy_types(obj):
    """
    Recursively convert numpy data types to Python native types for JSON serialization
    """
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    else:
        return obj

@recognition_bp.route('/detect', methods=['POST'])
@jwt_required
def detect_faces():
    """Detect faces in an image"""
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1]  # Remove data:image/... prefix
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Get known embeddings
        conn = db_service.get_connection()
        cursor = conn.cursor()
        known_embeddings = Student.get_all_embeddings(cursor)
        conn.close()
        
        # Process frame
        results = face_net_service.process_frame(frame, known_embeddings)
        
        # Convert numpy types to Python native types for JSON serialization
        serializable_results = convert_numpy_types(results)
        
        return jsonify({
            'success': True,
            'results': serializable_results
        }), 200
        
    except Exception as e:
        print(f"Face detection error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Face detection failed: {str(e)}'}), 500

@recognition_bp.route('/recognize', methods=['POST'])
@jwt_required
def recognize_face():
    """Recognize face from embedding"""
    try:
        data = request.get_json()
        if not data or 'embedding' not in data:
            return jsonify({'error': 'No embedding data provided'}), 400
        
        face_embedding = np.array(data['embedding'])
        
        # Get known embeddings
        conn = db_service.get_connection()
        cursor = conn.cursor()
        known_embeddings = Student.get_all_embeddings(cursor)
        conn.close()
        
        # Recognize face
        student_id, distance = face_net_service.recognize_face(face_embedding, known_embeddings)
        
        result = {
            'recognized': student_id is not None,
            'student_id': student_id,
            'distance': float(distance) if distance is not None else None,  # Convert to float
            'confidence': float(1 - (distance / face_net_service.FACE_RECOGNITION_THRESHOLD)) if student_id else 0.0
        }
        
        if student_id:
            # Convert known_embeddings data to serializable format
            student_data = known_embeddings[student_id]
            result.update({
                'name': student_data['name'],
                'class': student_data['class'],
                # Don't include the embedding itself as it's too large
            })
        
        return jsonify({
            'success': True,
            'recognition': result
        }), 200
        
    except Exception as e:
        print(f"Face recognition error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Face recognition failed: {str(e)}'}), 500

@recognition_bp.route('/status', methods=['GET'])
@jwt_required
def get_system_status():
    """Get face recognition system status"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Get student count with embeddings
        cursor.execute('SELECT COUNT(*) FROM students WHERE face_embedding IS NOT NULL')
        students_with_embeddings = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM students')
        total_students = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'status': 'operational',
            'face_detection_threshold': float(face_net_service.FACE_DETECTION_THRESHOLD),
            'face_recognition_threshold': float(face_net_service.FACE_RECOGNITION_THRESHOLD),
            'students': {
                'total': int(total_students),
                'with_embeddings': int(students_with_embeddings),
                'without_embeddings': int(total_students - students_with_embeddings)
            },
            'device': str(face_net_service.device)
        }), 200
        
    except Exception as e:
        print(f"System status error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to get system status: {str(e)}'}), 500

@recognition_bp.route('/test', methods=['GET'])
@jwt_required
def test_recognition():
    """Test endpoint to verify recognition system"""
    try:
        conn = db_service.get_connection()
        cursor = conn.cursor()
        
        # Test database connection and Student model
        cursor.execute('SELECT COUNT(*) FROM students')
        total_students = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM students WHERE face_embedding IS NOT NULL')
        students_with_embeddings = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Recognition system test',
            'students': {
                'total': int(total_students),
                'with_embeddings': int(students_with_embeddings),
                'without_embeddings': int(total_students - students_with_embeddings)
            },
            'system': {
                'device': str(face_net_service.device),
                'detection_threshold': float(face_net_service.FACE_DETECTION_THRESHOLD),
                'recognition_threshold': float(face_net_service.FACE_RECOGNITION_THRESHOLD)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Test failed: {str(e)}',
            'traceback': str(e.__traceback__)
        }), 500