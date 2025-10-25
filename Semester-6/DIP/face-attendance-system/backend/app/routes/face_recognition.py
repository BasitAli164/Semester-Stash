import base64
import cv2
import numpy as np
from flask import Blueprint, request, jsonify
from app.utils.security import jwt_required
from app.services.database_service import db_service
from app.services.facenet_service import face_net_service

recognition_bp = Blueprint('recognition', __name__)

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
        
        return jsonify({
            'success': True,
            'results': results
        }), 200
        
    except Exception as e:
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
            'distance': distance,
            'confidence': 1 - (distance / face_net_service.FACE_RECOGNITION_THRESHOLD) if student_id else 0
        }
        
        if student_id:
            result.update(known_embeddings[student_id])
        
        return jsonify({
            'success': True,
            'recognition': result
        }), 200
        
    except Exception as e:
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
            'face_detection_threshold': face_net_service.FACE_DETECTION_THRESHOLD,
            'face_recognition_threshold': face_net_service.FACE_RECOGNITION_THRESHOLD,
            'students': {
                'total': total_students,
                'with_embeddings': students_with_embeddings,
                'without_embeddings': total_students - students_with_embeddings
            },
            'device': str(face_net_service.device)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get system status: {str(e)}'}), 500